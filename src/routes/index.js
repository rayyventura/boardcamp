import { Router } from "express";
import categoryRouter from "./categoryRouter.js";
import customersRouter from "./customersRouter.js";
import gamesRouter from "./gamesRouter.js";
import rentalRouter from "./rentalsRouter.js";

const router = Router();
router.use(categoryRouter);
router.use(gamesRouter);
router.use(customersRouter);
router.use(rentalRouter);
export default router;
