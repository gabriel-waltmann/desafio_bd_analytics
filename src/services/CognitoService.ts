import crypto from 'crypto';
import AWS from 'aws-sdk';

export const getCredentials = () => {
  return {
    awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,

    awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,

    awsCognitoClientId: process.env.AWS_COGNITO_CLIENT_ID,
  
    awsCognitoClientSecret: process.env.AWS_COGNITO_CLIENT_SECRET,

    awsCognitoUserPoolId: process.env.AWS_COGNITO_USER_POOL_ID,

    awsRegion: process.env.AWS_REGION,
  };
}

interface GenerateSecretHashDTO {
  awsCognitoClientId: string;
  awsCognitoClientSecret: string;
  username: string;
}
export const generateSecretHash = (props: GenerateSecretHashDTO): string => {
  const { awsCognitoClientId, awsCognitoClientSecret, username } = props;

  return crypto.createHmac('SHA256', awsCognitoClientSecret)
    .update(username + awsCognitoClientId)
    .digest('base64');
}

interface SignUpDTO {
  awsRegion: string;
  awsCognitoClientId: string;
  awsCognitoClientSecret: string;
  name: string;
  email: string;
  password: string;
}
export const signUp = async (props: SignUpDTO): Promise<string> => {
  const userPool = new AWS.CognitoIdentityServiceProvider({ region: props.awsRegion });
  
  const secretHash = generateSecretHash({
    username: props.email,
    awsCognitoClientSecret: props.awsCognitoClientSecret,
    awsCognitoClientId: props.awsCognitoClientId
  });

  return await new Promise((resolve, reject) => {
    userPool.signUp({
      ClientId: props.awsCognitoClientId,
      Username: props.email,
      Password: props.password,
      SecretHash: secretHash,
      UserAttributes: [
        { Name: 'name', Value: props.name },
        { Name: 'email', Value: props.email },
        { Name: 'custom:role', Value: 'user' },
        { Name: 'custom:isOnboarded', Value: 'false' },
      ],
    }, async (err, { UserSub }) => {
      if (err) {
        console.error(err);
        return reject(err);
      }
    
      return resolve(UserSub);
    });
  });
}

interface ConfirmSignInDTO {
  awsAccessKeyId: string;
  awsSecretAccessKey: string;
  awsRegion: string;
  awsCognitoUserPoolId: string;
  email: string;
}
export const confirmSignIn = async (props: ConfirmSignInDTO): Promise<void> => {
  const userPool = new AWS.CognitoIdentityServiceProvider({ region: props.awsRegion });

  return await new Promise((resolve, reject) => {
    AWS.config.update({
      accessKeyId: props.awsAccessKeyId,
      secretAccessKey: props.awsSecretAccessKey,
      region: props.awsRegion,
    });

    userPool.adminConfirmSignUp({
      UserPoolId: props.awsCognitoUserPoolId,
      Username: props.email,
    }, (err) => {
      if (err) {
        console.error(err);
        return reject(err);
      }
      
      return resolve();
    });    
  });
}

interface SignInDTO {
  awsAccessKeyId: string;
  awsSecretAccessKey: string;
  awsRegion: string;
  awsCognitoUserPoolId: string;
  awsCognitoClientId: string;
  awsCognitoClientSecret: string;
  email: string;
  password: string;
}
export const signIn = async (props: SignInDTO): Promise<string> => {
  const userPool = new AWS.CognitoIdentityServiceProvider({ region: props.awsRegion });

  const SECRET_HASH = generateSecretHash({
    awsCognitoClientId: props.awsCognitoClientId,
    awsCognitoClientSecret: props.awsCognitoClientSecret,
    username: props.email
  });

  return await new Promise((resolve, reject) => {
    AWS.config.update({
      accessKeyId: props.awsAccessKeyId,
      secretAccessKey: props.awsSecretAccessKey,
      region: props.awsRegion,
    });

    userPool.adminInitiateAuth({
      AuthFlow: 'ADMIN_NO_SRP_AUTH',
      ClientId: props.awsCognitoClientId,
      UserPoolId: props.awsCognitoUserPoolId,
      AuthParameters: {
        USERNAME: props.email,
        PASSWORD: props.password,
        SECRET_HASH,
      },
    }, async (err, authResult) => {
      if (err) {
        console.error(err);
        return reject(err);
      }
        
      return resolve(authResult?.AuthenticationResult.AccessToken);
    });
  });
}

interface GetUserDTO { token: string }
export const getUser = async (props: GetUserDTO): Promise<any> => {
  const userPool = new AWS.CognitoIdentityServiceProvider({ region: process.env.AWS_REGION });

  return await new Promise((resolve, reject) => {
    userPool.getUser({
      AccessToken: props.token,
    }, async (err, result) => {
      if (err) {
        console.error(err);
        return reject(err);
      }
    
      return resolve(result.UserAttributes);
    });
  });
}

interface UpdateUserDTO { 
  token: string,
  name: string,
  role: string,
  isOnboarded: boolean
}
export const updateUser = async (props: UpdateUserDTO): Promise<any> => {
  const userPool = new AWS.CognitoIdentityServiceProvider({ region: process.env.AWS_REGION });

  return await new Promise((resolve, reject) => {
    userPool.updateUserAttributes({
      AccessToken: props.token,
      UserAttributes: [
        { Name: 'name', Value: props.name },
        { Name: 'custom:role', Value: props.role },
        { Name: 'custom:isOnboarded', Value: props.isOnboarded.toString() },
      ],
    }, async (err, result) => {
      if (err) {
        console.error(err);
        return reject(err);
      }
    
      console.log(result);

      return resolve(result);
    });
  });
}