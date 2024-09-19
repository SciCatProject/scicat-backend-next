import session from "express-session";
import { json } from "body-parser";
import { NestFactory } from "@nestjs/core";
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule,
} from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { Logger, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AllExceptionsFilter, ScicatLogger } from "./loggers/logger.service";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  const configService: ConfigService<Record<string, unknown>, false> = app.get(
    ConfigService,
  );
  const apiVersion = configService.get<string>("versions.api") ?? "v3";
  const swaggerPath = `${configService.get<string>("swaggerPath")}`;

  const scicatLogger = app.get<ScicatLogger>(ScicatLogger);

  app.useLogger(scicatLogger);

  app.useGlobalFilters(new AllExceptionsFilter(scicatLogger));

  app.enableCors();

  app.setGlobalPrefix(`api/${apiVersion}`);
  const config = new DocumentBuilder()
    .setTitle("SciCat backend API")
    .setDescription("This is the API for the SciCat Backend")
    .setVersion(`api/${apiVersion}`)
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  const swaggerOptions: SwaggerCustomOptions = {
    swaggerOptions: {
      docExpansion: "none",
    },
  };

  SwaggerModule.setup(swaggerPath, app, document, swaggerOptions);

  app.useGlobalPipes(
    /**
     * Reference: https://docs.nestjs.com/techniques/validation#auto-validation
     */
    new ValidationPipe({
      // Make sure that there's no unexpected data
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,

      /**
       * Detailed error messages since this is 4xx
       */
      disableErrorMessages: false,
      validationError: {
        /**
         * WARNING: Avoid exposing the values in the error output (could leak sensitive information)
         */
        value: false,
      },

      /**
       * Transform the JSON into a class instance when possible.
       * Depends on the type of the data on the controllers
       */
      transform: true,
    }),
  );

  app.use(json({ limit: "16mb" }));

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

  const port = configService.get<number>("port") ?? 3000;
  Logger.log(
    "MongoDB URI : " + configService.get<string>("mongodbUri"),
    "Main",
  );
  Logger.log("Scicat Backend listening on port: " + port, "Main");

  await app.listen(port);
}
bootstrap();
