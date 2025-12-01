# **The Trajectory-Affordance Process Calculus (TAPC)**

## **Core Components of TAPC**

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

## **TAPC Core Execution Loop**

> **At a given Offer $O = (x_O, C_O)$:**
>
> ### **1. Instantiate admissible ports**
>
> A port $P$ is admissible at $O$ exactly when its affordance cone is nonempty:
>
> $$
> \mathsf{Ports}(O)
> = { P \mid \Phi_P(x_O, C_O) \neq \varnothing }
> $$
>
> Each admissible port $P$ yields its affordance cone:
>
> $$
> P_O := \Phi_P(x_O, C_O).
> $$
>
> ### **2. Binding selects a predicted trajectory, committing $A$ to an intent to act**
>
> $A$ selects a port $P \in \mathsf{Ports}(O)$ as the **mode of interaction** it intends to enact.
>
> Binding commits $A$ to a predicted trajectory:
>
> $$
> \mathrm{Bind}(O, P) \rightsquigarrow \tau \in P_O
> $$
>
> This expresses the $A$’s intent to act via port $P$, with $\tau$ representing its predicted evolution until the next Offer.
>
> ### **3. The world responds with an observed trajectory**
>
> The environment produces an observed trajectory segment $\hat{\tau}$, derived from feedback following the attempted action.
>
> This trajectory is evaluated against the port’s affordance cone:
>
> **If** $\hat{\tau} \in P_O$: binding succeeds
>
> **Else**: a **trace violation** occurs (binding fails)
>
> ### **4. A New Offer is Created, Extending the Causal Chain**
>
> The realized trajectory segment yields a successor Offer $O'$:
>
> $$
> O \rightarrow O'
> $$
>
> The causal chain is extended, and the loop repeats from $O'$
