import { Inject, Module } from '@nestjs/common';
import { MovieModule } from './movie/movie.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Joi from 'joi';
import { Movie } from './movie/entity/movie.entity';
import { MovieDetail } from './movie/entity/movie-detail.entity';
import { DirectorModule } from './director/director.module';
import { Director } from './director/entity/director.entity';
import { GenreModule } from './genre/genre.module';
import { Genre } from './genre/entity/genre.entity';
import { UserModule } from './user/user.module';
import { User } from './user/entities/user.entity';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 그 어떤 모듈에서든 config 모듈에 등록된 환경변수를 사용할 수 있도록 함
      validationSchema: Joi.object({
        ENV: Joi.string().valid('dev', 'prod').required(), // valid = 해당 값만 가능
        DB_TYPE: Joi.string().valid('postgres').required(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_DATABASE: Joi.string().required(),
        HASH_ROUNDS: Joi.number().required(),
        REFRESH_TOKEN_SECRET: Joi.string().required(),
        ACCESS_TOKEN_SECRET: Joi.string().required()
      })
    }), // ConfigModule 안에 Config 서비스를 이용하여 TypeOrm에 환경변수를 inject 함 -> 왜?

    // 비동기, 왜 비동기인가? ConfigModule IoC 컨데이너에 생성되고 그 값을 입력 받음 -> 즉, 처리되는 동안 대기 해야함
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: configService.get<string>('DB_TYPE') as "postgres",
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [
          Movie,
          MovieDetail,
          Director,
          Genre,
          User
        ],
        synchronize: true,
      }),
      inject: [ConfigService]
    }),
    // TypeOrmModule.forRoot({
    //   type: process.env.DB_TYPE as "postgres",
    //   host: process.env.DB_HOSt,
    //   port: parseInt(process.env.DB_PORT as "5432"),
    //   username: process.env.DB_USERNAME,
    //   password: process.env.DB_PASSWORD,
    //   database: process.env.DB_DATABASE,
    //   entities: [],
    //   synchronize: true, // 코드와 맞게 DB를 싱크를 맞추는 설정, 실제 프로덕션에서 싱크 설정시 위험함
    // }),
    MovieModule,
    DirectorModule,
    GenreModule,
    UserModule,
    AuthModule
  ],
})
export class AppModule { }
