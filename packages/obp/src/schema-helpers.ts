import z from "zod";

export const id = <TEntity extends string>(entityName: TEntity) =>
  z.uuidv7().brand(entityName);

export type External = z.infer<typeof SchemaExternal>;
export const SchemaExternal = z.object({
  id: z.string(),
  source: z.string(),
});

export const systemFields = <TEntity extends string>(entityName: TEntity) =>
  z.object({
    id: id(entityName),
    ts_created: z.int64(),
  });

export type WithSystemFields<
  TEntityName extends string,
  TSchema extends Record<string, z.ZodType<any>>
> = z.infer<ReturnType<typeof withSystemFields<TEntityName, TSchema>>>;
export function withSystemFields<
  TEntityName extends string,
  TSchema extends Record<string, z.ZodType<any>>
>(entityName: TEntityName, schema: TSchema) {
  return systemFields(entityName).extend(schema);
}
export type WithoutSystemFields<
  TEntityName extends string,
  TSchema extends Record<string, z.ZodType<any>>
> = Omit<
  WithSystemFields<TEntityName, TSchema>,
  keyof ReturnType<typeof systemFields<TEntityName>>
>;

export const initializeWithSystemFields = <
  TEntityName extends string,
  TSchema extends z.ZodObject<any>
>(
  entityName: TEntityName,
  schema: TSchema,
  data: z.infer<TSchema>
): WithSystemFields<TEntityName, TSchema["shape"]> => {
  return withSystemFields(entityName, schema.shape).parse({
    ...data,
    id: Bun.randomUUIDv7(),
    ts_created: Date.now(),
  }) as WithSystemFields<TEntityName, TSchema["shape"]>;
};
