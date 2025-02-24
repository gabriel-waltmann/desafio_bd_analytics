import request from 'supertest';
import app from '../../src/app';
import DataSource from '../../src/database/DataSource';

jest.mock('aws-sdk', () => ({
  CognitoIdentityServiceProvider: jest.fn(() => ({
    adminInitiateAuth: jest.fn().mockImplementation((params, callback) => {
      callback(null, { 
        AuthenticationResult: { AccessToken: "mock-tocken" },
      });
    }),

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

    console.log(response.body);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('user');
    expect(response.body).toHaveProperty('userToken');
  }, 10000);
});