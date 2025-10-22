/**
 * Node in the trie structure storing character mappings and Markov transition weights.
 */
export class TrieNode {
  /** Child nodes indexed by character */
  children = new Map<string, TrieNode>();
  /** Markov transition edges with occurrence counts */
  weights = new Map<TrieNode, number>();
  /** Hub score (degree-based or PageRank) */
  hubScore = 0;
  /** Whether this node marks the end of a token */
  terminal = false;
}

export interface PatternWithScore {
  token: string;
  node: TrieNode;
  hubScore: number;
}

export interface IMarkovTrie {
  insert(token: string): TrieNode;
  addTransition(from: string, to: string): void;
  getNode(token: string): TrieNode | undefined;
  getNext(from: string): Iterable<[TrieNode, number]>;
  computeHubScores(method?: "degree" | "pagerank"): void;
  pipe(reader: AsyncIterable<{ key: string }>): Promise<void>;
  clear(): void;
  size: number;
}

/**
 * A trie-based data structure for storing tokens with Markov transition weights.
 * Supports token insertion, transition tracking, and hub score computation.
 */
export class MarkovTrie implements IMarkovTrie {
  readonly root = new TrieNode();

  /**
   * Inserts a token into the trie, creating nodes as needed.
   * @param token - The token string to insert
   * @returns The terminal node for the token
   */
  insert(token: string): TrieNode {
    let node = this.root;
    for (const ch of token) {
      if (!node.children.has(ch)) node.children.set(ch, new TrieNode());
      node = node.children.get(ch)!;
    }
    node.terminal = true;
    return node;
  }

  /**
   * Adds a weighted transition edge between two tokens.
   * @param from - Source token
   * @param to - Destination token
   */
  addTransition(from: string, to: string): void {
    const a = this.insert(from);
    const b = this.insert(to);
    a.weights.set(b, (a.weights.get(b) ?? 0) + 1);
  }

  /**
   * Retrieves the trie node for a given token.
   * @param token - The token to look up
   * @returns The node if found, undefined otherwise
   */
  getNode(token: string): TrieNode | undefined {
    let node: TrieNode | undefined = this.root;
    for (const ch of token) {
      node = node?.children.get(ch);
      if (!node) return undefined;
    }
    return node;
  }

  /**
   * Gets all possible next transitions from a token with their weights.
   * @param from - The source token
   * @returns Iterable of [node, weight] pairs
   */
  getNext(from: string): Iterable<[TrieNode, number]> {
    const node = this.getNode(from);
    return node ? node.weights.entries() : [];
  }

  /**
   * Streams patterns from an async reader and builds the Markov graph.
   * Inserts each pattern and creates transitions between consecutive patterns.
   * @param reader - Async iterable yielding objects with a `key` property
   */
  async pipe(reader: AsyncIterable<{ key: string }>): Promise<void> {
    let previousPattern: string | null = null;

    for await (const segment of reader) {
      const currentPattern = segment.key;

      this.insert(currentPattern);

      if (previousPattern !== null) {
        this.addTransition(previousPattern, currentPattern);
      }

      previousPattern = currentPattern;
    }
  }

  /**
   * Computes hub scores for all nodes using degree or PageRank algorithm.
   * @param method - Algorithm to use: "degree" (default) or "pagerank"
   */
  computeHubScores(method: "degree" | "pagerank" = "degree"): void {
    const allNodes = MarkovTrie.collectNodes(this);

    if (method === "degree") {
      MarkovTrie.computeDegree(allNodes);
    } else if (method === "pagerank") {
      MarkovTrie.computePageRank(allNodes);
    }
  }

  clear(): void {
    this.root.children.clear();
    this.root.weights.clear();
    this.root.hubScore = 0;
    this.root.terminal = false;
  }

  get size(): number {
    return this.root.children.size;
  }

  /**
   * Collects all nodes in the trie via depth-first traversal.
   * @returns Array of all trie nodes
   */
  static collectNodes(trie: MarkovTrie): TrieNode[] {
    const nodes: TrieNode[] = [];
    const visited = new Set<TrieNode>();
    const stack: TrieNode[] = [trie.root];

    while (stack.length) {
      const node = stack.pop()!;
      if (visited.has(node)) continue;
      visited.add(node);

      nodes.push(node);
      for (const child of node.children.values()) {
        if (!visited.has(child)) {
          stack.push(child);
        }
      }
    }
    return nodes;
  }

  /**
   * Computes local hub scores for nodes based on weighted out-degree.
   *
   * The degree score represents each node's local connectivity strength,
   * calculated as the sum of the weights of its outgoing transitions:
   *
   *    degree(node) = Σ[ w(node → to) ]
   *
   * The resulting hub score is stored as:
   *
   *    hubScore = log1p(degree)
   *
   * where `log1p` provides a smooth logarithmic scaling to prevent
   * extremely high-degree nodes from dominating.
   *
   * This measure is a fast, local approximation of node importance,
   * suitable for online updates or incremental scoring where full
   * PageRank computation would be too expensive.
   *
   * @param nodes - The collection of nodes for which to compute hub scores.
   */
  private static computeDegree(nodes: TrieNode[]): void {
    for (const node of nodes) {
      const degree = [...node.weights.values()].reduce((a, b) => a + b, 0);
      node.hubScore = Math.log1p(degree);
    }
  }

  /**
   * Computes weighted PageRank scores for nodes.
   *
   * PageRank assigns each node a score representing its global importance
   * within the graph based on the weight and structure of incoming links.
   *
   * This implementation uses a weighted transition model:
   *
   *    PR(to) = (1 - α)/N + α * Σ[ PR(from) * (w(from→to) / Σ(w(from→*)) ) ]
   *
   * where:
   *   - α (alpha) is the damping factor (typically 0.85),
   *   - N is the total number of nodes,
   *   - w(from→to) is the weight of the transition from `from` to `to`,
   *   - Σ(w(from→*)) is the total outgoing weight from node `from`.
   *
   * The algorithm iteratively updates PageRank values over `iters` steps.
   * After convergence, the scores are normalized so the highest-ranked node
   * has a hubScore of 1.
   * @param nodes - Nodes to compute scores for
   * @param alpha - Damping factor (default 0.85)
   * @param iters - Number of iterations (default 20)
   */
  private static computePageRank(
    nodes: TrieNode[],
    alpha = 0.85,
    iters = 15
  ): void {
    const N = nodes.length;
    if (N === 0) return;

    const base = (1 - alpha) / N;
    const rank = new Float64Array(N).fill(1 / N);
    const next = new Float64Array(N);
    const outW = new Float64Array(N);
    const index = new Map<TrieNode, number>();
    nodes.forEach((n, i) => {
      index.set(n, i);
      for (const w of n.weights.values()) outW[i] += w;
    });

    for (let t = 0; t < iters; t++) {
      next.fill(base);
      for (let i = 0; i < N; i++) {
        const node = nodes[i];
        const out = outW[i];
        if (!out) continue;
        const share = (alpha * rank[i]) / out;
        for (const [to, w] of node.weights) {
          next[index.get(to)!] += share * w;
        }
      }
      for (let i = 0; i < N; i++) rank[i] = next[i];
    }

    const max = Math.max(...rank);
    for (let i = 0; i < N; i++) nodes[i].hubScore = rank[i] / max;
  }

  /**
   * Collects all terminal nodes with their token strings.
   * Uses iterative traversal to avoid stack overflow on deep tries.
   * @returns Array of patterns with tokens, nodes, and hub scores
   */
  private static collectTerminals(trie: MarkovTrie): PatternWithScore[] {
    const patterns: PatternWithScore[] = [];
    const visited = new Set<TrieNode>();
    const stack: Array<{ node: TrieNode; token: string }> = [];

    // Start from root's children
    for (const [ch, child] of trie.root.children) {
      stack.push({ node: child, token: ch });
    }

    while (stack.length > 0) {
      const { node, token } = stack.pop()!;

      if (visited.has(node)) continue;
      visited.add(node);

      if (node.terminal) {
        patterns.push({
          token,
          node,
          hubScore: node.hubScore,
        });
      }

      // Add children to stack
      for (const [ch, child] of node.children) {
        if (!visited.has(child)) {
          stack.push({ node: child, token: token + ch });
        }
      }
    }

    return patterns;
  }

  /**
   * Gets the top patterns from a trie by hub score.
   * Should be called after computeHubScores.
   *
   * @param trie - The trie to get the top patterns from
   * @param limit - The number of patterns to return (default 10)
   * @returns Top N patterns sorted by hub score descending
   */
  getTopPatterns(limit: number = 10): PatternWithScore[] {
    const patterns = MarkovTrie.collectTerminals(this);

    // Deduplicate by token (in case there are somehow duplicates)
    const uniquePatterns = new Map<string, PatternWithScore>();
    for (const pattern of patterns) {
      const existing = uniquePatterns.get(pattern.token);
      // Keep the one with higher hub score if there are duplicates
      if (!existing || pattern.hubScore > existing.hubScore) {
        uniquePatterns.set(pattern.token, pattern);
      }
    }

    // Sort by hub score descending and return top N
    return Array.from(uniquePatterns.values())
      .sort((a, b) => b.hubScore - a.hubScore)
      .slice(0, limit);
  }
}
