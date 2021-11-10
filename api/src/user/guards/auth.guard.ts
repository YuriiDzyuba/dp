import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ExpressRequestInterface } from '../../types/expressRequest.interface';
import { verify } from 'jsonwebtoken';
import { JWT_SECRET } from '../../config';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<ExpressRequestInterface>();

    try {
      const authHeader = request.headers.authorization;
      const token = authHeader.split(' ')[1];

      verify(token, JWT_SECRET);
    } catch {
      throw new HttpException('not authorized', HttpStatus.UNAUTHORIZED);
    }
    return true;
  }
}
