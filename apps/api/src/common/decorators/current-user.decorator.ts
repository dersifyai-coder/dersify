import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Request } from "express";
import { SupabaseJwtPayload } from "../../auth/strategies/jwt.strategy";

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): SupabaseJwtPayload | undefined => {
    const request = context.switchToHttp().getRequest<Request & { user?: SupabaseJwtPayload }>();

    return request.user;
  },
);
