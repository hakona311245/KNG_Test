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
  FRONTEND_URLS: Joi.string()
    .custom((value, helpers) => {
      const origins = value
        .split(',')
        .map((origin: string) => origin.trim())
        .filter(Boolean);

      if (!origins.length) {
        return helpers.error('string.empty');
      }

      for (const origin of origins) {
        const { error } = Joi.string().uri().validate(origin);

        if (error) {
          return helpers.error('string.uri', { value: origin });
        }
      }

      return value;
    })
    .optional(),
  PORT: Joi.number().port().default(3000),
  ADMIN_EMAIL: Joi.string().email({ tlds: { allow: false } }).optional(),
  ADMIN_PASSWORD: Joi.string().min(8).optional(),
  ADMIN_FULL_NAME: Joi.string().optional(),
  ADMIN_PHONE_NUMBER: Joi.string().optional(),
  CLOUDINARY_URL: Joi.string()
    .pattern(/^cloudinary:\/\/.+:.+@.+$/)
    .optional(),
  CLOUDINARY_CLOUD_NAME: Joi.string().optional(),
  CLOUDINARY_API_KEY: Joi.string().optional(),
  CLOUDINARY_API_SECRET: Joi.string().optional(),
  CLOUDINARY_FOLDER: Joi.string().default('kng-fashion/products'),
}).custom((env, helpers) => {
  const hasCloudinaryUrl = Boolean(env.CLOUDINARY_URL);
  const hasSeparateCloudinaryConfig = Boolean(
    env.CLOUDINARY_CLOUD_NAME &&
      env.CLOUDINARY_API_KEY &&
      env.CLOUDINARY_API_SECRET,
  );

  if (!hasCloudinaryUrl && !hasSeparateCloudinaryConfig) {
    return helpers.error('any.custom', {
      message:
        'Either CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET must be provided.',
    });
  }

  return env;
});
