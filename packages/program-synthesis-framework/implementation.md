## Practical Integration: Turning the Triad into a Usable Platform

This document describes how to turn the OBP–TKN–$\mathcal{P}$ triad into a realizable system that an engineer can adopt without learning the underlying formal methods. The goal is to expose simple services and configuration points, while the platform enforces the formal semantics internally.

## 1. Abstracting the Calculus: The Causal Execution Engine

The complexity of the **OBP Calculus ($\mathcal{W}$) and its SMC foundation** lives inside a core service: the **Causal Execution Engine**.

| **Formal Concept**                                      | **Developer Interface**        | **How it is Simplified**                                                                                                                                                                              |
| :------------------------------------------------------ | :----------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Symmetric Monoidal Category ($\otimes, \circ$)          | `obp.execute(program)`         | The developer never manipulates morphisms directly. They submit a plan or program; the Engine handles concurrency, sequencing, and state transitions according to OBP’s categorical semantics.        |
| Trace Functors ($\mathrm{Tr}$, $\mathrm{Tr}_{\bot}$)    | Automatic logging              | Every state change and failure is automatically logged and serialized. The Engine pushes traces to TKN; developers do not call $\mathrm{Tr}$ or reason about traces explicitly.                       |
| State space / invariants ($X$, $\mathcal{T}(X)$, types) | Type definitions / schemas     | Developers define schemas for $\mathsf{Party}$, $\mathsf{Offer}$ metadata, and $\mathsf{ResourcePool}$ using familiar tools (e.g. Zod/TypeScript). The Engine guarantees that mutations respect them. |
| Transactional semantics of $\mathsf{Bind}$              | Idempotent API calls / retries | The Engine implements reservations, 2PC, and checkpoints. From the developer’s view, `execute` is safe to retry; rollback and failure semantics are handled by the runtime.                           |

The developer sees a robust “workflow runtime with logging,” not a process calculus.

## 2. Domain Modeling as Configuration (Not Calculus)

Implementers define the system’s “physics” via configuration and small handlers, rather than by writing OBP primitives.

| **OBP Primitive**                 | **Developer Asset**    | **Developer Focus**                                                                                                                                                         |
| :-------------------------------- | :--------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| $\mathsf{Offer}, \mathsf{Port}$   | YAML/JSON schemas      | Describe contract/interface structure (e.g. `PortType: Commit`, `MaxBindings: 1`, `Expiration: 1234`).                                                                      |
| $\mathsf{Action}$ effect          | Imperative API handler | Implement the side-effecting work in a normal function/service (Python/Node/Go). This code “does the work” but is _not_ trusted to enforce legality or invariants.          |
| $\mathsf{Action}$ cone (legality) | Declarative policy DSL | Write simple, human-readable rules (e.g. Rego, Polar) that state when an action is allowed. The platform compiles these into the formal admissibility predicates for ports. |

All of this can live in a version-controlled “domain config” repo alongside normal code.

## 3. The Logic Layer: Policy-as-Code for Action Cones

The mathematically heavy notion of an **admissible trajectory** through an action cone is surfaced as a **Rule Engine**.

- **Rule files:** Developers write policies against a JSON-like view of state:

  ```yaml
  # Policy for a 'COMMIT' port
  rule "can_commit" {
    # Must be in the right phase
    offer.state == "bound"
    # Must have paid up front
    party.funds_held >= offer.final_cost
    # Must not be expired
    offer.ts_expired > NOW()
  }
  ```

- **Compiler’s role:** The platform compiles these rules into the constraint logic that defines $\mathcal{T}(X)$ and each port’s action cone. Developers specify the **what** (business rule); the platform enforces the **how** (OBP semantics, consistency, failure handling).

## 4. Abstracting Learning and Planning: Metrics and Cost Interface

TKN (morpheme learner) and $\mathcal{P}$ (planner) are exposed only through dashboards and a **cost function interface**.

- **TKN insights dashboard:** Visualizes morphemes, transition graph, and **hub scores**. Engineers treat the hub score as a metric of **reusability/structure** for protocols, without touching the underlying graph algorithms.
- **Cost function API:** Rather than re-implementing $\mathsf{Cost}(m)$ from the formal document, implementers configure three intuitive weights:

  1. **Efficiency weight** $\mathsf{W}_{\text{length}}$ – importance of program shortness.
  2. **Structure weight** $\mathsf{W}_{\text{hub}}$ – importance of protocol reuse / structural quality.
  3. **Risk weight** $\mathsf{W}_{\text{fail}}$ – importance of avoiding prefixes known (via $\mathrm{Tr}_{\bot}$) to lead to specific failure types $\bot_i$.

Internally, the platform combines these into the formal cost
\[
\mathsf{Cost}(m) = \mathsf{Cost}_{\mathrm{struct}}(m) + \mathsf{P}_{\mathrm{fail}}(m),
\]
but externally, the engineer just sets or tunes the weights.

## 5. Weights as a Hyperparameter: Learning to Rank

Manually choosing $(\mathsf{W}_{\text{length}}, \mathsf{W}_{\text{hub}}, \mathsf{W}_{\text{fail}})$ is brittle. The platform should treat these as **hyperparameters** and optimize them statistically against a single, high-level business goal.

### 5.1 Define the Organizational Utility Function ($\mathsf{U}$)

The implementer specifies **one top-level objective** instead of many low-level weights. Examples:

| **Utility $\mathsf{U}$** | **Intuitive Goal**                                                                               |
| :----------------------- | :----------------------------------------------------------------------------------------------- |
| Max Reliability / Safety | Maximize the proportion of synthesized programs that complete without hitting any $\bot$ state.  |
| Max Resource Throughput  | Maximize the number of successful commitments per unit time.                                     |
| Min Total Cost           | Minimize $\mathsf{Cost}_{\mathrm{struct}}$ plus real-world costs (latency, failed transactions). |

The engineer sets, for example, “Objective = Maximize Reliability,” and the platform is responsible for realizing this in weight space.

### 5.2 Auto-Tuning Weights via Bayesian Optimization

A **Learning-to-Rank (LTR) service** runs continuously (or in scheduled batches) to tune the weights.

- **Input data:** Historical traces from $\mathrm{Tr}$ and $\mathrm{Tr}_{\bot}$, labeled with final outcomes (success, $\bot_{\mathbf{R}}$, $\bot_{\mathbf{C}}$, hard failure).
- **Optimizer:** Bayesian Optimization (or similar) explores combinations of weights $(\mathsf{W})$.
- **Loop:**
  - Optimizer proposes weights $(\mathsf{W}_{\text{length}}, \mathsf{W}_{\text{hub}}, \mathsf{W}_{\text{fail}})$ and per-failure-class $\mathsf{W}_i$.
  - $\mathcal{P}$ uses these to synthesize plans.
  - Plans are simulated or run in production, and their realized utility $\mathsf{U}$ is measured.
  - The optimizer updates its model and proposes better weights.

The result is a cost function that is statistically aligned with the organization’s chosen objective, rather than hand-tuned.

## 6. Deriving Risk Weights from Business Cost

For failure classes (e.g. recoverable $\bot_{\mathbf{R}}$, contention $\bot_{\mathbf{C}}$, terminal), the risk weights $\mathsf{W}_i$ should reflect **real-world cost of failure**, not arbitrary numbers.

- Example mapping from historical data:
  \[
  \mathsf{W}\_{\mathbf{C}}
  \propto
  \frac{\text{Historical Financial Loss of Contention}}{\text{Total Transactions}}.
  \]

- The implementer specifies statements like:
  - “A contention failure $\bot_{\mathbf{C}}$ costs us \$100 in re-planning and delay.”
  - “A terminal failure costs \$10,000 in remediation and SLA penalties.”

The platform converts these into concrete $\mathsf{W}_i$ values used in $\mathsf{P}_{\mathrm{fail}}(m)$, ensuring that $\mathcal{P}$ optimizes against the **true economic impact of risk**.

## 7. Engineer’s Workflow Summary

In practice, an engineer adopting the triad-enabled platform would:

1. **Model the domain**

   - Define schemas for parties, offers, ports, and resources.
   - Attach small imperative handlers for effects.
   - Write policy-as-code rules for port legality.

2. **Deploy the Causal Execution Engine**

   - Use `obp.execute(program)` (or equivalent) as the single entrypoint for plans.
   - Let the engine handle concurrency, transactions, checkpointing, and logging.

3. **Activate Learning and Planning**

   - Turn on TKN trace ingestion and morpheme discovery.
   - Enable $\mathcal{P}$ to propose plans for selected goals.

4. **Configure objectives, not formulas**
   - Set the organizational utility $\mathsf{U}$ (e.g. maximize reliability).
   - Provide real-world costs for failure types (e.g. \$ per $\bot_{\mathbf{C}}$ event).
   - Let the LTR service tune $(\mathsf{W}_{\text{length}}, \mathsf{W}_{\text{hub}}, \mathsf{W}_{\text{fail}}, \mathsf{W}_i)$ automatically.

By keeping all formalism inside the platform and exposing only schemas, rules, metrics, and objectives, the triad becomes a practical system an engineer can adopt without learning a new formal method.
