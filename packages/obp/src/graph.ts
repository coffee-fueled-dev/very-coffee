import type { Offer, Party, Port } from "./schema";
import { SchemaOffer, SchemaParty, SchemaPort } from "./schema";
import neo4j, {
  Session,
  Transaction,
  type Driver,
  type QueryResult,
  type RecordShape,
} from "neo4j-driver";
import {
  PartyRepository,
  OfferRepository,
  PortRepository,
} from "./repositories";
import type z from "zod";

// Wrapper class that adds graph methods to entities
class GraphNode<T extends Party | Offer | Port> {
  private entity: T;
  private driver: Driver;

  constructor(entity: T, driver: Driver) {
    this.entity = entity;
    this.driver = driver;

    // Proxy all property access to the underlying entity
    return new Proxy(this, {
      get(target, prop: string | symbol) {
        if (prop in target) {
          return (target as Record<string | symbol, unknown>)[prop];
        }
        return (entity as Record<string | symbol, unknown>)[prop];
      },
    }) as this;
  }

  private get entityType(): string {
    return getEntityType(this.entity);
  }

  // Graph methods for Offer entities
  async bind(port: GraphNode<Port>): Promise<void> {
    if (this.entityType !== "offer") {
      throw new Error("bind() can only be called on Offer entities");
    }

    // Validate offer entity using Zod schema
    const offer = SchemaOffer.parse(this.entity);

    // Extract port entity from GraphNode proxy and validate
    const portEntity = SchemaPort.parse(port.entity);

    const session = this.driver.session();
    try {
      const cypher = `
        MATCH (offer:Offer { id: $offerId })
        MATCH (port:Port { id: $portId })
        CREATE (offer)-[:BINDS]->(port)
      `;
      const params = {
        offerId: offer.id,
        portId: portEntity.id,
      };
      await session.run(cypher, params);
    } finally {
      await session.close();
    }
  }

  async expose(port: GraphNode<Port>): Promise<void> {
    if (this.entityType !== "offer") {
      throw new Error("expose() can only be called on Offer entities");
    }

    // Validate offer entity using Zod schema
    const offer = SchemaOffer.parse(this.entity);

    // Extract port entity from GraphNode and validate
    const portEntity = SchemaPort.parse(port.entity);

    const session = this.driver.session();
    try {
      const cypher = `
        MATCH (offer:Offer { id: $offerId })
        MATCH (port:Port { id: $portId })
        CREATE (offer)-[:EXPOSES]->(port)
      `;
      const params = {
        offerId: offer.id,
        portId: portEntity.id,
      };
      await session.run(cypher, params);
    } finally {
      await session.close();
    }
  }
}

// Type guard helpers using Zod schemas
function getEntityType(entity: Party | Offer | Port): string {
  if (SchemaOffer.safeParse(entity).success) return "offer";
  if (SchemaPort.safeParse(entity).success) return "port";
  if (SchemaParty.safeParse(entity).success) return "party";
  throw new Error("Unknown entity type");
}

export class Graph {
  private driver: Driver;

  constructor(
    uri: string = process.env.NEO4J_URI || "bolt://localhost:7687",
    username: string = process.env.NEO4J_USERNAME || "neo4j",
    password: string = process.env.NEO4J_PASSWORD || "password"
  ) {
    this.driver = neo4j.driver(uri, neo4j.auth.basic(username, password));
  }

  async close(): Promise<void> {
    await this.driver.close();
  }

  async spawnTransaction(): Promise<GraphTransaction> {
    return new GraphTransaction(this.driver);
  }
}

export class GraphTransaction {
  private session: Session;
  private tx: Transaction;

  constructor(driver: Driver) {
    this.session = driver.session();
    this.tx = this.session.beginTransaction();
  }

  async run<TEntity extends RecordShape>(
    cypher: string,
    params: Record<string, unknown>
  ): Promise<QueryResult<TEntity>> {
    return await this.tx.run<TEntity>(cypher, params);
  }

  async commit(): Promise<void> {
    await this.tx.commit();
  }

  async rollback(): Promise<void> {
    await this.tx.rollback();
  }

  async close(): Promise<void> {
    await this.tx.close();
    await this.session.close();
  }
}
