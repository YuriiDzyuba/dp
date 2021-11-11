import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { ExpressRequestInterface } from '../../types/expressRequest.interface';
import { verify } from 'jsonwebtoken';
import { ACCESS_JWT_SECRET } from '../../config';
import { UserService } from '../user.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly userService: UserService) {}
  async use(req: ExpressRequestInterface, res: Response, next: NextFunction) {
    if (!req.headers.authorization) {
      req.currentUser = null;
      next();
      return;
    }

    const tokenName = req.headers.authorization.split(' ')[0];

    if (tokenName !== 'access') {
      req.currentUser = null;
      next();
      return;
    }

    const token = req.headers.authorization.split(' ')[1];

    try {
      const decodedUserData = verify(token, ACCESS_JWT_SECRET);
      const user = await this.userService.findUserById(decodedUserData.id);

      req.currentUser = user;
    } catch (err) {
      throw new HttpException('not authorized', HttpStatus.UNAUTHORIZED);
    }

    next();
  }
}
