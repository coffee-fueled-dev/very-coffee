# **An Integrated Architecture for Causally-Grounded Agentic Behavior**

This document describes an agentic architecture built from three interacting formal subsystems:

1. **The Offer–Bind–Port Calculus (OBP)** — the agent’s causal interface to the world.
2. **The Online Learner $\mathcal{L}$** — a structural pattern extractor over causal traces.
3. **The Planning Engine $\mathcal{P}$** — a goal-driven synthesizer of admissible causal programs.

Together, these systems form a closed-loop of **perception**, **learning**, **planning**, and **world-model revision**.

# **1. OBP: The Causal Substrate of Action and Perception**

OBP defines the **formal semantics of causal interaction** through offers, ports, admissible cones, and binding actions.
Its semantics are given as a symmetric monoidal category $\mathcal{W}$ whose morphisms are valid execution trajectories.
(See formal OBP definitions: )

OBP provides:

- explicit representation of actions and resources,
- causally meaningful transitions,
- structured failure (via inadmissibility and $\mathrm{Tr}_\bot$),
- and a **trace functor** that extracts linear streams of atomic actions.

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

# **5. Failure Propagation and Causal Model Revision**

Causally significant negative events flow through the system in a structured manner:

### **5.1 OBP: Failure Detection**

OBP detects failures through:

- inadmissible bindings,
- $\mathrm{Tr}\_\bot$ failure traces,
- and subjective violation classifications (PM/PN/OF).

These events are encoded as symbols in the trace stream.

### **5.2 Learner: Structural Incorporation**

The learner records these events in (D), (G), and (T) without interpretation.
They become part of the procedural landscape.

### **5.3 Planner: Semantic Interpretation**

The planner determines that certain morphemes or transitions:

- consistently lead to unacceptable states,
- contradict predictions in $\mathcal{W}\_{\mathrm{Self}}$,
- or indicate incorrect assumptions about counterparties or resources.

The planner infers that the agent’s causal model must be updated.

### **5.4 OBP-Model Revision**

The planner's interpretation triggers updates to the agent's subjective OBP model:

$$
\mathcal{W}\_{\mathrm{Self}}
\longrightarrow
\mathcal{W}\_{\mathrm{Self}}'.
$$

Revisions may include:

- adjusting admissible cones,
- removing invalid predicted offers,
- inserting newly discovered offers,
- refining counterparty models $\mathcal{M}_B$,
- updating expected port behaviors,
- or restructuring internal causal pathways.

This revised OBP model governs future perception and future planning.

# **6. The Complete Closed-Loop Cognitive Cycle**

The architecture forms a tightly integrated cycle:

### **1. World Execution (OBP)**

Real actions produce traces through $\mathrm{Tr}$ and $\mathrm{Tr}_\bot$.

### **2. Perception (Subjective OBP)**

Traces are interpreted relative to predicted causal trajectories in $\mathcal{W}\_{\mathrm{Self}}$.

### **3. Structural Learning $\mathcal{L}$**

The learner extracts morphemes and updates the symbol-group lattice.

### **4. Deliberative Planning $\mathcal{P}$**

The planner uses the updated lattice and the current OBP model to construct valid causal programs.

### **5. Projection (Subjective OBP)**

Plans are projected as predicted causal structures in $\mathcal{W}\_{\mathrm{Self}}$.

### **6. Observation (OBP Reality)**

Reality produces actual OBP trajectories, revealing mismatches.

### **7. Failure Interpretation $\mathcal{P}$**

The planner interprets structural patterns and violations.

### **8. Causal Model Revision (Subjective OBP)**

The agent updates $\mathcal{W}\_{\mathrm{Self}}$ and $\mathcal{M}_B$, refining its causal worldview.

### **9. Loop**

The updated OBP model influences the next perception → learning → planning cycle.

This architecture yields an agent capable of:

- grounding its reasoning in explicit causal structure,
- abstracting reusable procedures from experience,
- synthesizing intentional causal programs,
- perceiving the world through a unifying causal calculus,
- and continuously revising its world model in response to failure.
