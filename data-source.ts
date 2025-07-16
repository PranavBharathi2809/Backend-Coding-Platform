// data-source.ts
import 'reflect-metadata'; // important for TypeORM decorators
import { DataSource } from 'typeorm';
import { Problem } from './src/problem/entities/problem.entity'; // ✅ FIXED: make path relative
// import all migrations if needed (optional for CLI autoload from glob)

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'Bharu#2809',
  database: 'CodingPlatformDB',
  entities: ['./src/**/*.entity.ts'], // ✅ allows multiple entities if added later
  migrations: ['./src/migrations/*.ts'],
  synchronize: false,
  logging: true,
});
