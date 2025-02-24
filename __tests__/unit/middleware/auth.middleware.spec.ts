import { AuthMiddleware } from '../../../src/middleware/AuthMiddleware';
import { Context } from 'koa';
import * as CognitoService from '../../../src/services/CognitoService';

const awsCredentialsMock = () => ({
  awsCognitoUserPoolId: 'mock-pool-id',
  awsCognitoClientId: 'mock-client-id',
  awsRegion: 'us-east-1'
});

const cognitoUserMock = () => ([
  { Name: 'name', Value: 'John Doe' },
  { Name: 'email', Value: 'john@example.com' },
  { Name: 'custom:role', Value: 'user' },
  { Name: 'custom:isOnboarded', Value: 'false' }
]);

jest.mock('@/services/CognitoService', () => ({
  getCredentials: jest.fn().mockReturnValue(() => awsCredentialsMock()),
  getUser: jest.fn(), 
  signIn: jest.fn(),
  signUp: jest.fn(),
  updateUser: jest.fn(),
  confirmSignIn: jest.fn(),
  generateSecretHash: jest.fn()
}));

jest.mock('aws-jwt-verify', () => ({
  CognitoJwtVerifier: {
    create: jest.fn().mockReturnValue({
      verify: jest.fn().mockImplementation((token) => {
        if (token === 'valid-token') return Promise.resolve({});
        return Promise.reject(new Error('Invalid token'));
      })
    })
  }
}));

describe('Auth Middleware', () => {
  let mockContext: Partial<Context>;

  beforeEach(() => {
    mockContext = {
      header: {},
      status: 0,
      body: null,
      throw: jest.fn() as any,
      state: {}
    };
  });

  it('should block unauthenticated requests', async () => {
    await AuthMiddleware(mockContext as Context, jest.fn());

    expect(mockContext.status).toBe(401);
    expect(mockContext.body).toEqual({ error: 'Token not found' });
  });

  it('should block requests with invalid token', async () => {
    mockContext.header = { authorization: 'Bearer invalid-token' };

    await AuthMiddleware(mockContext as Context, jest.fn());

    expect(mockContext.status).toBe(401);
    expect(mockContext.body).toEqual({ error: 'Invalid token' });
  });

  it('should allow authenticated requests', async () => {
    mockContext.header = { authorization: 'Bearer valid-token' };
    (CognitoService.getUser as jest.Mock).mockResolvedValue(cognitoUserMock());
  
    const next = jest.fn();
    await AuthMiddleware(mockContext as Context, next);
  
    expect(mockContext.state?.user).toEqual({
      name: 'John Doe',
      email: 'john@example.com',
      role: 'user',
      isOnboarded: false
    });
    expect(next).toHaveBeenCalled();
  });
});