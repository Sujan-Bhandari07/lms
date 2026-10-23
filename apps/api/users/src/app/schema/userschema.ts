import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import {HydratedDocument } from "mongoose"









export type UserDocument = HydratedDocument<Users>


@Schema({timestamps:true})
export class Users{

    @Prop({type:String,required:true})
    fullname:string




     @Prop({type:String, unique:true,required:true})
    email:string


     @Prop({type:String,required:true ,minlength:6})
    password:string

     @Prop({type:String,required:true,enum:["student","tutor"]})
    role:"student" | "tutor"

     @Prop({type:String,required:true})
    profilepic:string


}
export const Userschema = SchemaFactory.createForClass(Users)