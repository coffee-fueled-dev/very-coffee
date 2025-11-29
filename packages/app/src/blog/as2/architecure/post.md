# **An Architecture for Causally-Grounded Agentic Behavior**

This document describes an agentic architecture built from three interacting subsystems:

1. **The Offer–Bind–Port (OBP) Calculus** — the agent's causal interface to the world.
2. **The Online Learner $\mathcal{L}$** — a structural pattern extractor over causal traces.
3. **The Planning Engine $\mathcal{P}$** — a goal-driven synthesizer of admissible causal programs.

Together, these systems form a closed-loop of **perception**, **learning**, **planning**, and **world-model revision**.

# **1. OBP: The Causal Substrate of Action and Perception**

OBP defines the semantics of causal interaction through offers, ports, admissible cones, and binding actions.
Its semantics are given as a symmetric monoidal category $\mathcal{W}$ whose morphisms are valid execution trajectories.
(See formal OBP definitions: )

OBP provides:

- explicit representation of actions and resources,
- causally meaningful transitions,
- structured failure (via inadmissibility and $\mathrm{Tr}_\bot$),
- a **trace functor** that extracts linear streams of atomic actions,
- and a foundation for **concurrent, transactional multiparty orchestration** via its symmetric monoidal structure and binding semantics.

From the agent’s perspective, OBP is both:

1. **the real external causal world**, and
2. **the format in which reality is perceived** (through traces).

OBP is therefore the agent’s **causal perceptual medium**.

# **2. Subjective OBP: Internal Causal Modeling and Prediction**

The agent maintains an internal OBP category $\mathcal{W}\_{\mathrm{Self}}$ built from:

- locally verified offers and ports,
- predicted partner behavior,
- and internally simulated causal transitions.

(See Subjective OBP specification: )

$\mathcal{W}\_{\mathrm{Self}}$ serves as the agent's **subjective causal model**.
Within it, the agent expresses:

- **predicted offers**,
- **expected bindings**,
- **anticipated successor states**,
- and **policy-constrained causal pathways**.

Predictions inhabit the same syntactic and structural space as actual OBP elements.
This enables direct comparison between:

$$
\text{(predicted trajectory in } \mathcal{W}\_{\mathrm{Self}}\text{)}
\quad\text{and}\quad
\text{(observed trajectory in } \mathcal{W}\text{)}.
$$

When the world deviates from prediction, the agent receives **structured violation signals** such as:

- Port Misuse (PM),
- Port Neglect (PN),
- Offer Validation Failure (OF).

These are defined as subjective divergences within the OBP framework itself.

# **3. Online Learner $\mathcal{L}$: Structural Abstraction of Causal Experience**

The Online Learner processes the action trace emitted by OBP.
It is defined as a triple:

$$
\mathcal{L} = (\mathsf{Ingest},\ \mathsf{Emit},\ \mathsf{Update}),
$$

with internal state

$$
\mathsf{State} = (D,\ G,\ T).
$$

(See learner definition: )

$\mathcal{L}$ performs three roles:

### 3.1 **Segmentation**

The learner ingests the symbol stream:

$$
x_1, x_2, x_3, \dots
$$

and segments it online into symbol groups $p_i$.

### 3.2 **Lattice Construction**

Each emitted group updates:

- dictionary (D),
- transition graph (G),
- prefix trie (T).

These structures form a **symbol-group lattice** representing recurring causal fragments.

### 3.3 **Structural Metrics**

The learner computes graph-theoretic measures:

$$
\deg^+(p), \qquad \mathrm{hub}(p) = \log(1 + \deg^+(p)),
$$

and others (e.g., PageRank).

### **Non-Semantic Nature**

The learner is _purely structural_:
it does not assign valence (good vs. bad) to any group.
It records both successful and failure-related patterns identically.

For the formal typed-trace interface between OBP and the learner (including the categorical alphabet and event encoding), see the **Integration** post.

# **4. Planning Engine $\mathcal{P}$: Goal-Directed Synthesis of Causal Programs**

The Planning Engine constructs plans over a state space $\mathcal{S}$ derived from OBP states.
(See planning engine specification: )

Primitive actions in $\mathcal{A}$ correspond to admissible OBP bindings.
Learner-discovered groups become **macro-actions** $\mathcal{M}$.

A plan is a sequence:

$$
\Pi = [o_1, \ldots, o_n], \quad o_i \in \mathcal{A} \cup \mathcal{M},
$$

subject to:

- state transition determinism,
- OBP admissibility,
- goal achievement,
- cost criteria.

### **Interpretation of Causality and Failure**

The Planning Engine is the system responsible for:

- interpreting morphemes in the context of the current OBP state,
- evaluating whether a sequence leads toward or away from goals,
- determining whether predicted OBP transitions are reliable,
- and using violation events (PM/PN/OF) to reassess causal expectations.

The planner uniquely attaches **semantic valence**—success, risk, failure—to sequences discovered by $\mathcal{L}$.

For the categorical presentation of the planning category, its monoidal structure, and the functorial interfaces to $\mathcal{L}$ and $\mathcal{W}$, see the **Integration** post.

### 4.2 **Planning Category $\mathcal{P}$**

The Planning Engine can be understood as operating inside a **planning category** $\mathcal{P}$ that organizes primitive OBP actions and learned morphemes into typed, composable plans. This categorical view explains how $\mathcal{P}$ interfaces with the OBP world category $\mathcal{W}$ and the learner’s syntactic category.

- **Objects and morphisms**

  - **Objects**:  
    The objects of $\mathcal{P}$ are abstract state/interface types:

$$
\mathrm{Ob}(\mathcal{P}) = \mathcal{T},
$$

where each $A \in \mathcal{T}$ describes a region of the OBP world (e.g. “session unauthenticated”, “offer with $n$ open ports”, “authorized session”). A typing function maps concrete OBP states to planning types:

$$
\mathsf{type}_\mathcal{P} : \mathsf{States}_{\mathcal{W}} \to \mathcal{T}.
$$

- **Morphisms**:  
  A morphism $f : A \to B$ in $\mathcal{P}$ is a **well-typed operation** that transforms states of type $A$ into states of type $B$. Morphisms include:

  - primitive operations corresponding to primitive OBP actions (ports, bindings, etc.),
  - **morpheme macros** promoted from the learner’s lattice, with induced types,
  - composite plans obtained by composing other morphisms.

  The hom-set $\mathsf{Hom}_\mathcal{P}(A,B)$ collects all such morphisms.

- **Identities, composition, and planning problems**

$\mathcal{P}$ is a category in the usual sense:

- each object $A$ has an identity morphism $\mathrm{id}_A : A \to A$ (“do nothing”),
- if $f : A \to B$ and $g : B \to C$, there is a composite $g \circ f : A \to C$,
- composition is associative and identities are left/right units.

A **concrete planner state** is a pair $(s, A)$ where $s$ is a concrete OBP state and $A = \mathsf{type}_\mathcal{P}(s)$ is its planning type. A **planning problem** specifies:

- a start state $s$ with type $A$,
- a goal condition as a target type $B \in \mathcal{T}$ or predicate $\mathsf{Goal} : \mathcal{T} \to \{\mathsf{true}, \mathsf{false}\}$.

Planning then means: find a morphism $p : A \to B$ in $\mathcal{P}$ with a goal-satisfying target and acceptable cost/risk. In this view, the existing primitives

- `Applicable(o, S)` check whether an operation $o$ has domain type matching $\mathsf{type}_\mathcal{P}(S)$ (plus any side conditions),
- `Apply(o, S)` execute the corresponding morphism on a concrete state.

- **Monoidal structure (concurrency)**

$\mathcal{P}$ carries a **symmetric monoidal structure** that mirrors $\mathcal{W}$:

- on objects, a tensor

$$
\otimes : \mathcal{T} \times \mathcal{T} \to \mathcal{T}
$$

    represents independent subsystems or combined interfaces;

- on morphisms, a tensor

$$
\otimes : \mathsf{Hom}_\mathcal{P}(A_1,B_1) \times \mathsf{Hom}_\mathcal{P}(A_2,B_2)
\to \mathsf{Hom}_\mathcal{P}(A_1 \otimes A_2,\ B_1 \otimes B_2)
$$

    represents **parallel execution** of independent operations.

Sequential composition in $\mathcal{P}$ corresponds to sequential composition of traces; tensor composition corresponds to parallel blocks (as marked by `PAR_START`/`PAR_END` in the trace alphabet). The monoidal laws are inherited from OBP’s world category $\mathcal{W}$.

- **Enrichment with cost and risk**

$\mathcal{P}$ is enriched over a **cost/risk monoid** $(V,\oplus,0_V)$:

- $V$ may be $\mathbb{R}\_{\ge 0}$ for cost, or a product such as $\mathbb{R}\_{\ge 0} \times [0,1]$ for (cost, risk),
- $\oplus$ combines costs along a composite plan (e.g. addition or a more general aggregator).

Each morphism $f : A \to B$ has an evaluation

$$
\mathsf{eval}(f) \in V,
$$

estimated from observed executions (trace statistics from $\mathcal{L}$ and failure diagnostics from OBP). For composable $f : A \to B$, $g : B \to C$ we expect, up to approximation:

$$
\mathsf{eval}(g \circ f) \approx \mathsf{eval}(f) \oplus \mathsf{eval}(g).
$$

Planning becomes: find $p : A \to B$ with goal-satisfying target and acceptable $\mathsf{eval}(p)$, or minimizing $\mathsf{eval}(p)$ under a suitable ordering on $V$.

- **Interface to the learner: promotion functor $J : \mathcal{C}_L \to \mathcal{P}$**

The learner’s lattice defines a **syntactic category** $\mathcal{C}_L$ whose objects are the same abstract types $\mathcal{T}$ and whose morphisms are learned morphemes with induced types. A **promotion functor**

$$
J : \mathcal{C}_L \to \mathcal{P}
$$

maps:

- objects: $J(A) = A$ for all $A \in \mathcal{T}$,
- admissible morphemes $m : A \to B$ to macro-operations $J(m) \in \mathsf{Hom}_\mathcal{P}(A,B)$.

Operationally, $J$ is implemented by the integration layer as a registration mechanism: identify a morpheme, infer its type and statistics, decide whether to promote it, and insert the corresponding operation into $\mathcal{P}$. The learner itself remains unaware of $\mathcal{P}$.

- **Interface to OBP: execution functor $\mathrm{Exec} : \mathcal{P} \to \mathcal{W}$**

Let $\mathcal{W}$ denote the OBP world category (offers/ports and their causal trajectories). An **execution functor**

$$
\mathrm{Exec} : \mathcal{P} \to \mathcal{W}
$$

connects plans to concrete OBP executions:

- on objects, $\mathrm{Exec}(A)$ is the corresponding OBP interface object,
- on primitive morphisms, $\mathrm{Exec}(f)$ is the OBP primitive action (or short program) implementing $f$,
- on composites, $\mathrm{Exec}(g \circ f) = \mathrm{Exec}(g) \circ \mathrm{Exec}(f)$ and similarly for $\otimes$.

When the planner selects a plan $p : A \to B$, executing $p$ means applying $\mathrm{Exec}(p)$ in $\mathcal{W}$, observing the resulting state and failure/success events, and feeding those observations back into:

- updated cost/risk estimates $\mathsf{eval}(f)$,
- new traces for $\mathcal{L}$'s lattice,
- potential updates to the subjective OBP model $\mathcal{W}_{\mathrm{Self}}$.

- **Equations and rewrite theory (optional)**

Runtime experience may reveal **equations** between morphisms in $\mathcal{P}$,

$$
f \approx g \quad\text{with}\quad f,g : A \to B,
$$

representing empirically equivalent plans. The planner can treat these as a **rewrite theory**, searching modulo these equations and preferring cheaper/safer representatives. Formally, $\mathcal{P}$ becomes a category presented by generators (primitive and morpheme operations) and relations (equations) that the search algorithms respect.

# **5. Failure Propagation and Causal Model Revision**

For a detailed account of how failure signals move through OBP, the learner, and the planner—and how they drive causal model revision and the full cognitive loop—see the **Integration** post.
