import { defineSchema } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { tamTables } from "./tam/_tables";

export default defineSchema({
  ...authTables,
  ...tamTables,
});
