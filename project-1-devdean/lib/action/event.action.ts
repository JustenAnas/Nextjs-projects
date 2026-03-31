'use server'

import Event from "@/database/event.model";
import { connectDB } from "../mongodb";

// Fetches events similar to the given slug, based on matching tags
export const getSimilarEventsBySlug = async (slug: string) => {
    try {
        await connectDB();

        // First find the current event by its slug
        const events = await Event.findOne({ slug });

        // Then find other events that share the same tags, excluding the current event
        // .lean() returns plain JS objects instead of Mongoose documents (better performance)
        return await Event.find({
            _id: { $ne: events._id }, tags: { $in: events.tags }
        }).lean();

    } catch (error) {
        console.log(error);
        return [];
    }
}