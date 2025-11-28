## Subjective OBP as First-Person Usage

This document describes **Subjective OBP** as a particular way of using the OBP calculus from the first-person perspective of an actor $A$: either as a view of the global execution category $\mathcal{W}$ or as a stand-alone OBP graph built from external observations, using OBP to maintain a belief-consistent internal plan and to learn from expectation violations.

In this usage, all formal structure (offers, ports, actions, binding, traces) remains that of $\mathcal{W}$. The difference is in **what state is tracked** and **how external observations are interpreted**.

### Subjective Deployment Patterns

Subjective OBP admits two complementary deployment patterns:

#### Embedded subjective usage (view of global $\mathcal{W}$):

There is a global execution category $\mathcal{W}$ (the "real world" calculus). Actor $A$ maintains its subjective state $\mathcal{S}_{\mathrm{Self}}$ and internal causal graph $\mathcal{G}_{\mathrm{Self}}$ as a belief-annotated slice or projection of this global structure. External events are morphisms in $\mathcal{W}$; Subjective OBP describes how $A$ interprets and predicts them, and how expectation violations feed back into TKN and $\mathcal{P}$.

#### Isolated subjective usage (stand-alone internal category):

No shared ground-truth $\mathcal{W}$ is assumed. Instead, $A$ maintains its own internal OBP category $\mathcal{W}_{\mathrm{Self}}$ with OBP syntax (offers, ports, binds, traces), whose semantics are purely relative to its observations. External stimuli are treated as an untyped event stream, and an encoder maps those events into this internal category, building an entirely internal causal graph. In this setting, OBP is a self-contained modeling language for causal structure; any global OBP is optional context.

## 1. Subjective State for an Actor

Consider an actor $A$ participating in OBP workflows. From $A$'s perspective, the relevant state splits into:

$$
\mathbf{S}_{\mathrm{Self}} = \mathbf{S}_{A} \times \mathcal{M}_{B},
$$

where:

- $\mathbf{S}_{A}$ is $A$'s **locally verifiable state** (its resources, offers, policies, and any state it can directly inspect or control),
- $\mathcal{M}_{B}$ is a **prediction model** of the counterparty (or environment) $B$, i.e.\ a learned probability distribution or structured model over $B$'s likely state, constraints, and future actions (informed by TKN and past traces).

Operationally, $\mathbf{S}_{\mathrm{Self}}$ may be structured as $A$'s _slice_ of the global OBP state, or a completely separate OBP graph.

## 2. Subjective Offers

An OBP **Offer** is a proposition about resources and policy. When used from the first-party perspective, $A$ classifies offers by how they are known:

$$
\mathcal{O}_{\mathrm{Self}} = \mathcal{O}_{\mathrm{Known}} \cup \mathcal{O}_{\mathrm{Predicted}}.
$$

- **Known offers $\mathcal{O}_{\mathrm{Known}}$:** Offers actually issued by $A$ (and possibly observed from the environment). These are backed by the usual OBP guarantees: they are concrete elements of $\mathsf{Offer}$ with well-defined ports and policies.
- **Predicted offers $\mathcal{O}_{\mathrm{Predicted}}$:** Internal hypotheses created by $A$ about what $B$ (or the environment) _will_ or _should_ do next. Formally, these are still elements of $\mathsf{Offer}$ in $\mathcal{W}$, but at the implementation level they carry only a **predicted policy set** rather than a verified one.

Subjective OBP thus treats some offers as **tested facts** and others as **testable hypotheses** about counterparties, while remaining within the same offer space.

## 3. Subjective Ports and the Internal Causal Graph

Ports in OBP are loci for transactions (bindings). In this first-person usage, $A$ uses ports to encode **internal expectations**:

$$
\mathcal{P}_{\mathrm{Self}}
= \{ \langle \mathrm{PortID}, \mathcal{O}_{\mathrm{Exp}}, \mathrm{SuccessState}, \mathrm{FailureState} \rangle \},
$$

Where the **expected offer** (known or predicted) that $A$ anticipates binding at this port is represented by:

$$
\mathcal{O}_{\mathrm{Exp}} \in \mathcal{O}_{\mathrm{Self}}
$$

And where the way $A$'s _subjective_ state should change if the expected binding occurs (or fails to occur) is represented by:

$$
\mathrm{SuccessState}, \mathrm{FailureState} \in \mathbf{S}_{\mathrm{Self}}
$$

From these ports and offers, $A$ builds an **internal causal graph**:

$$
\mathcal{G}_{\mathrm{Self}} = (\mathbf{S}_{\mathrm{Self}}, E\_{\mathrm{Self}}),
$$

where edges in $E_{\mathrm{Self}}$ correspond to bindings and actions that are:

- admissible with respect to $A$’s own policies and resources, and
- consistent with $A$’s current prediction model $\mathcal{M}_{B}$.

The planning engine $\mathcal{P}$ searches for paths in $\mathcal{G}_{\mathrm{Self}}$ that adhere to policy constraints, but in this case, those policies would be **internally consistent** from the perspective of $A$, not necessarily globally true.

## 4. Expectation vs. Observation: Violation Types

As $A$ executes a subjective plan, it observes **external actions** $O_{\mathrm{Ext}}$ performed by $B$ (or the environment). These are ordinary OBP actions that appear in traces under $\mathrm{Tr}$ / $\mathrm{Tr}_{\bot}$, but for $A$ they are also **tests** of its predictions.

Comparing $O_{\mathrm{Ext}}$ to the current expected binding at a subjective port yields several useful violation types (inputs to TKN):

| **Violation Type**            | **Condition (from $A$'s view)**                                                                                                          | **Interpretation**                                                                               |
| :---------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------- |
| Port Misuse (PM)              | $O_{\mathrm{Ext}}$ binds at the expected port but with an offer $\mathcal{O}_{\mathrm{Actual}} \neq \mathcal{O}_{\mathrm{Exp}}$          | $B$ achieves the intended transition, but via a different offer/policy than expected.            |
| Port Neglect (PN)             | $O_{\mathrm{Ext}}$ does **not** bind to the active expected port; instead, a new, unrelated action is observed                           | $B$ is pursuing a different intention; $A$'s planned causal chain is being bypassed.             |
| Offer Validation Failure (OF) | $A$ attempts to bind to a predicted offer $\mathcal{O}_{\mathrm{Predicted}}$, but external verification fails (the offer was never made) | $A$'s belief $\mathcal{M}_{B}$ was wrong about $B$'s resources or policy (prediction incorrect). |

These labels do not modify OBP itself; they are **annotations on traces** that describe how external reality diverges from $A$’s internal expectations.

## 5. Self-Correction Loop in Subjective Mode

When a violation (PM, PN, or OF) is detected, $A$ uses the same triad machinery to self-correct:

1. **State update:** $\mathbf{S}_{\mathrm{Self}}$ is updated based on the actual observation $O_{\mathrm{Ext}}$, creating a new branch in $A$'s internal causal graph $\mathcal{G}_{\mathrm{Self}}$.
2. **TKN feedback:** The violation event, its type (PM/PN/OF), and its context are fed into TKN via $\mathrm{Tr}_{\bot}$-annotated traces, enriching $\mathcal{M}_{B}$ with evidence about counterparty behavior.
3. **Plan re-synthesis:** The planner $\mathcal{P}$ is invoked to re-synthesize a new plan $\Pi'$ from the updated $\mathbf{S}_{\mathrm{Self}}$, using the updated morphemes and metrics from TKN.

In this way, Subjective OBP uses the **deterministic rigor of OBP** to define an internally sound plan, then uses **deviations from that plan** as structured training signals for TKN and $\mathcal{P}$.

## 6. Relationship to the Base OBP Model

Subjective OBP does **not** introduce new operators or axioms; it is a _view_ of the existing calculus from the standpoint of a single actor:

- **Preserved structure:**

  - Offers, ports, and binds are still elements of $\mathsf{Offer}$, $\mathsf{Port}$, and $\mathsf{Action}$ in $\mathcal{W}$.
  - The binding operator and action semantics are unchanged; they remain governed by the global constraints of OBP.
  - Traces are still produced by $\mathrm{Tr}$ and $\mathrm{Tr}_{\bot}$; Subjective OBP merely tags and interprets them from $A$’s perspective.

- **Shift in guarantee:**
  - In the **global** reading of OBP, the key property is transactional **admissibility** with respect to a shared state space and shared policies.
  - In the **subjective** reading, the key property is **internal planning consistency** with respect to $A$'s belief state $\mathbf{S}_{\mathrm{Self}}$ and prediction model $\mathcal{M}_{B}$.

Conceptually, Subjective OBP is best understood as a **first-person usage of OBP** in which an actor:

- uses OBP to encode a belief-consistent internal plan,
- treats external OBP executions as tests of that plan, and
- feeds discrepancies between plan and reality back into TKN and $\mathcal{P}$ to refine both its beliefs and its future plans.

The underlying formal model remains the same; only the _interpretation_ and _usage_ pattern change.

## 7. Ad-Hoc Structure and External Effects in Subjective Usage

As in the global formulation, there is no requirement that all offers and ports be declared up front. Actor $A$ may:

- introduce new offers and ports **ad hoc** as its own policies evolve,
- add ports **port-by-port** when it refines or extends its expectations, and
- discover offers and ports **observationally** by reading external event streams and reconstructing them into elements of $\mathsf{Offer}$ and $\mathsf{Port}$.

Subjective OBP does not itself mutate the external world; it formalizes how $A$ organizes and interprets causal structure. When $A$ chooses to act, each selected action is realized by an external effect handler (e.g.\ API call), and OBP records the resulting transitions. Thus, in first-person usage, OBP can be used:

- purely as an **interpretive lens** over externally generated events (embedded in or projected from a global $\mathcal{W}$), or
- as a **decision engine** on top of a self-contained internal graph, when combined with $\mathcal{P}$ and effectful handlers that execute the chosen actions on behalf of $A$.
  $$
