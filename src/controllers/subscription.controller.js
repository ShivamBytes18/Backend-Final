import { Subscription } from "../models/subscription.model.js";
import { asynchandler } from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// 🔔 TOGGLE SUBSCRIBE
const toggleSubscription = asynchandler(async (req, res) => {
  const { channelId } = req.params;

  const existing = await Subscription.findOne({
    subscriber: req.user._id,
    channel: channelId
  });

  if (existing) {
    await existing.deleteOne();
    return res.json(
      new ApiResponse(200, { subscribed: false }, "Unsubscribed")
    );
  }

  await Subscription.create({
    subscriber: req.user._id,
    channel: channelId
  });

  return res.json(
    new ApiResponse(200, { subscribed: true }, "Subscribed")
  );
});

// 📊 GET SUBSCRIBER COUNT
const getSubscribersCount = asynchandler(async (req, res) => {
  const { channelId } = req.params;

  const count = await Subscription.countDocuments({
    channel: channelId
  });

  return res.json(
    new ApiResponse(200, { count }, "Subscriber count")
  );
});

const getSubscribedChannels = asynchandler(async (req, res) => {
  const subs = await Subscription.find({
    subscriber: req.user._id
  }).populate("channel", "username avatar");

  return res.json(
    new ApiResponse(200, subs, "Subscribed channels")
  );
});

export { toggleSubscription, getSubscribersCount,getSubscribedChannels };