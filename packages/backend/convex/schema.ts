import { defineSchema } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { aclTables } from "./acl/_tables";
import { conversationTables } from "./conversation/_tables";
import { tamTables } from "./tam/_tables";

export default defineSchema({
  ...authTables,
  ...aclTables,
  ...conversationTables,
  ...tamTables,
});
