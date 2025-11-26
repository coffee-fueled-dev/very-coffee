import type { Integer, Node, Session } from "neo4j-driver";
import type { GraphTransaction } from "../graph";
import type { BINDS, EXPOSES, Offer, Port } from "../schema";
import { SchemaBINDS, SchemaEXPOSES, SchemaOffer } from "../schema";

export class OfferRepository {
  static async get(
    ctx: GraphTransaction | Session,
    id: Offer["id"]
  ): Promise<Offer | null> {
    const cypher = "MATCH (n:Offer { id: $id }) RETURN n";
    const params = { id };
    const result = await ctx.run<{ n: Node<Integer, Offer> }>(cypher, params);
    if (result.records.length === 0) return null;
    if (result.records.length > 1)
      throw new Error("Multiple offers found for id");
    const node = result.records[0]?.get("n");
    if (!node) throw new Error("No offer found");
    return SchemaOffer.parse(node.properties);
  }

  static async insert(
    ctx: GraphTransaction | Session,
    offer: Offer
  ): Promise<Offer> {
    const cypher = `
        CREATE (n:Offer $properties)
        RETURN n
      `;
    const params = { properties: SchemaOffer.parse(offer) };
    const result = await ctx.run<{ n: Node<Integer, Offer> }>(cypher, params);
    if (result.records.length === 0) throw new Error("No offer created");
    if (result.records.length > 1) throw new Error("Multiple offers created");
    const node = result.records[0]?.get("n");
    if (!node) throw new Error("No offer created");
    return SchemaOffer.parse(node.properties);
  }

  static async exposePort(
    ctx: GraphTransaction | Session,
    offer: Offer["id"],
    edgeEXPOSES: EXPOSES,
    port: Port["id"]
  ): Promise<void> {
    const cypher = `
        MATCH (offer:Offer { id: $offerId })
        MATCH (port:Port { id: $portId })
        CREATE (offer)-[:EXPOSES $edge]->(port)
      `;
    const params = {
      offerId: offer,
      portId: port,
      edge: SchemaEXPOSES.parse(edgeEXPOSES),
    };
    await ctx.run(cypher, params);
  }

  static async bindPort(
    ctx: GraphTransaction | Session,
    offer: Offer["id"],
    edgeBINDS: BINDS,
    port: Port["id"]
  ): Promise<void> {
    // TODO: move relationship-based bind validation into cypher
    const cypher = `
        MATCH (offer:Offer { id: $offerId })
        MATCH (port:Port { id: $portId })
        CREATE (offer)-[:BINDS $edge]->(port)
      `;
    const params = {
      offerId: offer,
      portId: port,
      edge: SchemaBINDS.parse(edgeBINDS),
    };
    await ctx.run(cypher, params);
  }

  static isExpired(offer: Offer): boolean {
    return offer.ts_expired < Date.now();
  }
}
