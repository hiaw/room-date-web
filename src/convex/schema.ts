import { defineSchema } from "convex/server";
import { authTables } from "@convex-dev/auth/server";

import { authSchemas } from "./schemas/auth";
import { roomSchemas } from "./schemas/rooms";
import { eventSchemas } from "./schemas/events";
import { messagingSchemas } from "./schemas/messaging";
import { systemSchemas } from "./schemas/system";

const schema = defineSchema({
  ...authTables,
  ...authSchemas,
  ...roomSchemas,
  ...eventSchemas,
  ...messagingSchemas,
  ...systemSchemas,
});

export default schema;
