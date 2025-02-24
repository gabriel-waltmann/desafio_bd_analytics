import { ParameterizedContext } from "koa";

export const getToken = (ctx: ParameterizedContext<any>): string | null => {
  if (!ctx.header?.authorization) return null;

  return ctx.header.authorization.split(' ')[1] ?? null;
}
