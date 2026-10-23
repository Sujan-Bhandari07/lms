import { DynamicModule, Module } from '@nestjs/common';
import { MongooseModule, ModelDefinition } from '@nestjs/mongoose';
import "dotenv/config"

@Module({})
export class DbModule {
  static forRoot(uri?: string): DynamicModule {
    return {
      module: DbModule,
      imports: [
        MongooseModule.forRootAsync({
          // runs at bootstrap, after dotenv has loaded
          useFactory: () => {
            const mongoUri = uri ?? process.env["MONGO_URI"];
            if (!mongoUri) throw new Error('MONGODB_URI is not set');
            return { uri: mongoUri };
          },
        }),
      ],
      exports: [MongooseModule],
    };
  }

  static forFeature(models: ModelDefinition[]): DynamicModule {
    return {
      module: DbModule,
      imports: [MongooseModule.forFeature(models)],
      exports: [MongooseModule],
    };
  }
}