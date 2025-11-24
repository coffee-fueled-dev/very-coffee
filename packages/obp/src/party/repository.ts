import type { Session } from "neo4j-driver";
import type { GraphTransaction } from "../graph";
import type { EXTENDS, Offer, Party } from "../schema";
import { SchemaEXTENDS, SchemaParty } from "../schema";

export class PartyRepository {
  static async get(
    ctx: GraphTransaction | Session,
    id: Party["id"]
  ): Promise<Party | null> {
    const cypher = "MATCH (n:Party { id: $id }) RETURN n";
    const params = { id };
    const result = await ctx.run<{ n: Party }>(cypher, params);
    if (result.records.length === 0) return null;
    if (result.records.length > 1)
      throw new Error("Multiple parties found for id");
    const node = result.records[0]?.get("n");
    if (!node) throw new Error("No party found");
    return SchemaParty.parse(node);
  }

  static async insert(
    ctx: GraphTransaction | Session,
    party: Party
  ): Promise<Party> {
    const cypher = `
        CREATE (n:Party $properties)
        RETURN n
      `;
    const params = { properties: SchemaParty.parse(party) };
    const result = await ctx.run<{ n: Party }>(cypher, params);

    if (result.records.length === 0) throw new Error("No party created");
    if (result.records.length > 1) throw new Error("Multiple parties created");
    const node = result.records[0]?.get("n");
    if (!node) throw new Error("No party created");
    return SchemaParty.parse(node);
  }

  static async extendOffer(
    ctx: GraphTransaction | Session,
    party: Party["id"],
    edgeEXTENDS: EXTENDS,
    offer: Offer["id"]
  ): Promise<void> {
    const cypher = `
        MATCH (party:Party { id: $partyId })
        MATCH (offer:Offer { id: $offerId })
        CREATE (party)-[:EXTENDS $edge]->(offer)
      `;
    const params = {
      partyId: party,
      offerId: offer,
      edge: SchemaEXTENDS.parse(edgeEXTENDS),
    };
    await ctx.run(cypher, params);
  }
}
