# Neural Realization of OBP Ports

## 1. Introduction

This document describes a principled approach for grounding **OBP Ports** in **neural models** while preserving the formal semantics of the OBP calculus. The goal is to unify:

- Symbolic guarantees (offers, ports, causal structure)
- Empirical grounding via trajectories (action cones)
- Continuous, generalizable behavior implemented by a shared neural world model

The resulting architecture allows Ports to act as **symbolic handles** into a high‑capacity learned dynamics model, enabling agents to execute actions, plan, and learn while maintaining introspectable causal semantics.

---

## 2. What an OBP Port Is (Formal Semantics)

Within the OBP workflow calculus, a **Port** is a symbolic interface that identifies:

1. **A locus of causal interaction**
2. **A family of admissible trajectories** from one offer to another
3. **A guarantee** that any successful binding at that port corresponds to a trajectory in its action cone

Formally, a Port $p$ at state $x$ and context $C$ exposes an **action cone**:

$$
P(x, C) \subseteq \mathcal{T}(X)
$$

where $\mathcal{T}(X)$ is the space of admissible trajectories through state space $X$.

A successful binding:

$$
(O, p) \to O'
$$

acts as a **witness** that a feasible trajectory existed inside the cone.

---

## 3. Design Goal for Neural Realization

Neural realization must satisfy three constraints:

### **3.1 Preserve Symbolic Structure**

Ports, offers, and action cones must retain their formal meaning. Neural components may refine or approximate cones but cannot redefine their admissibility semantics.

### **3.2 Share Neural Computation**

We avoid training a model per port. Instead, a global dynamics model is shared, and Ports act as **conditioning mechanisms**.

### **3.3 Provide Continuous Generalization**

Neural fields should encode smooth variations in behavior, allowing generalization beyond individual observed trajectories.

---

## 4. Ports as Conditioning Interfaces

The key insight:

> **A Port is a symbolic pointer that conditions a global neural dynamics model to produce trajectories consistent with that Port's action cone.**

Ports do not own large neural models; instead, they carry:

- A symbolic ID
- A learned continuous embedding $e_p$
- Optional lightweight specialization modules (e.g., adapters)

The neural model interprets $e_p$ as a request to sample from the region of trajectory space previously associated with the Port.

---

## 5. Shared Neural World Model

We introduce a global neural model:

$$
G_\phi : (x, C, e_O, e_p, \theta) \mapsto \tau
$$

Where:

- $x$ is the current state (latent)
- $C$ is contextual information
- $e_O$ and $e_p$ are Offer and Port embeddings
- $\theta$ is a latent control parameter
- $\tau$ is a trajectory through latent space

$G_\phi$ may be:

- a learned dynamics model,
- a transformer with temporal rollouts,
- a neural ODE,
- a diffusion model over trajectories.

Ports become symbolic selectors into this model.

---

## 6. Port-Specific Conditioning Mechanisms

To make port-specific behavior efficient and composable, we introduce **lightweight conditioning mechanisms** tied to each Port. These mechanisms specialize a shared world model without changing its core parameters. Examples include:

- low‑rank adapter modules (e.g.\ LoRA-style adapters),
- mixture-of-experts routing or gating keyed by Port embeddings,
- attention biases or prompt-like context features conditioned on the Port.

In a concrete adapter-based design:

- the adapter adjusts intermediate activations of $G_\phi$,
- it gives each Port a lightweight specialization path,
- it preserves parameter sharing while enabling distinct behavior.

These mechanisms act as:

- local filters for trajectory generation,
- residual specializations of the world model,
- neural manifestations of the action cone.

A Port's action cone can then be realized as:

$$
P(x, C) = \{ G_\phi(x, C, e_O, e_p, \theta) \mid \theta \in \Theta(x,C) \}
$$

with port-specific behavior introduced via the conditioning associated to $p$ (e.g.\ its embedding $e_p$ and any attached adapter or routing logic).

### 6.1 Autoregressive Realization via OBP and the Learning Module

An alternative, fully autoregressive realization of port focus uses the existing OBP and Learning Module structure without committing to any particular adapter family:

- OBP provides **typed action and port symbols** via the trace functor $\mathrm{Tr} : \mathcal{W} \to \mathrm{List}(\mathsf{Action})$ and labeling map $\mathsf{lab} : \mathsf{Action} \to \Sigma$.
- The Learning Module $\mathcal{L}$ discovers **morphemes** and **macro-actions** as reusable patterns over these symbol sequences.

A sequence model can then operate over **trace tokens** that encode, for each step, features such as

$$
(\text{state features},\ \text{offer ID},\ \text{port ID},\ \text{context summary},\ \text{morpheme / macro ID},\ \dots).
$$

Trained autoregressively, such a model learns the conditional distribution

$$
p(\tau \mid x, C, \text{port token}, \text{history}),
$$

which serves as a neural realization of the stochastic action cone $P_{\mathrm{stoch}}(x, C)$. In this view:

- **port focus** arises because the port (and possibly macro) identifiers are part of the conditioning context,
- **macro-actions** provide high-level trajectory schemas, while ports specify local loci of binding,
- detailed trajectories are **unwound autoregressively** in a manner consistent with both the symbolic OBP structure and the learned morphemes.

No particular low-level mechanism (LoRA, routing, prompts, etc.) is required by the semantics; all that is required is that the world model implement a conditional distribution aligned with the OBP-defined action cones.

---

## 7. Training Neural Action Cones

Training data is obtained naturally from OBP execution:

- Every binding produces a trajectory segment
- The system records $(x, C, O, p, \tau)$
- The world model learns to predict and reproduce these transitions
- The Port's adapter learns residual specialization from these examples

This ensures:

- Neural grounding matches actual causal behavior
- No symbolic semantics are violated
- Continuous approximation improves as experience accumulates

---

## 8. Using Neural Ports at Planning Time

The Program Synthesis Engine $\mathcal{P}$ operates symbolically over macro-actions. To evaluate or execute a step involving Port $p$:

1. Planner chooses $p$ based on symbolic feasibility
2. Execution calls $G_\phi$ with conditioning $(e_O, e_p)$
3. Adapter biases $G_\phi$ toward trajectories historically associated with $p$
4. If failure occurs, OBP semantics provide fallback:

   - alternative ports,
   - lower-level search inside the action cone,
   - re-planning via $\mathcal{P}$

Thus neural realization augments but does not replace symbolic guarantees.

---

## 9. Subjective OBP and Expected Trajectories

In Subjective OBP, the agent maintains predictions of behavior. Neural Ports enhance this:

- Predictions become distributions over trajectories
- Expectation violations become divergence tests
- Belief updates can be implemented as updates to adapter weights or embeddings

This provides:

- graded expectation violation signals,
- richer belief models,
- tighter integration of learning and planning.

---

## 10. Why This Architecture Scales

### **10.1 Parameter Efficiency**

Lightweight conditioning mechanisms (e.g.\ low-rank adapters such as LoRA) are tiny compared to full models.

### **10.2 Natural Data Flow**

OBP traces provide perfect supervision for action-cone learning.

### **10.3 Safe Hybrid Reasoning**

Symbolic layer provides safety and structure; neural layer provides generalization.

### **10.4 Compositionality**

Adapters compose just like operadic ports.

---

## 11. Summary

This neural realization preserves the formal semantics of OBP while enabling:

- continuous trajectory modeling,
- efficient specialization via adapters,
- symbolic-neural interoperation,
- introspection and fallback,
- scalable hybrid reasoning.

Ports remain **symbolic commitments** with **neural realizations** of their action cones. This provides a powerful and extensible computational foundation for agentic cognition.

---

## 12. Future Work

Potential extensions include:

- Port-embedding meta-learning
- Adapter composition via operadic substitution
- Differentiable planning over macro-actions
- Joint world-model and OBP-structure learning
- Exploration strategies guided by cone uncertainty
