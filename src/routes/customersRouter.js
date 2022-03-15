import { Router } from "express";
import {
  getCustomer,
  getCustumers,
  postCustomer,
  putCustomer,
} from "../controllers/customersController.js";
import validateSchema from "../middlewares/validateSchema.js";
import customerSchema from "../schemas/customersSchema.js";

const customersRouter = Router();
customersRouter.get("/customers", getCustumers);
customersRouter.get("/customers/:id", getCustomer);
customersRouter.post(
  "/customers",
  validateSchema(customerSchema),
  postCustomer
);
customersRouter.put(
  "/customers/:id",
  validateSchema(customerSchema),
  putCustomer
);

export default customersRouter;
