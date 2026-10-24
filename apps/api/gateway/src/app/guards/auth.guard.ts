import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthReq } from "@lms/shared";

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<AuthReq>();
    const { token } = req.cookies;
    if (!token) {
      throw new UnauthorizedException("Unauthorized ! Pls login.");
    }
    req.user = token;

    return true;
  }
}
