import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!channelId) {
        throw new ApiError(400, "ChannelId is required!");
    }

    try {
        const userId = req.user._id;

        // Find the existing subscription
        const existingSubscription = await Subscription.findOne({
            subscriber: userId,
            channel: channelId
        });

        if (existingSubscription) {
            // If the subscription exists, remove it (unsubscribe)
            await Subscription.findByIdAndDelete(existingSubscription._id);
            return res.json(new ApiResponse(200, "Unsubscribed successfully!"));
        } else {
            // If the subscription does not exist, create it (subscribe)
            const newSubscription = new Subscription({
                subscriber: userId,
                channel: channelId
            });
            await newSubscription.save();
            return res.status(201).json(new ApiResponse(200, "Subscribed successfully!"));
        }
    } catch (error) {
        console.error("Error toggling subscription:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    // Validate the channelId
    if (!channelId) {
        throw new ApiError(400, 'Channel ID is required');
    }

    // Fetch the channel from the database
    const channel = await Subscription.find({ channel: channelId }).populate('subscriber');

    // Check if the channel exists
    if (channel.length === 0) {
        throw new ApiError(404, 'Channel not found');
    }

    // Retrieve the list of subscribers
    const subscribers = channel.map(subscription => subscription.subscriber);

    // Respond with the list of subscribers
    return res
        .status(200).json(new ApiResponse(200, subscribers, "Subscriber Data"))

})


const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;

    // Validate the subscriberId
    if (!subscriberId) {
        throw new ApiError(400, "SubscriberId is required");
    }

    // Fetch subscriptions for the subscriber
    const subscriptions = await Subscription.find({ subscriber: subscriberId }).populate("channel");

    // Check if the subscriber has any subscriptions
    if (subscriptions.length === 0) {
        throw new ApiError(404, "No subscriptions found for this subscriber");
    }

    // Retrieve the list of subscribed channels
    const subscribedChannels = subscriptions.map(subscription => subscription.channel);

    // Respond with the list of subscribed channels
    return res.status(200).json(new ApiResponse(200, subscribedChannels, "Subscribed Channels Data"));
});


export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}
