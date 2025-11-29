# **Online Learner $\mathcal{L}$ – Structural Insights**

## **1. Compression-Based Structure Discovery**

- **LZ-Style Segmentation**  
  $\mathcal{L}$ performs greedy, Lempel–Ziv–style segmentation of traces, placing it within **compression-based structure discovery**:
  - approximates Kolmogorov complexity via incremental compression,
  - favors short, reusable descriptions of recurring behavior,
  - naturally induces temporal abstraction (morphemes).

## **2. Lattice as Proto-Automaton**

- **Transition Graph + Prefix Trie**  
  The global lattice (weighted transition graph plus prefix trie) behaves like a proto-automaton over learned morphemes, aligning with:
  - state-merging algorithms (e.g., ALERGIA, RPNI),
  - variable-order Markov models,
  - context-tree weighting and related universal coding methods.  
    This connects $\mathcal{L}$ to literatures with stabilization and convergence results.

## **3. Information-Theoretic Perspective**

- **Compression $\Rightarrow$ Regularity**  
  Using compression to drive segmentation gives an information-theoretic grounding:
  - morphemes correspond to patterns that significantly reduce description length,
  - the learner implicitly balances model complexity against predictive accuracy,
  - provides a principled basis for defining “important” or “central” patterns in traces.

## **4. Interface to OBP and Planning**

- **Causal Morphemes from OBP Traces**  
  Because $\mathcal{L}$ operates on OBP traces, its morphemes represent **recurring causal fragments** in $\mathcal{W}$, not just syntactic tokens.

- **Macro-Actions for $\mathcal{P}$**  
  High-confidence morphemes can be promoted to macro-actions, yielding:
  - reduced effective planning depth for $\mathcal{P}$,
  - tighter coupling between experience and planning primitives,
  - a data-driven hierarchy of procedural units.
