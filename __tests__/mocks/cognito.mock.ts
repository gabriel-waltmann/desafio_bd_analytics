jest.mock('aws-sdk', () => ({
  CognitoIdentityServiceProvider: jest.fn(() => ({
    adminInitiateAuth: jest.fn().mockImplementation((params, callback) => {
      callback(null, {
        AuthenticationResult: {
          AccessToken: 'mock-token',
          IdToken: 'mock-id-token',
          RefreshToken: 'mock-refresh-token'
        }
      });
    }),
    signUp: jest.fn().mockImplementation((params, callback) => {
      callback(null, { UserConfirmed: true });
    })
  }))
}));