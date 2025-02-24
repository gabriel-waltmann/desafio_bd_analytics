import dataSource from '../src/database/DataSource';

export default async () => {
  const isTest = process.env.NODE_ENV === 'test';

  if (isTest && !dataSource.isInitialized) {
    await dataSource.initialize();
    await dataSource.synchronize(true);
  }
};