const Joi = require('joi');

   const realEstateSchema = Joi.object({
  name: Joi.string().required(),
  amount: Joi.number().required(),
  size: Joi.number().required(),
  address: Joi.string().required(),
  location: Joi.string().required(),
  images: Joi.array().items(Joi.object()).required(),
  state: Joi.string().required(),
});

module.exports = { realEstateSchema }