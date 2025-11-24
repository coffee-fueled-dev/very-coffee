import neo4j, {
  Session,
  Transaction,
  type Driver,
  type QueryResult,
  type RecordShape,
} from "neo4j-driver";

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

  async transaction(): Promise<GraphTransaction> {
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
