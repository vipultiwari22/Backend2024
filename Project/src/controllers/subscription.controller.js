import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const toggleSubscription = asyncHandler(async (req, res) => {
    // Extract any necessary data from the request
    const { subscriptionId } = req.params; // Assuming you're passing subscriptionId in the URL

    // Check if subscriptionId exists
    if (!subscriptionId) {
        throw new ApiError(400, "SubscriptionId does not exist!")
    }

    try {
        // Check if the subscription exists in the database
        const subscription = await Subscription.findById(subscriptionId); // Replace Subscription with your model

        if (!subscription) {
            throw new ApiError(404, "SubscriptionId not found")
        }

        // Assuming there's a User model and the user is authenticated
        const userId = req.user._id;

        // Check if the user is already subscribed
        const isSubscribed = subscription.subscriber.includes(userId);

        // Toggle subscription status
        if (isSubscribed) {
            // User is already subscribed, unsubscribe
            await Subscription.findByIdAndUpdate(subscriptionId, {
                $pull: { subscriber: userId }
            });
            res.json({ message: "Unsubscribed successfully!" });
        } else {
            // User is not subscribed, subscribe
            await Subscription.findByIdAndUpdate(subscriptionId, {
                $addToSet: { subscriber: userId }
            });

            return res.status(201).json(new ApiResponse(200, "Subscribe successfully!"));
        }
    } catch (error) {
        // Handle any errors
        console.error("Error toggling subscription:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

export {
    toggleSubscription
}