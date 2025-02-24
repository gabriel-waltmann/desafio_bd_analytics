export const CognitoJwtVerifier = {
  create: jest.fn().mockReturnValue({
    verify: jest.fn().mockImplementation((token) => {
      if (token === 'valid-token') return Promise.resolve({});
      return Promise.reject(new Error('Invalid token'));
    })
  })
};