# Value Functions

Value-based port selection assigns a value to each port based on expected returns over its affordance cone. The optimal port maximizes this value.

## Setup

Let:

- Internal state $x \in \mathcal{X}$
- Ports $p \in \mathcal{P}$
- Affordance cone $\Phi_p(x, \vec{c}) \subseteq \mathcal{T}(x)$
- Discount factor $\gamma \in [0, 1)$

## Returns

One-step return of trajectory $\tau$:

$$
G(\tau; V) = r(\tau) + \gamma \, V(\tau[\mathrm{end}])
$$

The return set for port $p$ in situation $(x, \vec{c})$:

$$
S_p(x, \vec{c}; V) = \{ G(\tau; V) \mid \tau \in \Phi_p(x, \vec{c}) \}
$$

The return set inherits structure from the affordance cone. Narrower cones yield smaller, more predictable return sets.

## Aggregation

Let $\mathsf{Agg}$ aggregate a set of returns into a single value:

- $\min$ — pessimistic, robust
- $\max$ — optimistic
- $\mathbb{E}$ — expected value under distribution
- $[\min, \max]$ — interval-valued

The choice of aggregator determines how uncertainty within the cone is resolved.

## Port Value

The value of port $p$ in state $x$:

$$
V(p; x, \vec{c}) = \mathsf{Agg}\big(S_p(x, \vec{c}; V)\big)
$$

This aggregates expected returns over all trajectories the agent expects from binding $p$.

## Optimal Selection

Select the port with highest value:

$$
\pi^*(x) \in \arg\max_{p \in \mathsf{Ports}(x)} V(p; x, \vec{c})
$$

This is greedy selection given current value estimates.

## Bellman Operators

### Policy Evaluation

For fixed policy $\pi : \mathcal{X} \to \mathcal{P}$:

$$
(\mathcal{B}^\pi V)(x) = \mathsf{Agg}\big(S_{\pi(x)}(x, \vec{c}; V)\big)
$$

The policy value function is the fixed point: $V^\pi = \mathcal{B}^\pi V^\pi$

### Optimal Value

$$
(\mathcal{B} V)(x) = \sup_{p \in \mathsf{Ports}(x)} \mathsf{Agg}\big(S_p(x, \vec{c}; V)\big)
$$

The optimal value function: $V^* = \mathcal{B} V^*$

## Monotonicity and Fixed Points

Bellman operators are monotone on the lattice of value functions (ordered pointwise):

$$
V \le W \implies \mathcal{B}V \le \mathcal{B}W
$$

By Knaster-Tarski, fixed points exist. The least fixed point:

$$
V^* = \mathrm{lfp}(\mathcal{B}) = \bigcap \{ V \mid \mathcal{B}(V) \le V \}
$$

is the most conservative value assignment consistent with the affordance structure.

## Value Iteration

In idealized settings where $\mathcal{B}$ is ω-continuous or contractive:

$$
V^{(0)} = \bot, \quad V^{(n+1)} = \mathcal{B}(V^{(n)})
$$

converges to $V^*$. In general, monotonicity guarantees existence but not practical convergence.

## Coupling with Affordance Prediction

Value grounding and affordance grounding are coupled:

- Refining cones changes return sets $S_p$, which changes value fixed points
- Value estimates inform which cones to narrow or widen

A fully grounded agent has stable affordances and stable values:

$$
F_p(\Phi_p^*) = \Phi_p^*, \quad \mathcal{B}(V^*) = V^*
$$

## Continuous Spaces

In continuous port spaces, port selection becomes optimization over a manifold. Gradient-based methods require smooth value landscapes. See [Continuous Spaces](../../continuous-spaces) for the geometric extension.

