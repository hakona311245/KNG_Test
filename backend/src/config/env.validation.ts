import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  DATABASE_URL: Joi.string().required(),
  JWT_ACCESS_SECRET: Joi.string().min(16).required(),
  JWT_REFRESH_SECRET: Joi.string().min(16).required(),
  JWT_ACCESS_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
  COOKIE_SECURE: Joi.boolean().truthy('true').falsy('false').default(false),
  COOKIE_SAME_SITE: Joi.string().valid('lax', 'strict', 'none').default('lax'),
  FRONTEND_URL: Joi.string().uri().default('http://localhost:5173'),
  PORT: Joi.number().port().default(3000),
  ADMIN_EMAIL: Joi.string().email({ tlds: { allow: false } }).optional(),
  ADMIN_PASSWORD: Joi.string().min(8).optional(),
  ADMIN_FULL_NAME: Joi.string().optional(),
  ADMIN_PHONE_NUMBER: Joi.string().optional(),
});
