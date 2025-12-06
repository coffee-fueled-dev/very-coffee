# TA-Bellman Equations

Bellman equations reinterpreted in terms of Trajectory-Affordance. Value functions live on the affordance lattice; Bellman operators are monotone with fixed points by Knaster-Tarski.

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

Set of returns allowed by port $p$ in situation $(x, \vec{c})$:

$$
S_p(x, \vec{c}; V) = \{ G(\tau; V) \mid \tau \in \Phi_p(x, \vec{c}) \}
$$

The return set inherits structure from the affordance cone. Narrower cones yield smaller return sets.

## Aggregation

Let $\mathsf{Agg}$ be a set aggregator compatible with the affordance lattice:

- $\min$ (pessimistic, robust)
- $\max$ (optimistic)
- $\mathbb{E}$ (expected value under distribution)
- Interval $[\min, \max]$ (set-valued)

The choice of aggregator determines how uncertainty within the cone is resolved.

## Policy Bellman Operator

For policy $\pi : \mathcal{X} \to \mathcal{P}$:

$$
(\mathcal{B}^\pi V)(x) = \mathsf{Agg}\big(S_{\pi(x)}(x, \vec{c}; V)\big)
$$

Policy value function is the fixed point:

$$
V^\pi = \mathcal{B}^\pi V^\pi
$$

## Optimal Bellman Operator

$$
(\mathcal{B} V)(x) = \sup_{p \in \mathsf{Ports}(x)} \mathsf{Agg}\big(S_p(x, \vec{c}; V)\big)
$$

Optimal value function:

$$
V^* = \mathcal{B} V^*
$$

Optimal port selection:

$$
\pi^*(x) \in \arg\max_{p \in \mathsf{Ports}(x)} \mathsf{Agg}\big(S_p(x, \vec{c}; V^*)\big)
$$

## Monotonicity

The Bellman operators are monotone on the lattice of value functions ordered pointwise.

For $V \le W$ pointwise:

$$
\mathcal{B}^\pi V \le \mathcal{B}^\pi W
$$

$$
\mathcal{B} V \le \mathcal{B} W
$$

This follows from monotonicity of $G(\tau; V)$ in $V$ and monotonicity of $\mathsf{Agg}$.

## Value Grounding

By Knaster-Tarski, monotone Bellman operators on a complete lattice have fixed points.

The least fixed point:

$$
V^* = \mathrm{lfp}(\mathcal{B}) = \bigcap \{ V \mid \mathcal{B}(V) \le V \}
$$

corresponds to the most conservative value assignment consistent with the affordance structure.

Value iteration from below converges:

$$
V^{(0)} = \bot, \quad V^{(n+1)} = \mathcal{B}(V^{(n)})
$$

## Dual Fixed Points

TA has two grounding processes:

1. Affordance grounding via refinement operator $F_p$
2. Value grounding via Bellman operator $\mathcal{B}$

These are coupled. Refining affordance cones changes return sets $S_p$, which changes value fixed points. Conversely, value estimates inform which cones should narrow or widen.

A fully grounded TA agent has:

$$
F_p(\Phi_p^*) = \Phi_p^*, \quad \mathcal{B}(V^*) = V^*
$$

Stable affordances and stable values.
