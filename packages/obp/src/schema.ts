import z from "zod";
import { withSystemFields, id, SchemaExternal } from "./schema-helpers";

export type NewOffer = z.infer<typeof SchemaNewOffer>;
export const SchemaNewOffer = z.object({
  ts_expired: z.number(),
  name: z.string(),
  external: z.optional(SchemaExternal),
});
export type Offer = z.infer<typeof SchemaOffer>;
export const SchemaOffer = withSystemFields("offer", SchemaNewOffer.shape);

export type NewParty = z.infer<typeof SchemaNewParty>;
export const SchemaNewParty = z.object({
  name: z.string(),
  external: z.optional(SchemaExternal),
});
export type Party = z.infer<typeof SchemaParty>;
export const SchemaParty = withSystemFields("party", SchemaNewParty.shape);

export type NewPort = z.infer<typeof SchemaNewPort>;
export const SchemaNewPort = z.object({
  ts_expired: z.number(),
  name: z.string(),
  status: z.enum(["draft", "published", "archived"]),
  max_bindings: z.int(),
  terminal: z.boolean(),
  ref: z.optional(id("port")),
  external: z.optional(SchemaExternal),
});
export type Port = z.infer<typeof SchemaPort>;
export const SchemaPort = withSystemFields("port", SchemaNewPort.shape);

export const SchemaNewBINDS = z.object({
  external: z.optional(SchemaExternal),
});
export type NewBINDS = z.infer<typeof SchemaNewBINDS>;
export type BINDS = z.infer<typeof SchemaBINDS>;
export const SchemaBINDS = withSystemFields("binds", SchemaNewBINDS.shape);

export const SchemaNewEXPOSES = z.object({
  external: z.optional(SchemaExternal),
});
export type NewEXPOSES = z.infer<typeof SchemaNewEXPOSES>;
export type EXPOSES = z.infer<typeof SchemaEXPOSES>;
export const SchemaEXPOSES = withSystemFields(
  "exposes",
  SchemaNewEXPOSES.shape
);

export const SchemaNewEXTENDS = z.object({
  external: z.optional(SchemaExternal),
});
export type NewEXTENDS = z.infer<typeof SchemaNewEXTENDS>;
export type EXTENDS = z.infer<typeof SchemaEXTENDS>;
export const SchemaEXTENDS = withSystemFields(
  "extends",
  SchemaNewEXTENDS.shape
);
