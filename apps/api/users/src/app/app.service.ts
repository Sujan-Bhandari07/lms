import { REDIS_CLIENT } from "@lms/redis";
import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import Redis from "ioredis";
import { IRegister, success } from "@lms/shared";
import { InjectModel } from "@nestjs/mongoose";
import { UserDocument, Users } from "./schema/userschema";
import { Model } from "mongoose";
import { Students, StudentsDocument } from "./schema/studentprofile";
import { Tutors } from "./schema/tutorsprofie";
import bcrypt from "bcryptjs";
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";
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
  ) {}

  async register(data: IRegister) {
    const { fullname, email, password,  role } = data;
    const isexistuser = await this.userModel.findOne({ email });
    if (isexistuser) {
      throw new ConflictException(`User already exist with ${email}.`);
    }
    const hashedpassword = await bcrypt.hash(password, 10);
    const profile= "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQRt_JtzhU6BiLY_rc1hxdlLoE_Cy8llGKkv-m4zl77LQ&s=10"
    const user = await this.userModel.create({
      fullname,
      email,
      profilepic: profile,
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
      }),
    );

    this.eventemitter.emit("createprofile",{
      userid:user._id,
      role:user.role
    })

    return success("User created successfully",{
       _id: user._id,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
        profilepic: user.profilepic,
        token
    })
  }



  @OnEvent("createprofile",{async:true})
  async createprofile(data:{userid:string,role:"tutor" | "student"}){

    if(data.role=="student"){
      await this.studentModel.create({
        userid:data.userid
      })
    }
    else{
      await this.tutorModel.create({
        userid:data.userid
      })
    }
  }



}
