import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middelwaare.js";
import { toggleSubscription } from "../controllers/subscription.controller.js";


const router = Router()

router.use(verifyJWT)

router
    .route('/c/:subscriptionid')
    .post(toggleSubscription)


export default router