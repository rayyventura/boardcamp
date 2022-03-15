export default function validateSchema(schema) {
  return (req, res, next) => {
    const validation = schema.validate(req.body);
    if (validation.error) {
      return res.status(400).send("Dados Inválidos");
      console.log(validation.error);
    }

    next();
  };
}
