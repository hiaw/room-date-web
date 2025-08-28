import { v } from "convex/values";

/**
 * Time slot validator for suggested time slots
 */
export const timeSlotValidator = v.object({
  startTime: v.number(),
  endTime: v.number(),
  label: v.optional(v.string()),
});

/**
 * Event creation arguments validator
 */
export const createEventArgs = {
  roomId: v.id("rooms"),
  title: v.optional(v.string()),
  description: v.optional(v.string()),
  startTime: v.optional(v.number()),
  endTime: v.optional(v.number()),
  isFlexibleTiming: v.boolean(),
  suggestedTimeSlots: v.optional(v.array(timeSlotValidator)),
  maxGuests: v.optional(v.number()),
  preferredGender: v.optional(v.array(v.string())),
  minAge: v.optional(v.number()),
  maxAge: v.optional(v.number()),
  eventImages: v.optional(v.array(v.string())),
  primaryEventImageUrl: v.optional(v.string()),
};

/**
 * Event update arguments validator (all fields optional except eventId)
 */
export const updateEventArgs = {
  eventId: v.id("events"),
  title: v.optional(v.string()),
  description: v.optional(v.string()),
  startTime: v.optional(v.number()),
  endTime: v.optional(v.number()),
  isFlexibleTiming: v.optional(v.boolean()),
  suggestedTimeSlots: v.optional(v.array(timeSlotValidator)),
  maxGuests: v.optional(v.number()),
  preferredGender: v.optional(v.array(v.string())),
  minAge: v.optional(v.number()),
  maxAge: v.optional(v.number()),
  eventImages: v.optional(v.array(v.string())),
  primaryEventImageUrl: v.optional(v.string()),
  isActive: v.optional(v.boolean()),
};

/**
 * Discovery query arguments validator
 */
export const discoverEventsArgs = {
  city: v.optional(v.string()),
  latitude: v.optional(v.number()),
  longitude: v.optional(v.number()),
  radiusInMiles: v.optional(v.number()),
  minAge: v.optional(v.number()),
  maxAge: v.optional(v.number()),
  preferredGender: v.optional(v.array(v.string())),
  isFlexibleTiming: v.optional(v.boolean()),
  startDateAfter: v.optional(v.number()),
  startDateBefore: v.optional(v.number()),
  limit: v.optional(v.number()),
};

/**
 * Events near user arguments validator
 */
export const eventsNearUserArgs = {
  latitude: v.number(),
  longitude: v.number(),
  radiusMiles: v.optional(v.number()),
  limit: v.optional(v.number()),
};
