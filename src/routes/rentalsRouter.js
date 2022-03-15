import { Router } from "express";
import {
  deleteRental,
  getRentals,
  postRental,
  returnRental,
} from "../controllers/rentalsController.js";
import validateSchema from "../middlewares/validateSchema.js";
import rentalsSchema from "../schemas/rentalsSchema.js";

const rentalRouter = Router();
rentalRouter.get("/rentals", getRentals);
rentalRouter.post("/rentals", validateSchema(rentalsSchema), postRental);
rentalRouter.post("/rentals/:id/return", returnRental);
rentalRouter.delete("/rentals/:id", deleteRental);

export default rentalRouter;
