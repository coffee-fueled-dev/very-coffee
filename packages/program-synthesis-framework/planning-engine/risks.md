# **Planning Engine \(\mathcal{P}\) – Risks and Open Questions**

## **1. Abstraction Safety and Macro Reliability**

- **Unsafe Macros from \(\mathcal{L}\)**  
  Macro-actions derived from morphemes may:
  - bypass infrequent but crucial checks or safeguards,
  - conceal intermediate failure modes within a single high-level step,
  - become invalid when environment statistics or OBP semantics drift.  
    This threatens plan soundness unless macro promotion and verification are carefully constrained.

## **2. State Abstraction Risks**

- **Over-Aggressive Collapsing**  
  When using intent-based compression or other abstractions:
  - distinct states with materially different failure profiles may be merged,
  - planning may overgeneralize success probabilities,
  - rare but catastrophic transitions can be “averaged away.”  
    Formal bisimulation or abstract-interpretation guarantees are needed to keep abstract planning safe.

## **3. Complexity and Scalability**

- **Hierarchical Search Complexity**  
  Even with macros, hierarchical planning can:
  - suffer from branching-factor explosions at higher levels,
  - incur nontrivial overhead for refining abstract plans into concrete OBP executions,
  - require careful control of search depth and breadth to remain tractable.

## **4. Risk-Sensitive Objective Design**

- **Balancing Risk and Reward**  
  Designing failure-weighted cost functionals raises questions about:
  - how to aggregate heterogeneous failure types (terminal vs. recoverable vs. contention),
  - how conservative the planner should be in the face of epistemic uncertainty,
  - how to avoid pathological behavior (e.g., extreme risk aversion or risk seeking) as the environment evolves.
