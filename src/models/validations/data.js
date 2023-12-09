const Joi = require('joi');

const realEstateSchema = Joi.object({
  name: Joi.string().required(),
  amount: Joi.number().required(),
  size: Joi.number().required(),
  address: Joi.string().required(),
  location: Joi.string().required(),
  images: Joi.any().required(),
  description: Joi.string().required(),
  state: Joi.string()
  .required()
  .valid('Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'Abuja', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara')
});

const transportSchema = Joi.object({
  name: Joi.string().required(),
  amount: Joi.number().required(),
  type: Joi.string().required(),
  images: Joi.array().items(Joi.object()).required(),
  description: Joi.string().required(),
})

module.exports = { realEstateSchema, transportSchema }