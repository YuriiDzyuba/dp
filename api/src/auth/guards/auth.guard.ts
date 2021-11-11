import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ExpressRequestInterface } from '../../types/expressRequest.interface';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<ExpressRequestInterface>();

    if (request.currentUser) {
      return true;
    }

    throw new HttpException(
      "you don't have permission to access",
      HttpStatus.FORBIDDEN,
    );
  }
}
