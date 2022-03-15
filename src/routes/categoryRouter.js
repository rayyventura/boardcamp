import { Router } from "express";
import {
  getCategories,
  postCategory,
} from "../controllers/categoryController.js";
import validateSchema from "../middlewares/validateSchema.js";
import categorySchema from "../schemas/categorySchema.js";

const categoryRouter = Router();
categoryRouter.get("/categories", getCategories);
categoryRouter.post(
  "/categories",
  validateSchema(categorySchema),
  postCategory
);

export default categoryRouter;
