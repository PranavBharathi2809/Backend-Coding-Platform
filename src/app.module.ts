// import { Module } from '@nestjs/common';
// import { AppController } from './app.controller';
// import { AppService } from './app.service';

// @Module({
//   imports: [],
//   controllers: [AppController],
//   providers: [AppService],
// })
// export class AppModule {}


import { Module } from '@nestjs/common';
import { ExecuteModule } from './execute/execute.module';
import { ProblemModule } from './problem/problem.module';
import { TypeOrmModule } from '@nestjs/typeorm';
@Module({
  imports: [ 
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',        // or your Docker/PostgreSQL IP
      port: 5432,
      username: 'postgres',
      password: 'Bharu#2809',
      database: 'CodingPlatformDB',
      autoLoadEntities: true,  // automatically loads entities
      synchronize: true,       // use only in development!
      logging: true,
    })
    ,ExecuteModule, ProblemModule],
})
export class AppModule {}