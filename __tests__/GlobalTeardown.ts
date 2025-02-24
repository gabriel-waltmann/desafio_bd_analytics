import dataSource from '../src/database/DataSource';

export default async () => {
  if (process.env.NODE_ENV === 'test') {
    await dataSource.dropDatabase();
    await dataSource.destroy();
  }
};