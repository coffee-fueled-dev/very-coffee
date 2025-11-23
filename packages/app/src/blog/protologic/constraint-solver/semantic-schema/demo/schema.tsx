import { z } from "zod";
import { semanticInteractionModel } from "./schema.zod";

export const Schema = () => (
  <pre>{JSON.stringify(z.toJSONSchema(semanticInteractionModel), null, 2)}</pre>
);
