import request from 'supertest';
import app from '../../src/app';
import DataSource from '../../src/database/DataSource';
import * as UserService from "../../src/services/UserService"

const awsCredentialsMock = () => ({
  awsCognitoUserPoolId: 'mock-pool-id',
  awsCognitoClientId: 'mock-client-id',
  awsRegion: 'us-east-1'
})

const cognitoUserMock = () => ([
  { Name: 'name', Value: 'John Doe' },
  { Name: 'email', Value: 'john@example.com' },
  { Name: 'custom:role', Value: 'admin' },
  { Name: 'custom:isOnboarded', Value: 'false' }
]);

const userMock = () => ({
  id: 1,
  name: 'User Test',
  email: 'usertest@test.com',
  role: 'admin',
  isOnboarded: true,
});

const serEditedMock = () => ({
  id: 1,
  name: 'User Test Edited',
  email: 'usertestedited@test.com',
  role: 'admin',
  isOnboarded: true,
});

jest.mock('aws-sdk', () => ({
  CognitoIdentityServiceProvider: jest.fn(() => ({

    signUp: jest.fn().mockImplementation((params, callback) => {
      callback(null, { UserSub: {} });
    }),

    adminConfirmSignUp: jest.fn().mockImplementation((params, callback) => {
      callback(null, {});
    }),
  })),

  config: {
    update: jest.fn().mockImplementation((params, callback) => {}),
  },
}));

jest.mock('../../src/services/UserService', () => ({
  create: jest.fn(() => userMock()),
  retrieve: jest.fn(() => userMock()),
  update: jest.fn(() => serEditedMock()),
  retrieves: jest.fn(() => [userMock(), userMock(), userMock()]),
}));

jest.mock('../../src/services/CognitoService', () => ({
  getUser: jest.fn(() => cognitoUserMock()),
  getCredentials: jest.fn().mockReturnValue(() => awsCredentialsMock()),
  signIn: jest.fn(() => "valid-token"),
  signUp: jest.fn().mockReturnValue(() => ({ UserSub: {} })),
  updateUser: jest.fn(() => serEditedMock()),
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

describe('Auth E2E Tests', () => {
  beforeAll(async () => {
    if (!DataSource.isInitialized) {
      await DataSource.initialize();
    }
    app.context.db = DataSource;
    await DataSource.synchronize(true);
  });

  afterAll(async () => {
    if (DataSource.isInitialized) {
      await DataSource.destroy();
    }

    app.removeAllListeners();
  });

  it('POST /auth - should register new user', async () => {
    const response = await request(app.callback())
      .post('/auth')
      .send({
        name: "User Test",
        email: "usertest@test.com",
        password: "UserTest1234!",
        confirmPassword: "UserTest1234!"
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('user');
  }, 10000);

  it('POST /auth - should login new user', async () => {
    const response = await request(app.callback())
      .post('/auth')
      .send({
        email: "usertest@test.com",
        password: "UserTest1234!",
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('user');
    expect(response.body).toHaveProperty('userToken');
  }, 10000);

  it('GET /me - should get user by token', async () => {
    const response = await request(app.callback())
      .get('/me')
      .set('Authorization', 'Bearer valid-token');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('user');
    expect(response.body.user).toEqual(userMock());
  }, 10000);

  it('PATCH /edit-account - should return edited user', async () => {
    (UserService.retrieve as jest.Mock).mockResolvedValue(serEditedMock());
    
    const response = await request(app.callback())
      .patch('/edit-account')
      .set('Authorization', 'Bearer valid-token')
      .send({ name: "User Test Edited", role: "user" });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('user');
    expect(response.body.user).toEqual(serEditedMock());
  }, 10000);

  it('GET /users - should return users', async () => {   
    (UserService.retrieves as jest.Mock).mockResolvedValue([userMock(), userMock(), userMock()]);

    const response = await request(app.callback())
      .get('/users')
      .set('Authorization', 'Bearer valid-token');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('users');
  }, 10000);
});