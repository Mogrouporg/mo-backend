const Joi = require('joi');

   const realEstateSchema = Joi.object({
  name: Joi.string().required(),
  amount: Joi.number().required(),
  size: Joi.number().required(),
  address: Joi.string().required(),
  location: Joi.string().required(),
  images: Joi.array().items(Joi.object()).required(),
  description: Joi.string().required(),
  state: Joi.string().required(),
});

const transportSchema = Joi.object({
  name: Joi.string().required(),
  amount: Joi.number().required(),
  type: Joi.string().required(),
  images: Joi.array().items(Joi.object()).required(),
  description: Joi.string().required(),
})

module.exports = { realEstateSchema, transportSchema }