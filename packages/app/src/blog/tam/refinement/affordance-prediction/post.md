# Affordance Prediction

The second learned component: predicting which trajectories to expect from each port.

## The Problem

For each port $p$, the agent maintains an affordance cone $\Phi_p(x, \vec{c})$—the set of trajectories it expects when binding $p$ in state $x$ with context $\vec{c}$.

This is not a prediction of what _will_ happen, but what the agent is _willing to accept_. The cone represents accountable expectations: trajectories the agent stakes its predictive commitments on.

## Representation

Affordance cones are defined intensionally by predicates:

$$
\Phi_p(x, \vec{c}) = \{ \tau \in \mathcal{T}(x) \mid \chi_p(\tau, x, \vec{c}) = 1 \}
$$

The predicate $\chi_p$ is the learned object. It can be:

- A neural network classifier
- A logical formula
- Any function over trajectory space

The cone is the acceptance region of this classifier.

## Algebraic Structure

Cones form a **lattice** under set inclusion:

- Meet $\wedge$ (intersection): Trajectories acceptable to both
- Join $\vee$ (union): Trajectories acceptable to either
- Order $\subseteq$: Stronger predictions are smaller cones

This structure enables:

- Logical operations on expectations
- Composition of agent predictions
- Fixed-point characterization of grounding

## Refinement Operations

When binding outcomes violate expectations, the agent updates its cones:

- **Widen**: Expand cone to include unexpected trajectories
- **Narrow**: Contract cone to exclude bad trajectories
- **Proliferate**: Split into specialized cones

These operations are monotone on the lattice. Grounding is the fixed point where predictions stabilize.

## Grounding

A cone is grounded when refinement produces no change:

$$
F_p(\Phi_p^*) = \Phi_p^*
$$

The agent's expectations match observed behavior. By Knaster-Tarski, such fixed points exist for monotone refinement operators.

## What This Section Covers

- **Lattices**: The algebraic structure of affordance cones
- **Predicates**: How to represent cones as classifiers
- **Operations**: The mechanics of widen, narrow, proliferate
- **Grounding**: Fixed-point convergence of predictions

