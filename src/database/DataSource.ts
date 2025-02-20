import { DataSourceOptions } from 'typeorm';
import { DataSource } from "typeorm"
import dotenv from 'dotenv';

dotenv.config();

const { DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME } = process.env;

const config: DataSourceOptions = {
  type: "postgres",
  host: DB_HOST ?? "localhost",
  port: Number(DB_PORT) ?? 5432,
  username: DB_USERNAME ?? "postgres",
  password: DB_PASSWORD ?? "postgres",
  database: DB_NAME ?? "postgres",
  synchronize: true,
  logging: false,
  entities: ["src/database/entity/**/*.ts"],
  migrations: ["src/database/migration/**/*.ts"],
  subscribers: ["src/database/subscriber/**/*.ts"]
};

export default new DataSource(config);