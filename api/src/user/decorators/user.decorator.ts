import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ExpressRequestInterface } from '../../types/expressRequest.interface';

export const User = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<ExpressRequestInterface>();

    if (!request.currentUser) return null;

    if (data) return request.currentUser[data];

    return request.currentUser;
  },
);
