import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),
  apiPrefix: process.env.API_PREFIX || 'api',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL || '60000', 10),
    limit: parseInt(process.env.THROTTLE_LIMIT || '100', 10),
  },
  loginThrottle: {
    ttl: parseInt(process.env.LOGIN_THROTTLE_TTL || '900000', 10),
    limit: parseInt(process.env.LOGIN_THROTTLE_LIMIT || '5', 10),
  },
  fieldEncryptionKey: process.env.FIELD_ENCRYPTION_KEY || '',
  pdfServiceUrl: process.env.PDF_SERVICE_URL || 'http://localhost:5000',
  pdfServiceSecret: process.env.PDF_SERVICE_SECRET || '',
}));
