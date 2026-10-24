import { Controller } from "@nestjs/common";
import { AppService } from "./app.service";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { LoginDto, LogoutDto, RegisterDto, UUpdateUserDto } from "@lms/shared";

@Controller()
export class AppController {
  constructor(private readonly userService: AppService) {}

  @MessagePattern("register")
  register(@Payload() data: RegisterDto) {

    return this.userService.register(data);
  }

  @MessagePattern("login")
  login( @Payload()  data:LoginDto){
    return this.userService.login(data)

  }

  @MessagePattern("logout")
  logout( @Payload()  data:LogoutDto){
    return this.userService.logout(data)

  }

   @MessagePattern("getprofile")
  getprofile( @Payload()  data:LogoutDto){
    return this.userService.getprofile(data)

  }


    @MessagePattern("updateprofile")
  updateprofile( @Payload()  data:UUpdateUserDto){
    return this.userService.updateprofile(data)

  }


 




}
