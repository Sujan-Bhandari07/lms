import { RegisterDto } from "@lms/shared";
import { Body, Controller, Inject, Post, Res } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import type { Response } from "express";
import { firstValueFrom } from "rxjs";

@Controller("users")
export class UsersController {
  constructor(
    @Inject("USERS_SERVICE") private readonly usersClient: ClientProxy,
  ) {}
  @Post("register")
  async createuser(
    @Body() data: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    console.log("data from gateway", data);

    const response = await firstValueFrom(
      this.usersClient.send("register", data),
    );
    res.cookie("token", response.payload.token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return {
      success: true,
      message: response.message,
      payload: {
        _id: response.payload._id,
        fullname: response.payload.fullname,
        email: response.payload.email,
        role: response.payload.role,
        profilepic: response.payload.profilepic,
      },
    };
  }
}
