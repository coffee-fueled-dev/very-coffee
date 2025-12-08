# Affordance Lattices

Affordance cones form a complete lattice under set inclusion. This algebraic structure enables logical operations on predictions and guarantees fixed points for refinement.

## Cones as Sets

For any state $x \in \mathcal{X}$, the space of trajectories from $x$ is:

$$
\mathcal{T}(x) \subseteq \bigcup_{k \ge 0} \{(x_0, \dots, x_k) \mid x_i \in \mathcal{X}, x_0 = x\}
$$

An affordance cone is a subset:

$$
\Phi_p(x, \vec{c}) \subseteq \mathcal{T}(x)
$$

The cone contains exactly those trajectories the agent expects—and is willing to be held accountable for—when binding port $p$.

## The Lattice

The space of all possible cones at state $x$ is the powerset:

$$
\mathcal{H}_x := \mathcal{P}(\mathcal{T}(x))
$$

This forms a complete lattice under subset inclusion $\subseteq$:

- **Meet** $\wedge$ (intersection): $A \wedge B = A \cap B$
- **Join** $\vee$ (union): $A \vee B = A \cup B$
- **Bottom** $\bot$: The empty set $\emptyset$
- **Top** $\top$: The full trajectory space $\mathcal{T}(x)$

The lattice is also a Boolean algebra with complement $A^c = \mathcal{T}(x) \setminus A$.

## Order Interpretation

The lattice order captures prediction strength:

| Cone | Prediction | Agency |
|------|------------|--------|
| Smaller (fewer trajectories) | Stronger, more specific | Higher |
| Larger (more trajectories) | Weaker, less specific | Lower |
| $\top$ (all trajectories) | Trivial (accepts anything) | Zero |
| $\bot$ (empty) | Impossible (accepts nothing) | Undefined |

Narrowing a cone moves down in the lattice (stronger prediction). Widening moves up (weaker prediction).

## Global Structure

The full affordance structure over all states is the product lattice:

$$
\mathcal{H} := \prod_{x \in \mathcal{X}} \mathcal{P}(\mathcal{T}(x))
$$

Operations are defined pointwise. An element of $\mathcal{H}$ assigns a cone to each state—this is what the affordance predicate $\chi_p$ induces.

## Why Lattices Matter

The lattice structure provides:

1. **Logical operations**: Meet and join let us combine predictions
2. **Fixed points**: Knaster-Tarski guarantees grounded cones exist
3. **Monotonicity**: Refinement operators preserve order
4. **Composition**: Multi-agent meet computes compatible predictions

Without lattice structure, there's no guarantee that refinement converges or that agents can compose.

