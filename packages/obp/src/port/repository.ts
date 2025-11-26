import type { Port } from "../schema";
import { SchemaPort } from "../schema";
import type { GraphTransaction } from "../graph";
import type { Integer, Node, Session } from "neo4j-driver";

export class PortRepository {
  static async get(
    ctx: GraphTransaction | Session,
    id: Port["id"]
  ): Promise<Port | null> {
    const cypher = "MATCH (n:Port { id: $id }) RETURN n";
    const params = { id };
    const result = await ctx.run<{ n: Node<Integer, Port> }>(cypher, params);

    if (result.records.length === 0) return null;
    if (result.records.length > 1)
      throw new Error("Multiple ports found for id");
    const node = result.records[0]?.get("n");
    if (!node) throw new Error("No port found");
    return SchemaPort.parse(node.properties);
  }

  static async insert(
    ctx: GraphTransaction | Session,
    port: Port
  ): Promise<Port> {
    const cypher = `
        CREATE (n:Port $properties)
        RETURN n
      `;
    const params = { properties: port };
    const result = await ctx.run<{ n: Node<Integer, Port> }>(cypher, params);
    if (result.records.length === 0) throw new Error("No port created");
    if (result.records.length > 1) throw new Error("Multiple ports created");
    const node = result.records[0]?.get("n");
    if (!node) throw new Error("No port created");
    return SchemaPort.parse(node.properties);
  }

  // TODO: move relationship-based bind validation into cypher
  static async validateBind(
    ctx: GraphTransaction | Session,
    port: Port
  ): Promise<void> {
    const isExposed = await PortRepository.isExposed(ctx, port.id);
    if (!isExposed) throw new Error(`Port ${port.id} is not exposed`);

    if (!PortRepository.isPublished(port))
      throw new Error(`Port ${port.id} is not published`);

    if (PortRepository.isExpired(port))
      throw new Error(`Port ${port.id} is expired`);

    const hasOpenBindings = await PortRepository.hasOpenBindings(ctx, port);
    if (!hasOpenBindings)
      throw new Error(
        `Port ${port.id} has reached max_bindings (${port.max_bindings})`
      );
  }

  static async countBindings(
    ctx: GraphTransaction | Session,
    port: Port["id"]
  ): Promise<number> {
    const cypher = `
        MATCH ()-[r:BINDS]->(port:Port { id: $portId })
        RETURN COUNT(r) as count
      `;
    const params = { portId: port };
    const result = await ctx.run<{ count: number }>(cypher, params);
    const res = result.records[0];
    return res?.get("count") ?? 0;
  }

  static isRef(port: Port): port is Port & { ref: Port["id"] } {
    return port.ref !== undefined;
  }

  static async hasOpenBindings(
    ctx: GraphTransaction | Session,
    port: Port
  ): Promise<boolean> {
    return (
      (await PortRepository.countBindings(ctx, port.id)) < port.max_bindings
    );
  }

  static isPublished(port: Port): port is Port & { status: "published" } {
    return port.status === "published";
  }

  static isExpired(port: Port): boolean {
    return port.ts_expired < Date.now();
  }

  static async isExposed(
    ctx: GraphTransaction | Session,
    port: Port["id"]
  ): Promise<boolean> {
    const cypher = `
        MATCH (offer:Offer)-[:EXPOSES]->(port:Port { id: $portId })
        RETURN COUNT(offer) as count
      `;
    const params = { portId: port };
    const result = await ctx.run<{ count: number }>(cypher, params);
    const res = result.records[0];
    return (res?.get("count") ?? 0) > 0;
  }
}
