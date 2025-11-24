import type { Port } from "../schema";
import { SchemaPort } from "../schema";
import type { GraphTransaction } from "../graph";

export class PortRepository {
  static async get(tx: GraphTransaction, id: Port["id"]): Promise<Port | null> {
    const cypher = "MATCH (n:Port { id: $id }) RETURN n";
    const params = { id };
    const result = await tx.run<{ n: Port }>(cypher, params);

    if (result.records.length === 0) return null;
    if (result.records.length > 1)
      throw new Error("Multiple ports found for id");
    const node = result.records[0]?.get("n");
    if (!node) throw new Error("No port found");
    return SchemaPort.parse(node);
  }

  static async insert(tx: GraphTransaction, port: Port): Promise<Port> {
    const cypher = `
        CREATE (n:Port $properties)
        RETURN n
      `;
    const params = { properties: SchemaPort.parse(port) };
    const result = await tx.run<{ n: Port }>(cypher, params);
    if (result.records.length === 0) throw new Error("No port created");
    if (result.records.length > 1) throw new Error("Multiple ports created");
    const node = result.records[0]?.get("n");
    if (!node) throw new Error("No port created");
    return SchemaPort.parse(node);
  }

  static async canBind(tx: GraphTransaction, port: Port): Promise<boolean> {
    if (!PortRepository.isPublished(port) || PortRepository.isExpired(port))
      return false;
    return await PortRepository.hasOpenBindings(tx, port);
  }

  static async countBindings(
    tx: GraphTransaction,
    port: Port["id"]
  ): Promise<number> {
    const cypher = `
        MATCH ()-[r:BINDS]->(port:Port { id: $portId })
        RETURN COUNT(r) as count
      `;
    const params = { portId: port };
    const result = await tx.run<{ count: number }>(cypher, params);
    const res = result.records[0];
    return res?.get("count") ?? 0;
  }

  static isRef(port: Port): port is Port & { ref: Port["id"] } {
    return port.ref !== undefined;
  }

  static async hasOpenBindings(
    tx: GraphTransaction,
    port: Port
  ): Promise<boolean> {
    return (
      (await PortRepository.countBindings(tx, port.id)) < port.max_bindings
    );
  }

  static isPublished(port: Port): port is Port & { status: "published" } {
    return port.status === "published";
  }

  static isExpired(port: Port): boolean {
    return port.ts_expired < Date.now();
  }
}
