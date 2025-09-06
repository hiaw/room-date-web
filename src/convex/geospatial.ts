import { GeospatialIndex } from "@convex-dev/geospatial";
import { components } from "./_generated/api.js";
import type { Id } from "./_generated/dataModel";

// Type-safe geospatial index for events
export const eventsGeospatial = new GeospatialIndex<
  Id<"events">,
  {
    isActive: boolean;
    category?: string;
    minAge?: number;
    maxAge?: number;
    isFlexibleTiming: boolean;
    ownerId: Id<"users">;
  }
>(components.geospatial);
