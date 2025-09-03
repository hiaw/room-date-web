import { defineSchema } from "convex/server";
import { authTables } from "@convex-dev/auth/server";

import { authSchemas } from "./schemas/auth";
import { roomSchemas } from "./schemas/rooms";
import { eventSchemas } from "./schemas/events";
import { messagingSchemas } from "./schemas/messaging";
import { systemSchemas } from "./schemas/system";
import { imageSchemas } from "./schemas/images";

const schema = defineSchema({
  ...authTables,
  ...authSchemas,
  ...roomSchemas,
  ...eventSchemas,
  ...messagingSchemas,
  ...systemSchemas,
  ...imageSchemas,
});

export default schema;
