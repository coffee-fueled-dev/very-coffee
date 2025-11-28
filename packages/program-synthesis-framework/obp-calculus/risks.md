# **OBP Calculus – Risks and Open Questions**

## **1. Failure Semantics**

- **Absorbing vs. Monadic Failure**  
  OBP currently uses a strict absorbing sink \(\bot\) (failure contaminates all concurrent context). Open risks:
  - coarse failure semantics may be too rigid for nuanced rollback / compensation patterns,
  - mixing partiality and concurrency can make reasoning about liveness subtle.  
    Design question: when (if ever) to migrate toward a more refined, monadic failure model while preserving existing guarantees.

## **2. Stochastic Semantics and Measures**

- **Measure-Theoretic Subtleties**  
  Modeling stochastic ports as Markov kernels over \(\mathcal{T}(X)\) raises:
  - measurability concerns on trajectory spaces,
  - issues around composing kernels over infinite-horizon or continuous-time trajectories,
  - edge cases in defining and estimating probability measures from finite logs.  
    These subtleties affect the soundness of probabilistic reasoning in \(\mathcal{W}\).

## **3. Coherence of Operad and SMC**

- **Structural Consistency**  
  The operadic interface layer and the SMC \(\mathcal{W}\) must satisfy coherence conditions:
  - substitutions in the operad should correspond to well-defined morphism compositions in \(\mathcal{W}\),
  - tensoring and sequencing at the categorical level must respect the intended wiring discipline.  
    Failure to maintain this correspondence risks:
  - “syntactically valid but semantically ill-typed” compositions,
  - difficult-to-diagnose bugs in higher-level tooling that relies on operadic reasoning.

## **4. Abstraction Safety**

- **Collapsing OBP Graphs**  
  Collapsing states and morphisms for intent-based compression or state abstraction carries:
  - the risk of merging behaviorally distinct states (breaking soundness),
  - the danger of introducing unsafe macros that skip over important guards or failure modes,
  - potential misalignment between abstract and concrete failure behavior.  
    Safe abstraction likely requires bisimulation-style or abstract-interpretation-style guarantees.

## **5. Complexity and Unknown Unknowns**

- **Trace Explosion and Canonicalization**  
  Without principled use of true-concurrency structures (pomsets, event structures), trace spaces can explode combinatorially, making:

  - learning from traces harder,
  - planning and analysis over traces intractable.

- **Modeling Gaps**  
  As OBP is extended with richer port types, stochastic semantics, and intent-based compression, there is ongoing risk of:
  - subtle mismatches between intended and actual semantics,
  - hidden corner cases in concurrent failure propagation and recovery.
