// import mongoose,{ Schema } from "mongoose";

// const subscriptionSchema = new Schema({
//    subscriber :{
//     type:Schema.Types.ObjectId,// one who is subscribing
//     ref:"User"
//    } ,
//    channel :{
//     type:Schema.Types.ObjectId,// one to whom 'subscription' is subscribing
//       ref:"User"
//    }
// },{timestamps:true})

// export const Subscription = mongoose.model("Subscription",subscriptionSchema)

import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema(
  {
    subscriber: {
      type: Schema.Types.ObjectId, // who subscribes
      ref: "User",
      required: true
    },
    channel: {
      type: Schema.Types.ObjectId, // who gets subscribed
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

// 🔥 Prevent duplicate subscriptions
subscriptionSchema.index(
  { subscriber: 1, channel: 1 },
  { unique: true }
);

// 🔥 Improve query performance
subscriptionSchema.index({ channel: 1 });
subscriptionSchema.index({ subscriber: 1 });

export const Subscription = mongoose.model(
  "Subscription",
  subscriptionSchema
);