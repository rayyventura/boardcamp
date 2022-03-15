import joi from "joi";

const customerSchema = joi.object({
  name: joi.string().required(),
  phone: joi.string().min(10).max(11).required().regex(/^\d+$/),
  cpf: joi.string().length(11).required().regex(/^\d+$/),
  birthday: joi.date().required(),
});
export default customerSchema;
