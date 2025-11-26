import neo4j, {
  Session,
  Transaction,
  type Driver,
  type QueryResult,
  type RecordShape,
} from "neo4j-driver";
import pino from "pino";

const logger =
  process.env.NODE_ENV === "development"
    ? pino(
        { name: "obp-graph" },
        pino.transport({
          target: "pino-pretty",
          options: { colorize: true, translateTime: "HH:MM:ss.l" },
        })
      )
    : pino({ name: "obp-graph" });

export class Graph {
  private driver: Driver;

  constructor(
    uri: string = process.env.NEO4J_URI || "bolt://localhost:7687",
    username: string = process.env.NEO4J_USERNAME || "neo4j",
    password: string = process.env.NEO4J_PASSWORD || "password"
  ) {
    logger.info({ uri, username }, "Initializing Neo4j driver");
    this.driver = neo4j.driver(uri, neo4j.auth.basic(username, password), {
      disableLosslessIntegers: true,
    });
  }

  async close(): Promise<void> {
    logger.info("Closing Neo4j driver");
    await this.driver.close();
  }

  async transaction(): Promise<GraphTransaction> {
    logger.debug("Opening transaction");
    return new GraphTransaction(this.driver);
  }

  async session(): Promise<Session> {
    logger.debug("Opening session");
    return this.driver.session();
  }
}

export class GraphTransaction {
  private session: Session;
  private tx: Transaction;

  constructor(driver: Driver) {
    logger.debug("Creating new transaction");
    this.session = driver.session();
    this.tx = this.session.beginTransaction();
  }

  async run<TEntity extends RecordShape>(
    cypher: string,
    params: Record<string, unknown>
  ): Promise<QueryResult<TEntity>> {
    logger.debug({ cypher, params }, "Cypher RUN");
    const result = await this.tx.run<TEntity>(cypher, params);
    logger.debug(
      { records: result.records.length },
      "Cypher RESULT record count"
    );
    return result;
  }

  async commit(): Promise<void> {
    logger.debug("Transaction COMMIT");
    await this.tx.commit();
  }

  async rollback(): Promise<void> {
    logger.debug("Transaction ROLLBACK");
    await this.tx.rollback();
  }

  async close(): Promise<void> {
    logger.debug("Transaction CLOSE");
    await this.tx.close();
    await this.session.close();
  }
}
