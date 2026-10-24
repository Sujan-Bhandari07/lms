import { REDIS_CLIENT } from "@lms/redis";
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import Redis from "ioredis";
import { ILogin, IRegister, IUpdateUser, success } from "@lms/shared";
import { InjectModel } from "@nestjs/mongoose";
import { UserDocument, Users } from "./schema/userschema";
import { Model } from "mongoose";
import { Students, StudentsDocument } from "./schema/studentprofile";
import { Tutors } from "./schema/tutorsprofie";
import bcrypt from "bcryptjs";
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";
import { MediaClient } from "@lms/medias";
@Injectable()
export class AppService {
  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    @InjectModel(Users.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Students.name)
    private readonly studentModel: Model<StudentsDocument>,
    @InjectModel(Tutors.name)
    private readonly tutorModel: Model<Tutors>,
    private readonly eventemitter: EventEmitter2,
    private readonly media: MediaClient,
  ) {}

  async register(data: IRegister) {
    const { fullname, email, password, role } = data;
    const isexistuser = await this.userModel.findOne({ email });
    if (isexistuser) {
      throw new ConflictException(`User already exist with ${email}.`);
    }
    const hashedpassword = await bcrypt.hash(password, 10);
    const profile =
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQRt_JtzhU6BiLY_rc1hxdlLoE_Cy8llGKkv-m4zl77LQ&s=10";

    const response = await fetch(profile);
    const buffer = Buffer.from(await response.arrayBuffer());

    const base64 = buffer.toString("base64");
    const url = await this.media.upload(base64, "profile");
    const user = await this.userModel.create({
      fullname,
      email,
      profilepic: url.url,
      role,
      password: hashedpassword,
    });

    if (!user) {
      throw new InternalServerErrorException(
        "Something went wrong in Database.",
      );
    }

    const token = crypto.randomUUID();

    this.redis.set(
      `session-${token}`,
      JSON.stringify({
        _id: user._id,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
        profilepic: user.profilepic,
      }),  "EX",7*24*60*60
    );

    this.eventemitter.emit("createprofile", {
      userid: user._id,
      role: user.role,
    });

    return success("User created successfully", {
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      role: user.role,
      profilepic: user.profilepic,
      token,
    });
  }

  @OnEvent("createprofile", { async: true })
  async createprofile(data: { userid: string; role: "tutor" | "student" }) {
    if (data.role == "student") {
      await this.studentModel.create({
        userid: data.userid,
      });
    } else {
      await this.tutorModel.create({
        userid: data.userid,
      });
    }
  }

  async login(data: ILogin) {
    const { email, password } = data;
    const isexistinguser = await this.userModel.findOne({ email });
    if (!isexistinguser) {
      throw new NotFoundException("User not found");
    }

    const decodedpassword = await bcrypt.compare(
      password,
      isexistinguser.password,
    );
    if (!decodedpassword) {
      throw new BadRequestException("Pls provide valid credentials.");
    }

    const token = crypto.randomUUID();

    this.redis.set(
      `session-${token}`,
      JSON.stringify({
        _id: isexistinguser._id,
        fullname: isexistinguser.fullname,
        email: isexistinguser.email,
        role: isexistinguser.role,
        profilepic: isexistinguser.profilepic,
      }),
      "EX",7*24*60*60
    );

    return {
      data: {
        _id: isexistinguser._id,
        fullname: isexistinguser.fullname,
        email: isexistinguser.email,
        role: isexistinguser.role,
        profilepic: isexistinguser.profilepic,
      },
      token,
    };
  }



  async logout(data:{token:string}){

    this.redis.del(`session-${data.token}`)
    return {
      success:true,
      message:"Logout successfull."
    }

  }


  async getprofile(data:{token:string}){
    const user= await this.redis.get(`session-${data.token}`)
    if(!user){
      throw new UnauthorizedException("pls login first.")
    }
    return success("user found",JSON.parse(user))
  }

  async updateprofile(data:IUpdateUser){
    const {fullname,password,profile,token} =data
    const user= JSON.parse(await this.redis.get(`session-${token}`))
    if(!user){
      throw new NotFoundException("User not found")
    }
    const dbuser= await this.userModel.findOne({_id:user._id})
    if(!dbuser){
        throw new NotFoundException("User not found")
    }

    if(fullname){
      dbuser.fullname=fullname
      user.fullname=fullname
    }

    if(password){
      const hashedpaswword=await bcrypt.hash(password,10)
      dbuser.password=hashedpaswword

    }
    if(profile){
      const url = await this.media.upload(profile,"profile")
      dbuser.profilepic=url.url
      user.profilepic=url.url
    }

    await dbuser.save()
    await this.redis.set(`session-${token}`,JSON.stringify(user),"KEEPTTL")


    return success("User updated successfully ",user)


    
    
  }


   


  



}
