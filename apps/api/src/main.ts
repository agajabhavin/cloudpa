import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: "*", credentials: true });
  app.setGlobalPrefix("api/v1");
  const port = process.env.PORT || 3001;
  const host = process.env.HOST || "0.0.0.0"; // Allow network access
  await app.listen(port, host);
  console.log(`API running on http://${host === "0.0.0.0" ? "localhost" : host}:${port}`);
  console.log(`Network access: http://<your-ip>:${port}`);
}
bootstrap();

