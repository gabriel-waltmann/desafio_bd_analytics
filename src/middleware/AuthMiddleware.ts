import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { ParameterizedContext, Next } from 'koa';
import { AttributeListType } from 'aws-sdk/clients/cognitoidentityserviceprovider';
import * as CognitoService from '@/services/CognitoService';
import * as AuthUtil from "@/utils/AuthUtil";

const credentials = CognitoService.getCredentials();

const verifier = CognitoJwtVerifier.create({
  tokenUse: 'access',
  userPoolId: credentials.awsCognitoUserPoolId,
  clientId: credentials.awsCognitoClientId,
});

export const AuthMiddleware = async (ctx: ParameterizedContext, next: Next) => {
  try {
    const token = AuthUtil.getToken(ctx);

    if (!token) throw new Error("Token not found");

    try {
      await verifier.verify(token);
    } catch (err) {
      throw new Error("Invalid token");
    }

    const cognitoUser: AttributeListType = await CognitoService.getUser({ token });

    const user = {
      name: cognitoUser.find((attr) => attr.Name === 'name')?.Value,
      email: cognitoUser.find((attr) => attr.Name === 'email')?.Value,
      role: cognitoUser.find((attr) => attr.Name === 'custom:role')?.Value,
      isOnboarded: cognitoUser.find((attr) => attr.Name === 'custom:isOnboarded')?.Value === 'true',
    };

    ctx.state.user = user;
    
    await next();
  } catch (err) {
    ctx.status = 401;
    ctx.body = { error: err.message || 'Invalid token' };
  }
};