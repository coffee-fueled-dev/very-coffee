# **Online Learner**

## **1. Primitive Entities**

Let:

- $(\Sigma)$ be a finite alphabet of observable symbols.
- $(\Sigma^\*)$ be the set of all finite sequences over $(\Sigma)$.
- A **symbol stream** be an infinite or finite sequence

$$
x\_1, x\_2, x\_3, \dots,\qquad x\_i \in \Sigma .
$$

The learner processes this stream **online**, consuming each symbol once in order.

---

## **2. Learner Architecture**

An **online learner** is a triple

$$
\mathcal{L} = (\mathsf{Ingest},\ \mathsf{Emit},\ \mathsf{Update})
$$

that operates over an internal state

$$
\mathsf{State} = (D,\ G,\ T)
$$

where:

- **(D)** — a dictionary of previously observed symbol groups,
- **(G)** — a directed, weighted graph whose nodes are symbol groups,
- **(T)** — a prefix trie that stores symbol-level structure of groups.

No additional components or external dependencies are assumed.

---

## **3. Ingestion**

### **Definition (Ingestion Function)**

$$
\mathsf{Ingest} : \mathsf{State} \times \Sigma \to \mathsf{State}.
$$

At time $(t)$, ingestion receives symbol $(x\_t)$ and:

1. Extends the current candidate group:

$$
w\_t^{\mathrm{cand}} = w\_{t-1} x\_t .
$$

2. Determines whether $(w\_t^{\mathrm{cand}})$ is **known** or **novel** relative to the dictionary $(D)$.

3. Based on this novelty test, either:

   - **continues** extending the current candidate group, or
   - **terminates** the current group and begins a new one.

The segmentation rule is unspecified except that it must operate **online** and depend only on current state and the new symbol.

---

## **4. Emission of Symbol Groups**

### **Definition (Emission Function)**

$$
\mathsf{Emit} : \mathsf{State} \to (p,\ \mathsf{State}),
$$

where:

- $(p \in \Sigma^+)$ is a completed symbol group,
- the candidate word resets to the empty string.

Emission occurs exactly when the segmentation rule declares the current group complete.

The result is an **ordered stream of groups**:

$$
p\_1, p\_2, p\_3, \dots
$$

derived online from the input stream.

---

## **5. Storage in a Lattice**

Each emitted group $(p)$ updates the learner's global structures.

### **5.1 Group Dictionary (D)**

The dictionary is updated as:

$$
D \leftarrow D \cup \{p\}.
$$

This allows the learner to recognize future occurrences of previously seen groups.

---

### **5.2 Transition Graph (G)**

The transition graph is a weighted directed graph:

$$
G = (V, E, w),
$$

where:

- $(V)$ is the set of all groups encountered so far,
- $(E)$ contains edges $(p\_i \rightarrow p\_{i+1})$,
- $(w(p\_i, p\_{i+1}))$ is the count of observed transitions.

Whenever groups $(p\_i)$ and $(p\_{i+1})$ are consecutive in emission order, the graph is updated:

$$
w(p\_i, p\_{i+1}) \leftarrow w(p\_i, p\_{i+1}) + 1.
$$

This constructs a **symbol-group transition lattice** over time.

---

### **5.3 Prefix Trie (T)**

The trie stores the symbol-level structure:

- Insert each emitted group $(p = s\_1 s\_2 \dots s\_k)$ into the trie.
- Associate the terminal node with the corresponding graph node.

This binds symbol-level structure and group-level transitions.

---

## **6. Importance Measures on the Lattice**

The learner supports graph-theoretic importance metrics on groups via the transition graph $(G)$.

### **6.1 Degree Centrality**

$$
\deg^+(p) = \sum_{(p \to q) \in E} w(p,q).
$$

### **6.2 Hub Scoring**

A simple hub score is defined as:

$$
\mathrm{hub}(p) = \log(1 + \deg^+(p)).
$$

### **6.3 PageRank and Other Measures**

Because $(G)$ is a weighted directed graph, any standard centrality or spectral method is well-defined, e.g.:

- PageRank,
- eigenvector centrality,
- betweenness,
- closeness,
- weighted random-walk metrics.

The learner does **not** prescribe a specific algorithm; it only guarantees the lattice structure supports them.

---

## **7. Behavioral Summary**

An **online learner** is any system satisfying the following properties:

1. **Sequential ingestion** of a symbol stream

$$
x\_1, x\_2, x\_3, \dots .
$$

2. **Online segmentation** into symbol groups

$$
p\_1, p\_2, \dots
$$

using only past observations and the current symbol.

3. **Lattice construction**, maintaining:

   - a dictionary $(D)$ of groups,
   - a transition graph $(G)$,
   - a prefix trie $(T)$.

4. **Support for graph-theoretic importance metrics** based on the lattice.
