import { Controller } from "@nestjs/common";
import { AppService } from "./app.service";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { RegisterDto } from "@lms/shared";

@Controller()
export class AppController {
  constructor(private readonly userService: AppService) {}

  @MessagePattern("register")
  register(@Payload() data: RegisterDto) {
    console.log(data,'data drom user ')
    return this.userService.register(data);
  }
}
