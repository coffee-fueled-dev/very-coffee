# Full

## **1. Overview**

- Conceptual framing
- High-level description of TAPC components
- Execution + Observational semantics summary

## **2. Semantic Ontology**

(Formerly “Primitive Sorts and Core Definitions” but now more precise)

- State space (X) and trajectory space (\mathcal{T}(X))
- Ports as canonical affordance maps
- Port instances
- Offers as event nodes exposing port instances
- Actions as trajectory selections
- (Optional section on Port equivalence and refinement)

This section establishes the _meaning_ of the calculus.

## **3. Operational Semantics**

(This replaces “Structural Functions and Semantics” with a more conventional name.)

- Binding
- Action realization
- Offer-to-offer transitions
- Failure semantics (non-admissible cones → (\bot))
- Execution interpretation

This is the “how the calculus runs” section.

## **4. Concurrency and Compositional Semantics**

(This is your SMC section with a clearer role.)

- Definition of (\mathcal{W})
- Objects = offers
- Morphisms = actions
- Tensor product = independent affordance loci
- Symmetry = commutation of independent behaviors
- Sequential + parallel composition
- Interaction with affordance cones

This section explains the algebraic behavior.

## **5. Trace Semantics**

(This section stays as-is but reorganized around trajectory semantics.)

- Trace functor
- Shuffle / causal consistency
- Linearization of concurrent actions
- Replayability (from logs → morphisms)

This is your observational semantics layer.

## **6. Higher-Order Structure (Operads / Interfaces)**

(This is “Relationship to Operadic Structure” but broadened slightly.)

- Operadic interpretation of ports / affordances
- Interface composition
- Hierarchical and modular TAPC structures
- Interaction with categorical semantics
- Relationship between operads and SMC structure

This clarifies how the calculus composes at a structural/system level.

## **7. Optional: Applications / Examples / Execution Model**

## (This could be added later if you want a practical section.)

---

# Condensed

1. Overview
2. Semantic Primitives
3. Operational Semantics
4. Concurrency Semantics (SMC)
5. Observational Semantics (Traces)
6. Interface Structure (Operads)
