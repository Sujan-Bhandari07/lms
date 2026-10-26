import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";


enum Status{
    PENDING="pending",
    SUCCESS="success",
    FAILED="failed"
}

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


   @Prop({ type: String, required: true,enum:["success","pending","failed"],default:"pending" })
  status: Status;




}


const paymentSchema = SchemaFactory.createForClass(Payments)
export {paymentSchema,PaymentsDocument}
