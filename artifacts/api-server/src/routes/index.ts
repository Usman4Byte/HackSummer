import { Router, type IRouter } from "express";
import healthRouter from "./health";
import runRouter from "./run";

const router: IRouter = Router();

router.use(healthRouter);
router.use(runRouter);

export default router;
