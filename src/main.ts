import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

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

  const configService: ConfigService<Record<string, unknown>, false> = app.get(
    ConfigService,
  );
  const port = configService.get<number>("port") ?? 3000;
  Logger.log(
    "MongoDB URI : " + configService.get<string>("mongodbUri"),
    "Main",
  );
  Logger.log("Scicat Backend listening on port: " + port, "Main");

  await app.listen(port);
}
bootstrap();
