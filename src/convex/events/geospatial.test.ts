import { convexTest } from "convex-test";
import { expect, test, describe, beforeEach } from "vitest";
import { api } from "../_generated/api.js";
import schema from "../schema.js";

describe("Events Geospatial Functionality", () => {
  let t: any;

  beforeEach(async () => {
    t = convexTest(schema);
  });

  describe("Event Creation with Geospatial Indexing", () => {
    test("should add event to geospatial index when created with location", async () => {
      // Create test user
      const userId = await t.run(async (ctx: any) => {
        return await ctx.db.insert("users", {
          name: "Test User",
          email: "test@example.com",
          emailVerificationTime: Date.now(),
        });
      });

      // Create user profile
      await t.run(async (ctx: any) => {
        return await ctx.db.insert("userProfiles", {
          userId,
          dateOfBirth: 946684800000, // Jan 1, 2000 (24 years old)
          gender: "woman",
          city: "San Francisco",
          preferredRadius: 25,
        });
      });

      // Add credits for the user
      await t.run(async (ctx: any) => {
        return await ctx.db.insert("userCredits", {
          userId,
          totalEarned: 10,
          totalSpent: 0,
          availableBalance: 10,
          heldBalance: 0,
        });
      });

      // Create room with location (San Francisco coordinates)
      const roomId = await t.run(async (ctx: any) => {
        return await ctx.db.insert("rooms", {
          ownerId: userId,
          title: "Test Room",
          description: "A test room",
          city: "San Francisco",
          latitude: 37.7749,
          longitude: -122.4194,
          address: "123 Test St",
          locationVerified: true,
          isActive: true,
          images: [],
        });
      });

      // Mock authentication
      t.withIdentity({ subject: userId });

      // Create event
      const eventId = await t.mutation(api.events.mutations.createEvent, {
        roomId,
        title: "Test Event",
        description: "A test event",
        startTime: Date.now() + 86400000, // Tomorrow
        endTime: Date.now() + 90000000, // Tomorrow + 1 hour
        isFlexibleTiming: false,
        maxGuests: 2,
        minAge: 21,
        maxAge: 35,
        guestGenderPreferences: ["woman", "man"],
      });

      expect(eventId).toBeDefined();

      // Verify event was added to geospatial index by querying nearby events
      const nearbyEvents = await t.query(
        api.events.discovery.getEventsNearUser,
        {
          latitude: 37.7749, // San Francisco
          longitude: -122.4194,
          radiusMiles: 10,
          limit: 10,
        },
      );

      expect(nearbyEvents).toHaveLength(1);
      expect(nearbyEvents[0]._id).toBe(eventId);
      expect(nearbyEvents[0].roomLatitude).toBe(37.7749);
      expect(nearbyEvents[0].roomLongitude).toBe(-122.4194);
    });

    test("should handle event creation without location data", async () => {
      // Create test user
      const userId = await t.run(async (ctx: any) => {
        return await ctx.db.insert("users", {
          name: "Test User",
          email: "test@example.com",
          emailVerificationTime: Date.now(),
        });
      });

      // Create user profile
      await t.run(async (ctx: any) => {
        return await ctx.db.insert("userProfiles", {
          userId,
          dateOfBirth: 946684800000,
          gender: "woman",
          city: "Unknown",
          preferredRadius: 25,
        });
      });

      // Add credits
      await t.run(async (ctx: any) => {
        return await ctx.db.insert("userCredits", {
          userId,
          totalEarned: 10,
          totalSpent: 0,
          availableBalance: 10,
          heldBalance: 0,
        });
      });

      // Create room without location
      const roomId = await t.run(async (ctx: any) => {
        return await ctx.db.insert("rooms", {
          ownerId: userId,
          title: "Test Room No Location",
          description: "A test room without location",
          city: "Unknown",
          latitude: null,
          longitude: null,
          address: "TBD",
          locationVerified: false,
          isActive: true,
          images: [],
        });
      });

      t.withIdentity({ subject: userId });

      // Create event (should succeed even without location)
      const eventId = await t.mutation(api.events.mutations.createEvent, {
        roomId,
        title: "Test Event No Location",
        description: "A test event without location",
        startTime: Date.now() + 86400000,
        endTime: Date.now() + 90000000,
        isFlexibleTiming: false,
        maxGuests: 2,
        minAge: 21,
        maxAge: 35,
        guestGenderPreferences: ["woman"],
      });

      expect(eventId).toBeDefined();

      // Verify event was created but won't appear in geospatial queries
      const nearbyEvents = await t.query(
        api.events.discovery.getEventsNearUser,
        {
          latitude: 37.7749,
          longitude: -122.4194,
          radiusMiles: 100, // Large radius
          limit: 10,
        },
      );

      expect(nearbyEvents).toHaveLength(0); // Should not find the event without location
    });
  });

  describe("Geospatial Distance Queries", () => {
    test("should find events within specified radius", async () => {
      // Create test user
      const userId = await t.run(async (ctx: any) => {
        return await ctx.db.insert("users", {
          name: "Test User",
          email: "test@example.com",
          emailVerificationTime: Date.now(),
        });
      });

      // Create user profile
      await t.run(async (ctx: any) => {
        return await ctx.db.insert("userProfiles", {
          userId,
          dateOfBirth: 946684800000,
          gender: "woman",
          city: "San Francisco",
          preferredRadius: 25,
        });
      });

      // Add credits
      await t.run(async (ctx: any) => {
        return await ctx.db.insert("userCredits", {
          userId,
          totalEarned: 20,
          totalSpent: 0,
          availableBalance: 20,
          heldBalance: 0,
        });
      });

      t.withIdentity({ subject: userId });

      // Create room in SF downtown
      const sfDowntownRoom = await t.run(async (ctx: any) => {
        return await ctx.db.insert("rooms", {
          ownerId: userId,
          title: "SF Downtown Room",
          description: "Room in SF downtown",
          city: "San Francisco",
          latitude: 37.7749, // SF downtown
          longitude: -122.4194,
          address: "123 Market St",
          locationVerified: true,
          isActive: true,
          images: [],
        });
      });

      // Create room in Berkeley (about 12 miles away)
      const berkeleyRoom = await t.run(async (ctx: any) => {
        return await ctx.db.insert("rooms", {
          ownerId: userId,
          title: "Berkeley Room",
          description: "Room in Berkeley",
          city: "Berkeley",
          latitude: 37.8715, // Berkeley
          longitude: -122.273,
          address: "789 Berkeley Ave",
          locationVerified: true,
          isActive: true,
          images: [],
        });
      });

      // Create events in each room
      const downtownEventId = await t.mutation(
        api.events.mutations.createEvent,
        {
          roomId: sfDowntownRoom,
          title: "Downtown Event",
          description: "Event in downtown",
          startTime: Date.now() + 86400000,
          endTime: Date.now() + 90000000,
          isFlexibleTiming: false,
          maxGuests: 2,
          minAge: 21,
          maxAge: 35,
          guestGenderPreferences: ["woman", "man"],
        },
      );

      const berkeleyEventId = await t.mutation(
        api.events.mutations.createEvent,
        {
          roomId: berkeleyRoom,
          title: "Berkeley Event",
          description: "Event in Berkeley",
          startTime: Date.now() + 86400000,
          endTime: Date.now() + 90000000,
          isFlexibleTiming: false,
          maxGuests: 2,
          minAge: 21,
          maxAge: 35,
          guestGenderPreferences: ["woman", "man"],
        },
      );

      // Test small radius (should only find downtown event)
      const nearbyEventsSmallRadius = await t.query(
        api.events.discovery.getEventsNearUser,
        {
          latitude: 37.7749, // SF downtown
          longitude: -122.4194,
          radiusMiles: 5, // Small radius
          limit: 10,
        },
      );

      expect(nearbyEventsSmallRadius).toHaveLength(1);
      expect(nearbyEventsSmallRadius[0]._id).toBe(downtownEventId);

      // Test large radius (should find both events)
      const nearbyEventsLargeRadius = await t.query(
        api.events.discovery.getEventsNearUser,
        {
          latitude: 37.7749, // SF downtown
          longitude: -122.4194,
          radiusMiles: 25, // Large radius
          limit: 10,
        },
      );

      expect(nearbyEventsLargeRadius).toHaveLength(2);
      const largeRadiusEventIds = nearbyEventsLargeRadius.map(
        (e: any) => e._id,
      );
      expect(largeRadiusEventIds).toContain(downtownEventId);
      expect(largeRadiusEventIds).toContain(berkeleyEventId);
    });
  });

  describe("Event Updates and Geospatial Index", () => {
    test("should update geospatial index when event becomes inactive", async () => {
      // Create test user
      const userId = await t.run(async (ctx: any) => {
        return await ctx.db.insert("users", {
          name: "Test User",
          email: "test@example.com",
          emailVerificationTime: Date.now(),
        });
      });

      // Create user profile
      await t.run(async (ctx: any) => {
        return await ctx.db.insert("userProfiles", {
          userId,
          dateOfBirth: 946684800000,
          gender: "woman",
          city: "San Francisco",
          preferredRadius: 25,
        });
      });

      // Add credits
      await t.run(async (ctx: any) => {
        return await ctx.db.insert("userCredits", {
          userId,
          totalEarned: 10,
          totalSpent: 0,
          availableBalance: 10,
          heldBalance: 0,
        });
      });

      // Create room
      const roomId = await t.run(async (ctx: any) => {
        return await ctx.db.insert("rooms", {
          ownerId: userId,
          title: "Test Room",
          description: "A test room",
          city: "San Francisco",
          latitude: 37.7749,
          longitude: -122.4194,
          address: "123 Test St",
          locationVerified: true,
          isActive: true,
          images: [],
        });
      });

      t.withIdentity({ subject: userId });

      // Create event
      const eventId = await t.mutation(api.events.mutations.createEvent, {
        roomId,
        title: "Test Event",
        description: "A test event",
        startTime: Date.now() + 86400000,
        endTime: Date.now() + 90000000,
        isFlexibleTiming: false,
        maxGuests: 2,
        minAge: 21,
        maxAge: 35,
        guestGenderPreferences: ["woman"],
      });

      // Verify event is findable
      let nearbyEvents = await t.query(api.events.discovery.getEventsNearUser, {
        latitude: 37.7749,
        longitude: -122.4194,
        radiusMiles: 10,
        limit: 10,
      });

      expect(nearbyEvents).toHaveLength(1);
      expect(nearbyEvents[0]._id).toBe(eventId);

      // Update event to be inactive
      await t.mutation(api.events.mutations.updateEvent, {
        eventId,
        isActive: false,
      });

      // Verify event is no longer findable in geospatial queries
      nearbyEvents = await t.query(api.events.discovery.getEventsNearUser, {
        latitude: 37.7749,
        longitude: -122.4194,
        radiusMiles: 10,
        limit: 10,
      });

      expect(nearbyEvents).toHaveLength(0);
    });
  });

  describe("Event Deletion and Geospatial Index", () => {
    test("should remove event from geospatial index when deleted", async () => {
      // Create test user
      const userId = await t.run(async (ctx: any) => {
        return await ctx.db.insert("users", {
          name: "Test User",
          email: "test@example.com",
          emailVerificationTime: Date.now(),
        });
      });

      // Create user profile
      await t.run(async (ctx: any) => {
        return await ctx.db.insert("userProfiles", {
          userId,
          dateOfBirth: 946684800000,
          gender: "woman",
          city: "San Francisco",
          preferredRadius: 25,
        });
      });

      // Add credits
      await t.run(async (ctx: any) => {
        return await ctx.db.insert("userCredits", {
          userId,
          totalEarned: 10,
          totalSpent: 0,
          availableBalance: 10,
          heldBalance: 0,
        });
      });

      // Create room
      const roomId = await t.run(async (ctx: any) => {
        return await ctx.db.insert("rooms", {
          ownerId: userId,
          title: "Test Room",
          description: "A test room",
          city: "San Francisco",
          latitude: 37.7749,
          longitude: -122.4194,
          address: "123 Test St",
          locationVerified: true,
          isActive: true,
          images: [],
        });
      });

      t.withIdentity({ subject: userId });

      // Create event
      const eventId = await t.mutation(api.events.mutations.createEvent, {
        roomId,
        title: "Test Event",
        description: "A test event",
        startTime: Date.now() + 86400000,
        endTime: Date.now() + 90000000,
        isFlexibleTiming: false,
        maxGuests: 2,
        minAge: 21,
        maxAge: 35,
        guestGenderPreferences: ["woman"],
      });

      // Verify event is findable
      let nearbyEvents = await t.query(api.events.discovery.getEventsNearUser, {
        latitude: 37.7749,
        longitude: -122.4194,
        radiusMiles: 10,
        limit: 10,
      });

      expect(nearbyEvents).toHaveLength(1);
      expect(nearbyEvents[0]._id).toBe(eventId);

      // Delete event
      await t.mutation(api.events.mutations.deleteEvent, {
        eventId,
      });

      // Verify event is no longer findable
      nearbyEvents = await t.query(api.events.discovery.getEventsNearUser, {
        latitude: 37.7749,
        longitude: -122.4194,
        radiusMiles: 10,
        limit: 10,
      });

      expect(nearbyEvents).toHaveLength(0);

      // Verify event is marked as inactive in database
      const deletedEvent = await t.run(async (ctx: any) => {
        return await ctx.db.get(eventId);
      });

      expect(deletedEvent).toBeDefined();
      expect(deletedEvent!.isActive).toBe(false);
    });
  });

  describe("DiscoverEvents with Geospatial Filtering", () => {
    test("should use geospatial index for location-based discovery", async () => {
      // Create test user
      const userId = await t.run(async (ctx: any) => {
        return await ctx.db.insert("users", {
          name: "Test User",
          email: "test@example.com",
          emailVerificationTime: Date.now(),
        });
      });

      // Create user profile
      await t.run(async (ctx: any) => {
        return await ctx.db.insert("userProfiles", {
          userId,
          dateOfBirth: 946684800000,
          gender: "woman",
          city: "San Francisco",
          preferredRadius: 25,
        });
      });

      // Add credits
      await t.run(async (ctx: any) => {
        return await ctx.db.insert("userCredits", {
          userId,
          totalEarned: 20,
          totalSpent: 0,
          availableBalance: 20,
          heldBalance: 0,
        });
      });

      t.withIdentity({ subject: userId });

      // Create rooms in different cities
      const sfRoom = await t.run(async (ctx: any) => {
        return await ctx.db.insert("rooms", {
          ownerId: userId,
          title: "SF Room",
          description: "Room in SF",
          city: "San Francisco",
          latitude: 37.7749,
          longitude: -122.4194,
          address: "123 SF St",
          locationVerified: true,
          isActive: true,
          images: [],
        });
      });

      const nyRoom = await t.run(async (ctx: any) => {
        return await ctx.db.insert("rooms", {
          ownerId: userId,
          title: "NY Room",
          description: "Room in NY",
          city: "New York",
          latitude: 40.7128, // NYC
          longitude: -74.006,
          address: "456 NY Ave",
          locationVerified: true,
          isActive: true,
          images: [],
        });
      });

      // Create events
      const sfEventId = await t.mutation(api.events.mutations.createEvent, {
        roomId: sfRoom,
        title: "SF Event",
        description: "Event in SF",
        startTime: Date.now() + 86400000,
        endTime: Date.now() + 90000000,
        isFlexibleTiming: false,
        maxGuests: 2,
        minAge: 21,
        maxAge: 35,
        guestGenderPreferences: ["woman", "man"],
      });

      const nyEventId = await t.mutation(api.events.mutations.createEvent, {
        roomId: nyRoom,
        title: "NY Event",
        description: "Event in NY",
        startTime: Date.now() + 86400000,
        endTime: Date.now() + 90000000,
        isFlexibleTiming: false,
        maxGuests: 2,
        minAge: 21,
        maxAge: 35,
        guestGenderPreferences: ["woman", "man"],
      });

      // Test geospatial filtering in discoverEvents
      const eventsNearSF = await t.query(api.events.discovery.discoverEvents, {
        latitude: 37.7749, // SF
        longitude: -122.4194,
        radiusInMiles: 50, // Should only find SF event
        limit: 10,
      });

      expect(eventsNearSF).toHaveLength(1);
      expect(eventsNearSF[0]._id).toBe(sfEventId);
      expect(eventsNearSF[0].roomCity).toBe("San Francisco");

      // Test without location filtering (should find both)
      const allEvents = await t.query(api.events.discovery.discoverEvents, {
        limit: 10,
      });

      expect(allEvents).toHaveLength(2);
      const allEventIds = allEvents.map((e: any) => e._id);
      expect(allEventIds).toContain(sfEventId);
      expect(allEventIds).toContain(nyEventId);
    });
  });
});
