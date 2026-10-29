import { ArgumentsHost, HttpStatus, Logger } from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";
import { firstValueFrom, TimeoutError } from "rxjs";
import { describe, expect, it, vi } from "vitest";
import { GatewayExceptionFilter } from "@lms/filters";
import { ServiceExceptionFilter } from "@lms/filters";
import { sanitizeDiagnosticText } from "@lms/filters";

function createHttpHost(response: {
  status: ReturnType<typeof vi.fn>;
  json: ReturnType<typeof vi.fn>;
}): ArgumentsHost {
  return {
    switchToHttp: () => ({ getResponse: () => response }),
  } as unknown as ArgumentsHost;
}

describe("exception filters", () => {
  it("redacts credentials, tokens, and cookie values from diagnostics", () => {
    const diagnostic = sanitizeDiagnosticText(
      "amqp://guest:secret@localhost password=secret token=abc Cookie: session=abc",
    );

    expect(diagnostic).not.toContain("secret");
    expect(diagnostic).not.toContain("session=abc");
    expect(diagnostic).not.toContain("token=abc");
  });

  it("maps a gateway RxJS timeout to 504 without exposing stack details", () => {
    const response = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    new GatewayExceptionFilter().catch(
      new TimeoutError(),
      createHttpHost(response),
    );

    expect(response.status).toHaveBeenCalledWith(HttpStatus.GATEWAY_TIMEOUT);
    expect(response.json).toHaveBeenCalledWith({
      success: false,
      message: "A downstream service timed out.",
    });
  });

  it("logs the downstream exception stack but hides internal 500 details", () => {
    const logger = vi
      .spyOn(Logger.prototype, "error")
      .mockImplementation(() => undefined);
    const response = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    new GatewayExceptionFilter().catch(
      new RpcException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: "database connection details",
        stack: "downstream stack",
      }),
      createHttpHost(response),
    );

    expect(response.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(response.json).toHaveBeenCalledWith({
      success: false,
      message: "Something went wrong",
    });
    expect(logger).toHaveBeenCalledWith(
      expect.stringContaining("downstream stack"),
    );
    logger.mockRestore();
  });

  it("serializes downstream timeouts as an internal 504 RPC error", async () => {
    const result = new ServiceExceptionFilter().catch(
      new TimeoutError(),
      {} as ArgumentsHost,
    );

    await expect(firstValueFrom(result)).rejects.toMatchObject({
      success: false,
      statusCode: HttpStatus.GATEWAY_TIMEOUT,
      message: "A downstream service timed out.",
    });
  });
});
