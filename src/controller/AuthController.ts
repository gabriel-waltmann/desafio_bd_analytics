import { User } from "@/database/entity/UserEntiy";
import { ParameterizedContext } from "koa";
import { Repository } from "typeorm";
import * as CognitoService from "@/services/CognitoService";
import * as UserService from "@/services/UserService";
import * as AuthUtil from "@/utils/AuthUtil";

interface SignUpOrRegisterDTO {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

interface EditAccountDTO {
  name: string;
  role?: string;
}

export const signInOrRegister = async (ctx: ParameterizedContext<any>): Promise<void> => {
  try {
    const cognitoCredentias = CognitoService.getCredentials();

    const { email, name, password, confirmPassword } = ctx.request.body as SignUpOrRegisterDTO;
  
    if (!email) throw new Error("Email is required");
    
    if (!password) throw new Error("Password is required");
  
    const repository = ctx.db.getRepository(User) as Repository<User>;
  
    let user = await UserService.retrieve({ params: { email }, repository });
    
    if (!user) {
      if (!confirmPassword) throw new Error("Confirm password is required");

      if (password !== confirmPassword) throw new Error("Passwords do not match");

      const userSub = await CognitoService.signUp({
        awsRegion: cognitoCredentias.awsRegion,
        awsCognitoClientId: cognitoCredentias.awsCognitoClientId,
        awsCognitoClientSecret: cognitoCredentias.awsCognitoClientSecret,
        email,
        name,
        password,
      });

      await CognitoService.confirmSignIn({
        awsRegion: cognitoCredentias.awsRegion,
        awsCognitoUserPoolId: cognitoCredentias.awsCognitoUserPoolId,
        awsAccessKeyId: cognitoCredentias.awsAccessKeyId,
        awsSecretAccessKey: cognitoCredentias.awsSecretAccessKey,
        email,
      });

      if (!userSub) throw new Error("Internal server error");
    
      const user = await UserService.create({
        params: { name, email, role: 'user', isOnboarded: false },
        repository
      });
    
      ctx.body = { user, userSub };
  
      return;
    }
  
    const userToken = await CognitoService.signIn({
      awsRegion: cognitoCredentias.awsRegion,
      awsCognitoClientId: cognitoCredentias.awsCognitoClientId,
      awsCognitoClientSecret: cognitoCredentias.awsCognitoClientSecret,
      awsCognitoUserPoolId: cognitoCredentias.awsCognitoUserPoolId,
      awsAccessKeyId: cognitoCredentias.awsAccessKeyId,
      awsSecretAccessKey: cognitoCredentias.awsSecretAccessKey,
      email,
      password,
    });

    if (!userToken) throw new Error("Internal server error");

    ctx.body = { user, userToken };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: error.message ?? 'Internal server error' };
  }
}

export const me = async (ctx: ParameterizedContext<any>): Promise<void> => {
  try {
    const repository: Repository<User> = ctx.db.getRepository(User);
  
    const { email } = ctx.state.user;

    const user = await UserService.retrieve({ params: { email }, repository });

    if (!user) throw new Error("User not found");

    ctx.body = { user };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: error.message ?? 'Internal server error' };
  }
}

export const editAccount = async (ctx: ParameterizedContext<any>): Promise<void> => {
  try {
    const { name: newName, role: newRole } = ctx.request.body as EditAccountDTO;
    const token = AuthUtil.getToken(ctx);
  
    const repository: Repository<User> = ctx.db.getRepository(User);
  
    const { email, role } = ctx.state.user;
  
    let user = await UserService.retrieve({ params: { email }, repository });
  
    if (!user) throw new Error("User not found");
    
    if (role === 'admin') {
      await CognitoService.updateUser({ token, name: newName, role: newRole, isOnboarded: false });
      await UserService.update({ repository, params: { ...user, name: newName, role: newRole } });
    } else {
      await CognitoService.updateUser({ token, name: newName, role, isOnboarded: true });
      await UserService.update({ repository, params: { ...user, name: newName, isOnboarded: true }});
    }
    
    user = await UserService.retrieve({ params: { email }, repository });

    ctx.body = { user };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: error.message ?? 'Internal server error' };
  }
}

export const users = async (ctx: ParameterizedContext<any>): Promise<void> => {
  try {
    const repository: Repository<User> = ctx.db.getRepository(User);

    const { role } = ctx.state.user;

    if (role !== 'admin') throw new Error("Unauthorized");

    const users = await UserService.retrieves({ repository });

    ctx.body = { users };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: error.message ?? 'Internal server error' };
  }
}
