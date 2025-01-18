import * as Joi from 'joi';

export const configsValidationSchema = Joi.object({
  DATABASE_USER: Joi.string().required(),
  DATABASE_PASSWORD: Joi.string().required(),
  DATABASE_NAME: Joi.string().required(),
  DATABASE_PORT: Joi.number().default(5432),
  DATABASE_HOST: Joi.string().required(),
  DATABASE_SYNCHRONIZE: Joi.boolean().required(),
});
