import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middelwaare.js";
import { getSubscribedChannels, getUserChannelSubscribers, toggleSubscription } from "../controllers/subscription.controller.js";


const router = Router()

router.route('/subscribeS/:channelId').post(verifyJWT, toggleSubscription);
router.route('/channels/:channelId/subscribers').get(verifyJWT, getUserChannelSubscribers)
router.route('/subscriber/:subscriberId/subscribed-channels').get(verifyJWT, getSubscribedChannels)


export default router   