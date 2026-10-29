import {
  BadGatewayException,
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import * as cp from "crypto-js";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Payments, PaymentsDocument } from "./schema/payment.schema";
import { ICreatePayment, ICreateSignature, IVerifyPayment, success } from "@lms/shared";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(
    @InjectModel(Payments.name)
    private readonly paymentmodel: Model<PaymentsDocument>,
    private readonly config: ConfigService,
  ) {}

  async createSignature(data: ICreateSignature) {
    const { transaction_uuid, product_code, total_amount } = data;
    const hash = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
    const sign = cp.HmacSHA256(hash, this.requiredConfig("ESEWA_SECRET"));
    const signature = cp.enc.Base64.stringify(sign);
    if (!signature) throw new BadRequestException("cannot create a signature.");
    return success("Signature created", signature);
  }

  async initiatePayment(data: ICreatePayment) {
    if (!Number.isFinite(data.amount) || data.amount <= 0) {
      throw new BadRequestException("A positive payment amount is required.");
    }

    const product_code = this.esewaConfig("ESEWA_PRODUCT_CODE", "EPAYTEST");
    const gateway_url = this.esewaConfig(
      "ESEWA_FORM_URL",
      "https://rc-epay.esewa.com.np/api/epay/main/v2/form",
    );
    const signed = await this.createSignature({
      total_amount: data.amount,
      transaction_uuid: data.transaction_uuid,
      product_code,
    });
    const payment = await this.createPendingPayment({ ...data, product_code });
    this.logger.log(
      `Prepared eSewa test payment transaction_uuid=${payment.transaction_uuid} product_code=${product_code} total_amount=${payment.amount}`,
    );

    return success("Payment prepared.", {
      amount: payment.amount,
      total_amount: payment.amount,
      transaction_uuid: payment.transaction_uuid,
      product_code,
      signature: signed.payload,
      gateway_url,
    });
  }

  async createPayment(data: ICreatePayment) {
    const product_code = this.config.get<string>("ESEWA_PRODUCT_CODE");
    const payment = await this.createPendingPayment({ ...data, product_code });
    return success("Payment created successfully", payment);
  }

  async getChatPurchases(data: { userid: string; role: "student" | "tutor" }) {
    if (!data.userid?.trim() || !["student", "tutor"].includes(data.role)) {
      throw new BadRequestException("Invalid chat purchase query.");
    }
    const filter = {
      status: "success" as const,
      ...(data.role === "student"
        ? { "sender.userid": data.userid }
        : { "receiver.userid": data.userid }),
    };
    const purchases = await this.paymentmodel
      .find(filter)
      .select("sender.userid receiver.userid courseid")
      .lean();
    return purchases.map((purchase) => ({
      studentId: purchase.sender.userid,
      instructorId: purchase.receiver.userid,
      courseId: purchase.courseid,
    }));
  }

  async getPaymentAttempt(data: IVerifyPayment) {
    const { callback, payment } = await this.getOwnedPaymentAttempt(data);
    return success("Payment attempt found.", {
      courseid: payment.courseid,
      transaction_uuid: payment.transaction_uuid,
      status: payment.status,
      callback_status: callback.status,
    });
  }

  async verifyPayment(data: IVerifyPayment) {
    const { callback, payment } = await this.getOwnedPaymentAttempt(data);
    this.logger.log(
      `Verifying eSewa test payment transaction_uuid=${callback.transaction_uuid} product_code=${callback.product_code} total_amount=${callback.total_amount} callback_status=${callback.status}`,
    );
    if (payment.status !== "success") {
      const query = new URLSearchParams({
        product_code: payment.product_code ?? "",
        total_amount: String(payment.amount),
        transaction_uuid: payment.transaction_uuid,
      });
      let response: Response;
      try {
        response = await fetch(
          `${this.esewaConfig(
            "ESEWA_STATUS_URL",
            "https://rc.esewa.com.np/api/epay/transaction/status/",
          )}?${query}`,
          { signal: AbortSignal.timeout(10000) },
        );
      } catch (error) {
        const detail = error instanceof Error ? error.message : "unknown error";
        this.logger.error(
          `eSewa status request failed transaction_uuid=${payment.transaction_uuid}: ${detail}`,
        );
        throw new BadGatewayException("Could not reach eSewa to verify the payment.");
      }

      this.logger.log(
        `eSewa status response transaction_uuid=${payment.transaction_uuid} http_status=${response.status}`,
      );
      let responseText: string;
      try {
        responseText = await response.text();
      } catch (error) {
        const detail = error instanceof Error ? error.message : "unknown error";
        this.logger.error(
          `Could not read eSewa status response transaction_uuid=${payment.transaction_uuid}: ${detail}`,
        );
        throw new BadGatewayException("Could not read eSewa's verification response.");
      }

      if (!response.ok) {
        this.logger.warn(
          `eSewa status request rejected transaction_uuid=${payment.transaction_uuid} http_status=${response.status} response=${this.responseMessage(responseText)}`,
        );
        throw new BadGatewayException(
          `eSewa verification request failed (${response.status}).`,
        );
      }

      let responseBody: unknown;
      try {
        responseBody = JSON.parse(responseText);
      } catch (error) {
        if (error instanceof SyntaxError) {
          this.logger.warn(
            `eSewa returned invalid JSON transaction_uuid=${payment.transaction_uuid} http_status=${response.status}`,
          );
          throw new BadGatewayException("eSewa returned an invalid verification response.");
        }
        throw error;
      }
      if (
        !responseBody ||
        typeof responseBody !== "object" ||
        Array.isArray(responseBody)
      ) {
        throw new BadGatewayException("eSewa returned an invalid verification response.");
      }
      const result = responseBody as {
        status?: string;
        product_code?: string;
        total_amount?: string | number;
        transaction_uuid?: string;
        [key: string]: unknown;
      };
      if (
        typeof result.status !== "string" ||
        result.status.trim().toLowerCase() !== "complete" ||
        result.product_code !== payment.product_code ||
        result.transaction_uuid !== payment.transaction_uuid ||
        (typeof result.total_amount !== "string" &&
          typeof result.total_amount !== "number") ||
        !Number.isFinite(Number(result.total_amount)) ||
        Number(result.total_amount) !== payment.amount
      ) {
        this.logger.warn(
          `eSewa payment verification rejected transaction_uuid=${payment.transaction_uuid} status=${result.status ?? "unknown"} product_code_match=${result.product_code === payment.product_code} transaction_uuid_match=${result.transaction_uuid === payment.transaction_uuid} total_amount_match=${Number(result.total_amount) === payment.amount}`,
        );
        throw new BadRequestException(
          `Payment is not complete (eSewa status: ${result.status ?? "unknown"}).`,
        );
      }
      this.logger.log(
        `eSewa payment confirmed transaction_uuid=${payment.transaction_uuid} product_code=${result.product_code} total_amount=${result.total_amount} status=${result.status}`,
      );

      const updated = await this.paymentmodel.updateOne(
        { _id: payment._id, status: "pending" },
        { $set: { status: "success", gateway_response: result } },
      );
      if (updated.modifiedCount === 1) {
        return success("Payment verified.", {
          courseid: payment.courseid,
          transaction_uuid: payment.transaction_uuid,
          status: "success",
          already_verified: false,
        });
      }
    }

    const verifiedPayment = await this.paymentmodel.findById(payment._id);
    if (verifiedPayment?.status !== "success") {
      throw new ConflictException("The payment is still pending verification.");
    }
    return success("Payment verified.", {
      courseid: payment.courseid,
      transaction_uuid: payment.transaction_uuid,
      status: "success",
      already_verified: true,
    });
  }

  private async getOwnedPaymentAttempt(data: IVerifyPayment) {
    const callback = this.decodePaymentData(data.data);
    const payment = await this.paymentmodel.findOne({
      transaction_uuid: callback.transaction_uuid,
    });
    if (!payment) throw new BadRequestException("No pending order matches this payment.");
    if (payment.sender.userid !== data.studentid) {
      throw new BadRequestException("This payment does not belong to the signed-in student.");
    }
    if (
      Number(callback.total_amount) !== payment.amount ||
      callback.product_code !== payment.product_code
    ) {
      throw new BadRequestException("Payment details do not match the pending order.");
    }
    return { callback, payment };
  }

  private async createPendingPayment(
    data: ICreatePayment & { product_code?: string },
  ) {
    try {
      return await this.paymentmodel.create({
        amount: data.amount,
        courseid: data.courseid,
        transaction_uuid: data.transaction_uuid,
        sender: data.sender,
        receiver: data.receiver,
        ...(data.product_code && { product_code: data.product_code }),
      });
    } catch (error) {
      if (
        error instanceof Error &&
        "code" in error &&
        error.code === 11000
      ) {
        throw new ConflictException("This payment attempt already exists.");
      }
      throw error;
    }
  }

  private decodePaymentData(data: string) {
    const normalizedData = data.replace(/ /g, "+");
    if (!/^[A-Za-z0-9+/_-]+={0,2}$/.test(normalizedData)) {
      throw new BadRequestException("Invalid eSewa payment response.");
    }
    const decoded = Buffer.from(
      normalizedData.replace(/-/g, "+").replace(/_/g, "/"),
      "base64",
    ).toString("utf8");
    let responseValue: unknown;
    try {
      responseValue = JSON.parse(decoded);
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new BadRequestException("Invalid eSewa payment response.");
      }
      throw error;
    }
    if (
      !responseValue ||
      typeof responseValue !== "object" ||
      Array.isArray(responseValue)
    ) {
      throw new BadRequestException("Invalid eSewa payment response.");
    }
    const response = responseValue as Record<string, unknown>;
    if (
      typeof response.transaction_uuid !== "string" ||
      typeof response.product_code !== "string" ||
      (typeof response.total_amount !== "string" &&
        typeof response.total_amount !== "number") ||
      (response.status !== undefined && typeof response.status !== "string")
    ) {
      throw new BadRequestException("Invalid eSewa payment response.");
    }
    return {
      transaction_uuid: response.transaction_uuid,
      product_code: response.product_code,
      total_amount: response.total_amount,
      status: typeof response.status === "string" ? response.status : "unknown",
    };
  }

  private requiredConfig(key: string) {
    const value = this.config.getOrThrow<string>(key).trim();
    if (!value) {
      throw new InternalServerErrorException(`${key} is not configured.`);
    }
    return value;
  }

  private esewaConfig(key: string, testDefault: string) {
    const environment = this.config.get<string>("ESEWA_ENV")?.trim().toLowerCase();
    if (environment && environment !== "test") {
      throw new InternalServerErrorException(
        "Only eSewa test payments are enabled in this development environment.",
      );
    }
    const configured = this.config.get<string>(key)?.trim();
    if (configured && configured !== testDefault) {
      throw new InternalServerErrorException(
        `${key} must use the configured eSewa test value.`,
      );
    }
    return testDefault;
  }

  private responseMessage(responseText: string) {
    try {
      const body: unknown = JSON.parse(responseText);
      if (body && typeof body === "object" && !Array.isArray(body)) {
        const response = body as Record<string, unknown>;
        for (const key of ["message", "error", "status"]) {
          if (typeof response[key] === "string") return response[key];
        }
      }
    } catch (error) {
      if (!(error instanceof SyntaxError)) throw error;
    }
    return "no response message";
  }
}
