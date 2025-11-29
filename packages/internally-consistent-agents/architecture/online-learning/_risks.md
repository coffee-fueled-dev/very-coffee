# **Online Learner $\mathcal{L}$ – Risks and Open Questions**

## **1. Stabilization and Growth Control**

- **Unbounded Lattice Growth**  
  Without careful pruning and thresholding, the transition graph and prefix trie may:

  - grow without bound on long-running systems,
  - accumulate low-value or spurious morphemes,
  - degrade performance for both learning and planning.

- **Convergence Behavior**  
  While related literatures (ALERGIA, context-tree weighting, etc.) provide convergence results, $\mathcal{L}$'s concrete heuristics must be tuned to:
  - avoid oscillatory re-segmentation,
  - ensure that high-confidence morphemes stabilize over time.

## **2. Unsafe or Misleading Macros**

- **Macro-Action Promotion Risks**  
  Promoting morphemes to macro-actions for $\mathcal{P}$ can introduce:
  - macros that skip critical checks or guards seen only rarely in data,
  - overfitting to historically common but undesirable behaviors,
  - brittle abstractions that break when environment statistics shift.

## **3. Bias and Data Quality**

- **Trace-Driven Biases**  
  Because $\mathcal{L}$ learns solely from observed traces:
  - missing or underrepresented behaviors may never be abstracted,
  - failure-heavy regimes can skew morpheme importance scores,
  - changes in logging or instrumentation may silently shift the learning distribution.

## **4. Interaction with Abstraction and Compression**

- **Coupling to Intent-Based Compression**  
  When OBP graphs are collapsed into intent-level representations, there is risk that:
  - segmentation operates on already-abstracted traces and misses fine-grained failure signals,
  - morphemes learned at one abstraction level become unsafe when decoded differently later.  
    This suggests the need for explicit policies on which trace layers $\mathcal{L}$ should observe.
