import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import * as compression from 'compression';
import { AppModule } from './app.module';
import { PrismaService } from './database/prisma.service';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ResponseTransformInterceptor } from './common/interceptors/response-transform.interceptor';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';
import { TenantMiddleware } from './common/middleware/tenant.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });

  const config = app.get(ConfigService);
  const port = config.get<number>('app.port', 4000);
  const prefix = config.get<string>('app.apiPrefix', 'api');
  const frontendUrl = config.get<string>('app.frontendUrl', 'http://localhost:5173');

  // Security Headers
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }));

  // Compression
  app.use((compression as any)());

  // CORS
  app.enableCors({
    origin: [frontendUrl, 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-org-id', 'x-request-id'],
  });

  // API Versioning
  app.enableVersioning({ type: VersioningType.URI });
  app.setGlobalPrefix(prefix);

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Global Filters & Interceptors
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(
    new ResponseTransformInterceptor(),
    new AuditInterceptor(app.get(PrismaService)),
  );

  // Swagger Documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Symbiosis HRMS API')
    .setDescription('Enterprise HRMS & Payroll Platform v2.0 — Complete API Documentation')
    .setVersion('2.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
    .addApiKey({ type: 'apiKey', in: 'header', name: 'x-org-id' }, 'org-id')
    .addTag('Auth', 'Authentication & Session Management')
    .addTag('Organization', 'Organization, Branches, Departments')
    .addTag('Employees', 'Employee Lifecycle Management')
    .addTag('Attendance', 'Attendance Tracking & Upload')
    .addTag('Leave', 'Leave Requests & Approval')
    .addTag('Payroll', 'Payroll Calculation Engine')
    .addTag('Statutory', 'EPF, ESI, PT, TDS Compliance')
    .addTag('Reports', 'Report Generation & Export')
    .addTag('Documents', 'Document Management')
    .addTag('Helpdesk', 'Support Tickets')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`${prefix}/docs`, app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  await app.listen(port, '0.0.0.0');
  console.log(`\n🚀 Symbiosis HRMS API running on: http://localhost:${port}/${prefix}/v1`);
  console.log(`📄 Swagger Docs: http://localhost:${port}/${prefix}/docs`);
}

bootstrap();
