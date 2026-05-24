import { Router, type IRouter } from "express";
import healthRouter from "./health";
import reviewsRouter from "./reviews";
import authRouter from "./auth";

const router: IRouter = Router();

router.use("/auth", authRouter);
router.use(healthRouter);
router.use(reviewsRouter);

export default router;
