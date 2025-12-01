Agents are compatible to the degree that adaptation converges faster than divergence

More generally, agents are compatible with their environment to the degree that adaptation converges faster than divergence (implying the environment the agent interacts with is never static)

we can drop one of these agents into an environment, and it will explicitly adapt its ports over time such that their affordance comes encapsulate the dynamics of the environment. Gradually, the function of a port (be that a literal function, vector field, neural field, enumeration) will grow to encapsulate the outcomes it has witnessed.

# **Core Components of TAPC**

**1. Ports $P$**

Named, canonical affordance schemas.
Given a state–context pair $(x_O, C_O)$, a Port produces a set of admissible trajectories representing how the world could evolve:

$$
P_O = \Phi_P(x_O, C_O)
$$

**2. Offers (O)**

Nodes in the causal graph.
Each Offer is evidence that a Port was chosen at some time.

Offers link into causal chains:

$$
O_0 \to O_1 \to \cdots
$$

**3. Internal State (x)**

A point in the causal graph $\mathcal{X}$.

**4. Context (C)**

Offer-local environmental feedback or sensory information.

**5. Agents (A)**

Entities capable of selecting a Port at an Offer — i.e., choosing a **mode of interaction**.

An Agent performs:

1. **Port selection (intent)**

$$
P \in \mathsf{Ports}(O)
$$

2. **Trajectory binding (prediction)**

$$
\mathrm{Bind}(O,P) \rightsquigarrow \tau \in P_O
$$

---

# **TAPC Core Execution Loop**

**At a given Offer $O = (x_O, C_O)$:**

**1. Instantiate admissible ports**

A port $P$ is admissible at $O$ exactly when its affordance cone is nonempty:

$$
\mathsf{Ports}(O)
= { P \mid \Phi_P(x_O, C_O) \neq \varnothing }
$$

Each admissible port $P$ yields its affordance cone:

$$
P_O := \Phi_P(x_O, C_O).
$$

**2. Binding selects a predicted trajectory, committing the agent to an intent to act**

The agent selects a port $P \in \mathsf{Ports}(O)$ as the **mode of interaction** it intends to enact.

Binding commits the agent to a predicted trajectory:

$$
\mathrm{Bind}(O, P) \rightsquigarrow \tau \in P_O
$$

This expresses the agent’s intent to act via port $P$, with $\tau$ representing its predicted evolution until the next Offer.

**3. The world responds with an observed trajectory**

The environment produces an observed trajectory segment $\hat{\tau}$, derived from feedback following the attempted action.

This trajectory is evaluated against the port’s affordance cone:

- **If** $\hat{\tau} \in P_O$: binding succeeds
- **Else**: a **trace violation** occurs (binding fails)

**4. A New Offer is Created, Extending the Causal Chain**

The realized trajectory segment yields a successor Offer $O'$:

$$
O \rightarrow O'
$$

The causal chain is extended, and the loop repeats from $O'$

---

## **Ports**

A **Port** is a _named, canonical affordance schema_:
a stable **mode of interaction** the agent may attempt.

When instantiated at an Offer, a Port’s affordance schema
(\Phi*P(x_O, C_O)) interprets the Offer’s state–context pair to produce
a **cone of admissible trajectories** — the agent’s model of how the
world \_could* evolve when acting through this interaction idiom.

Selecting a Port expresses the agent’s **intent** to use that mode of interaction.
**Binding** then selects a specific trajectory (\tau \in P*O) as the agent’s
\_predicted enactment* of that interaction; subsequent world feedback is
checked only against the **admissible cone** (P_O), not the specific (\tau).

---

## **Definition of a Port**

Let:

- (\mathcal{X}) be the agent’s internal state space (a causal graph),
- (C) be the set of Offer-local contexts,
- (\mathcal{T}(\mathcal{X})) be the space of internal trajectories.

A **Port** is a pair:

[
P = (\text{name}, \Phi_P)
]

where:

1. **name** is a symbol in a global signature

[
\text{name} \in \Sigma_P
]

(e.g. `move`, `sense`, `commit`, …)

2. **(\Phi_P)** is an **affordance schema**

[
\Phi_P : \mathcal{X} \times C \rightharpoonup
\mathcal{P}(\mathcal{T}(\mathcal{X}))
]

This schema maps each state–context pair ((x, C)) to a set of
**admissible trajectories** — the possible world evolutions that the agent
believes could occur when acting through Port (P) in that situation.

**A Port does _not_ select a specific trajectory by itself.**
Its role is to define the **possibility structure** of an interaction idiom.
The actual trajectory is chosen only during **binding**.

---

## **Instantiation at an Offer**

Given an Offer (O = (x_O, C_O)), the instantiated affordance cone is:

[
P_O := \Phi_P(x_O, C_O)
]

This yields the contextual semantic interpretation:

### **Semantic Interpretation Rule**

> The meaning of a port name (P) at Offer (O) is its instantiated
> affordance cone (P_O): the set of world evolutions the agent
> considers possible when acting through (P) at state–context pair
> ((x_O, C_O)).

A Port is **meaningful** at (O) exactly when:

[
P_O \neq \varnothing
]

Otherwise, the Port has no coherent interpretation in that context.

---

## **Modeling Convention (Interaction Idioms)**

Each canonical Port is intended to denote a **stable interaction idiom**:
a recognizable pattern or _type_ of engagement.
This is a modeling discipline, not a formal constraint.

---

## **Port Equivalence**

Two Ports are contextually equivalent at an Offer when they produce the
same affordance cone:

[
P \equiv_O Q
\quad\Longleftrightarrow\quad
\Phi_P(x_O, C_O) = \Phi_Q(x_O, C_O)
]

This has no operational force; it is a specification-level notion only.

---

## **Summary**

A canonical Port is a named, context-sensitive affordance schema:

[
P = (\text{name}, \Phi_P)
]

with:

[
\Phi_P : \mathcal{X} \times C \rightharpoonup
\mathcal{P}(\mathcal{T}(\mathcal{X}))
]

At Offer (O = (x_O, C_O)), its instantiated meaning is:

[
P_O = \Phi_P(x_O, C_O).
]

Port meaning is **contextual and polysemous**:
the same Port name may predict different affordance cones at different Offers.

Selecting a Port expresses **intent**;
binding selects a **specific predicted trajectory** (\tau \in P_O);
feedback evaluates whether (\hat{\tau}) lies within (P_O).
