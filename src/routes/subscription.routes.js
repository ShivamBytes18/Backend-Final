import { Router } from "express";
import {
  toggleSubscription,
  getSubscribersCount,
    getSubscribedChannels 
} from "../controllers/subscription.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// 🔔 subscribe/unsubscribe
router.route("/:channelId").post(verifyJWT, toggleSubscription);

// 📊 subscriber count
router.route("/count/:channelId").get(getSubscribersCount);
router.route("/my").get(verifyJWT, getSubscribedChannels);

export default router;