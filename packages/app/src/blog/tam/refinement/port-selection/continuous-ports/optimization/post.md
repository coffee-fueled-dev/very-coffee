# Continuous Bellman

Bellman optimization over port manifolds with smooth value landscapes.

The general TA-Bellman defines optimal port selection as:

$$
\pi^*(x) \in \arg\max_{p \in \mathsf{Ports}(x)} \mathsf{Agg}\big(S_p(x, \vec{c}; V)\big)
$$

In discrete port spaces, this is enumeration. In continuous port spaces, this is an optimization problem requiring additional structure.

## Port Manifold Structure

Let $\mathcal{M}$ be the port manifold. The optimal Bellman operator becomes:

$$
(\mathcal{B} V)(x) = \sup_{p \in \mathcal{M}_x} \mathsf{Agg}\big(S_p(x, \vec{c}; V)\big)
$$

where $\mathcal{M}_x \subseteq \mathcal{M}$ is the submanifold of ports afforded at state $x$.

## Value Landscape

Define the value landscape over port space:

$$
\mathcal{V}(p; x, V) = \mathsf{Agg}\big(S_p(x, \vec{c}; V)\big)
$$

This is a scalar field over the port manifold. Optimal port selection is finding maxima of this landscape.

## Smoothness

For the value landscape to be smooth, we require:

1. **Manifold structure**: Ports form a smooth manifold $\mathcal{M}$
2. **Smooth predicates**: The affordance predicate $\chi_p(\tau)$ varies smoothly with $p$
3. **Continuous aggregation**: $\mathsf{Agg}$ is continuous (e.g., expectation under smooth distributions)

Under these conditions:

$$
p \approx q \implies \mathcal{V}(p; x, V) \approx \mathcal{V}(q; x, V)
$$

The fibration structure ensures this smoothness is _coherent_—geometric moves correspond to consistent changes in affordances. Smoothness itself comes from the analytic properties of the predicate and aggregator.

## Gradient Ascent

With differentiable structure, optimal port selection becomes gradient ascent:

$$
p_{t+1} = p_t + \alpha \nabla_p \mathcal{V}(p_t; x, V)
$$

The gradient $\nabla_p \mathcal{V}$ lives in the tangent space $T_p \mathcal{M}$.

Requirements:
- Differentiable parameterization of ports
- Differentiable aggregator $\mathsf{Agg}$
- Smooth dependence of $S_p$ on $p$

## Value Iteration

Combined with value iteration:

$$
V^{(n+1)}(x) = \max_{p \in \mathcal{M}_x} \mathcal{V}(p; x, V^{(n)})
$$

Each iteration requires solving an optimization problem over the manifold. Gradient methods make this tractable when the landscape is smooth.

## Coupled Dynamics

In continuous spaces, refinement and value optimization interact smoothly:

1. **Affordance refinement** updates predicates, changing return sets $S_p$
2. **Value iteration** updates $V$, changing the landscape $\mathcal{V}$
3. **Port optimization** follows gradients to better ports

The fibration structure ensures these dynamics are coherent: geometric moves in port space correspond to consistent changes in both affordance predictions and value estimates.

## Comparison to General Bellman

| Aspect | General | Continuous |
|--------|---------|------------|
| Port selection | Abstract sup | Gradient ascent |
| Landscape | May be discontinuous | Smooth |
| Tractability | Requires enumeration | Gradient-based |
| Structure needed | Lattice only | Manifold + coherent fibration |

