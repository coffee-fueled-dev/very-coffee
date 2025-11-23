import type { BINDS, Offer, Port } from "../schema";
import { SchemaBINDS, SchemaPort } from "../schema";
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

  static async bind(
    tx: GraphTransaction,
    offer: Offer["id"],
    port: Port["id"],
    edgeBINDS: BINDS
  ): Promise<void> {
    const cypher = `
        MATCH (offer:Offer { id: $offerId })
        MATCH (port:Port { id: $portId })
        CREATE (offer)-[:BINDS $properties]->(port)
      `;
    const params = {
      offerId: offer,
      portId: port,
      properties: SchemaBINDS.parse(edgeBINDS),
    };
    await tx.run(cypher, params);
  }

  static async canBind(tx: GraphTransaction, port: Port): Promise<boolean> {
    if (!PortRepository.isPublished(port)) return false;
    return await PortRepository.hasOpenBindings(tx, port);
  }

  static async getRef(tx: GraphTransaction, port: Port): Promise<Port | null> {
    if (!port.ref) return null;
    const ref = await PortRepository.get(tx, port.ref);
    if (!ref) return null;
    return ref;
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

  private static async hasOpenBindings(
    tx: GraphTransaction,
    port: Port
  ): Promise<boolean> {
    return (
      (await PortRepository.countBindings(tx, port.id)) < port.max_bindings
    );
  }

  private static isPublished(port: Port): boolean {
    return port.status === "published";
  }

  static isRef(port: Port): boolean {
    return port.ref !== undefined;
  }
}
