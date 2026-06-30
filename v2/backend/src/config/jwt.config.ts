import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  privateKeyPath: process.env.JWT_PRIVATE_KEY_PATH || './keys/private.key',
  publicKeyPath: process.env.JWT_PUBLIC_KEY_PATH || './keys/public.key',
  accessTokenExpiry: process.env.JWT_ACCESS_TOKEN_EXPIRY || '15m',
  refreshTokenExpiry: process.env.JWT_REFRESH_TOKEN_EXPIRY || '7d',
}));
