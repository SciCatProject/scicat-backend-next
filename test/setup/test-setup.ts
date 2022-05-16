require('tsconfig-paths/register');
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import session from "express-session";
import { AppModule } from "src/app.module";
export let app: INestApplication;

export default async function (globalConfig: any, projectConfig: any) {
  console.warn("APP INIT");
  const moduleRef: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
  app = moduleRef.createNestApplication();
  app.enableCors();
  app.setGlobalPrefix("api/v3");
  const configService = app.get(
    ConfigService,
  );
  const expressSessionSecret = configService.get<string>(
    "expressSessionSecret",
  );
  if (expressSessionSecret) {
    app.use(
      session({
        secret: expressSessionSecret,
        resave: false,
        saveUninitialized: true,
      }),
    );
  }
  await app.init();
  const port = configService.get("port")
  await app.listen(port)
  Logger.log(
    "MongoDB URI : " + configService.get<string>("mongodbUri"),
    "Main",
  );
  Logger.log("Scicat Backend listening on port: " + port, "Main");
}

