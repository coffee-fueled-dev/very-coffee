import type { GraphTransaction } from "../graph";
import type { EXPOSES, EXTENDS, Offer, Party, Port } from "../schema";
import { SchemaEXPOSES, SchemaEXTENDS, SchemaOffer } from "../schema";

export class OfferRepository {
  static async get(
    tx: GraphTransaction,
    id: Offer["id"]
  ): Promise<Offer | null> {
    const cypher = "MATCH (n:Offer { id: $id }) RETURN n";
    const params = { id };
    const result = await tx.run<{ n: Offer }>(cypher, params);
    if (result.records.length === 0) return null;
    if (result.records.length > 1)
      throw new Error("Multiple offers found for id");
    const node = result.records[0]?.get("n");
    if (!node) throw new Error("No offer found");
    return SchemaOffer.parse(node);
  }

  static async insert(tx: GraphTransaction, offer: Offer): Promise<Offer> {
    const cypher = `
        CREATE (n:Offer $properties)
        RETURN n
      `;
    const params = { properties: SchemaOffer.parse(offer) };
    const result = await tx.run<{ n: Offer }>(cypher, params);
    if (result.records.length === 0) throw new Error("No offer created");
    if (result.records.length > 1) throw new Error("Multiple offers created");
    const node = result.records[0]?.get("n");
    if (!node) throw new Error("No offer created");
    return SchemaOffer.parse(node);
  }

  static async extend(
    tx: GraphTransaction,
    offer: Offer["id"],
    party: Party["id"],
    edgeEXTENDS: EXTENDS
  ): Promise<void> {
    const cypher = `
        MATCH (party:Party { id: $partyId })
        MATCH (offer:Offer { id: $offerId })
        CREATE (party)-[:EXTENDS $properties]->(offer)
      `;
    const params = {
      partyId: party,
      offerId: offer,
      properties: SchemaEXTENDS.parse(edgeEXTENDS),
    };
    await tx.run(cypher, params);
  }

  static async expose(
    tx: GraphTransaction,
    offer: Offer["id"],
    port: Port["id"],
    edgeEXPOSES: EXPOSES
  ): Promise<void> {
    const cypher = `
        MATCH (offer:Offer { id: $offerId })
        MATCH (port:Port { id: $portId })
        CREATE (offer)-[:EXPOSES $properties]->(port)
      `;
    const params = {
      offerId: offer,
      portId: port,
      properties: SchemaEXPOSES.parse(edgeEXPOSES),
    };
    await tx.run(cypher, params);
  }
}
