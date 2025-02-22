import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { ParameterizedContext, Next } from 'koa';
import * as CognitoService from '@/services/CognitoService';
import { AttributeListType } from 'aws-sdk/clients/cognitoidentityserviceprovider';

const awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID;

const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

const awsRegion = process.env.AWS_REGION;

const userPoolId = process.env.AWS_COGNITO_USER_POOL_ID;

const clientId = process.env.AWS_COGNITO_CLIENT_ID;



const verifier = CognitoJwtVerifier.create({
  tokenUse: 'access',
  userPoolId,
  clientId,
});

export const AuthMiddleware = async (ctx: ParameterizedContext, next: Next) => {
  try {
    const token = ctx.headers.authorization?.split(' ')[1];

    if (!token) throw new Error("Token not found");

    const validToken = await verifier.verify(token);

    if (!validToken) throw new Error("Invalid token");

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