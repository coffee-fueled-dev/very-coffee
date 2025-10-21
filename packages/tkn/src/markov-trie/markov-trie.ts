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

export interface IMarkovTrie {
  insert(token: string): TrieNode;
  addTransition(from: string, to: string): void;
  getNode(token: string): TrieNode | undefined;
  getNext(from: string): Iterable<[TrieNode, number]>;
  computeHubScores(method?: "degree" | "pagerank"): void;
}

/**
 * A trie-based data structure for storing tokens with Markov transition weights.
 * Supports token insertion, transition tracking, and hub score computation.
 */
export class MarkovTrie implements IMarkovTrie {
  root = new TrieNode();

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
   * Computes hub scores for all nodes using degree or PageRank algorithm.
   * @param method - Algorithm to use: "degree" (default) or "pagerank"
   */
  computeHubScores(method: "degree" | "pagerank" = "degree"): void {
    const allNodes = this.collectNodes();

    if (method === "degree") {
      for (const node of allNodes) {
        const degree = [...node.weights.values()].reduce((a, b) => a + b, 0);
        node.hubScore = Math.log1p(degree);
      }
    } else if (method === "pagerank") {
      this.computePageRank(allNodes);
    }
  }

  /**
   * Collects all nodes in the trie via depth-first traversal.
   * @returns Array of all trie nodes
   */
  private collectNodes(): TrieNode[] {
    const nodes: TrieNode[] = [];
    const stack: TrieNode[] = [this.root];
    while (stack.length) {
      const node = stack.pop()!;
      nodes.push(node);
      for (const child of node.children.values()) stack.push(child);
    }
    return nodes;
  }

  /**
   * Computes weighted PageRank scores for nodes.
   * @param nodes - Nodes to compute scores for
   * @param alpha - Damping factor (default 0.85)
   * @param iters - Number of iterations (default 20)
   */
  private computePageRank(nodes: TrieNode[], alpha = 0.85, iters = 20): void {
    const N = nodes.length;
    const base = (1 - alpha) / N;
    const rank = new Map<TrieNode, number>(nodes.map((n) => [n, 1 / N]));

    for (let t = 0; t < iters; t++) {
      const next = new Map<TrieNode, number>(nodes.map((n) => [n, base]));

      for (const node of nodes) {
        const outWeight = [...node.weights.values()].reduce((a, b) => a + b, 0);
        if (outWeight === 0) continue;
        const share = (alpha * rank.get(node)!) / outWeight;

        for (const [to, w] of node.weights) {
          next.set(to, next.get(to)! + share * w);
        }
      }

      for (const n of nodes) rank.set(n, next.get(n)!);
    }

    // Normalize and store
    const maxRank = Math.max(...rank.values());
    for (const n of nodes) n.hubScore = rank.get(n)! / maxRank;
  }
}
