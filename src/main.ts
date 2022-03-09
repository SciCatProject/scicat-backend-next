import * as session from "express-session";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { registerHelper } from "handlebars";
import { formatCamelCase, unwrapJSON } from "./common/handlebars-helpers";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.setGlobalPrefix("api/v3");
  const config = new DocumentBuilder()
    .setTitle("Dacat API")
    .setDescription("SciCat backend API")
    .setVersion("4.0.0")
    .addTag("scicat")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("explorer-next", app, document);

  registerHelper("unwrapJSON", (json) => unwrapJSON(json));
  registerHelper("keyToWord", (string) => formatCamelCase(string));
  registerHelper("eq", (a, b) => a === b);

  const configService: ConfigService<Record<string, unknown>, false> = app.get(
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

  const port = configService.get<number>("port") ?? 3000;
  Logger.log(
    "MongoDB URI : " + configService.get<string>("mongodbUri"),
    "Main",
  );
  Logger.log("Scicat Backend listening on port: " + port, "Main");

  await app.listen(port);
}
bootstrap();
