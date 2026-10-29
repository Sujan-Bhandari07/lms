import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";


type Status = "pending" | "success" | "failed";

type PaymentsDocument = HydratedDocument<Payments>

@Schema({ _id: false, timestamps: true })
class User {
  @Prop({ type: String, required: true })
  userid: string;

  @Prop({ type: String, required: true })
  username: string;
}

const userSchema = SchemaFactory.createForClass(User);

@Schema({ timestamps: true })
export class Payments {
  @Prop({ type: userSchema, required: true })
  sender: User;

  @Prop({ type: userSchema, required: true })
  receiver: User;

  @Prop({ type: Number, required: true })
  amount: number;

  @Prop({ type: String, required: true })
  courseid: string;


   @Prop({ type: String, required: true })
  transaction_uuid: string;

   @Prop({ type: String })
   product_code?: string;

   @Prop({ type: String, enum: ["success", "pending", "failed"], default: "pending" })
   status: Status;

   @Prop({ type: Object })
   gateway_response?: Record<string, unknown>;

}

const paymentSchema = SchemaFactory.createForClass(Payments)
paymentSchema.index({ transaction_uuid: 1 }, { unique: true });
paymentSchema.index({ "sender.userid": 1, status: 1, courseid: 1 });
paymentSchema.index({ "receiver.userid": 1, status: 1, courseid: 1 });

export {paymentSchema,PaymentsDocument}
