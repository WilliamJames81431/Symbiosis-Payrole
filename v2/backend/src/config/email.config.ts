import { registerAs } from '@nestjs/config';

export default registerAs('email', () => ({
  provider: process.env.EMAIL_PROVIDER || 'smtp',
  smtp: {
    host: process.env.SMTP_HOST || 'localhost',
    port: parseInt(process.env.SMTP_PORT || '1025', 10),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
  from: {
    name: process.env.EMAIL_FROM_NAME || 'Symbiosis HRMS',
    address: process.env.EMAIL_FROM_ADDRESS || 'noreply@symbiosishrms.com',
  },
}));
