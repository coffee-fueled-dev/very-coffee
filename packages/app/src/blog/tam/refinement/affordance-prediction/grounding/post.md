# Grounding

Grounding is convergence to a fixed point: affordance predictions that no longer change under world evidence.

## Definition

An affordance structure $\Phi_p^*$ is grounded when:

$$
F_p(\Phi_p^*) = \Phi_p^*
$$

After updating with world evidence, the cone no longer changes. Expected trajectories match observed behavior.

## Fixed Point Theorem

Let $\mathcal{H}$ be a complete lattice of affordance structures and $F_p : \mathcal{H} \to \mathcal{H}$ a monotone refinement operator. Then:

1. The set of fixed points of $F_p$ is non-empty and forms a complete lattice.

2. There exists a least fixed point:

$$
\mathrm{lfp}(F_p) = \bigcap \{ X \in \mathcal{H} \mid F_p(X) \subseteq X \}
$$

3. There exists a greatest fixed point:

$$
\mathrm{gfp}(F_p) = \bigcup \{ X \in \mathcal{H} \mid X \subseteq F_p(X) \}
$$

This is Knaster-Tarski applied to the affordance lattice.

## Least vs Greatest Fixed Point

- **Least fixed point**: The most conservative (smallest) cone that is self-consistent. Admits only trajectories that evidence forces.

- **Greatest fixed point**: The most permissive (largest) cone that is self-consistent. Admits all trajectories that evidence doesn't exclude.

The choice depends on the refinement policy's bias toward caution vs. optimism.

## Iteration

Iterating $F_p$ from top (everything allowed) yields a descending sequence:

$$
\Phi^{(0)} = \top, \quad \Phi^{(1)} = F_p(\Phi^{(0)}), \quad \Phi^{(2)} = F_p(\Phi^{(1)}), \dots
$$

Under reasonable continuity conditions (e.g., ω-continuity of $F_p$), this converges to $\mathrm{lfp}(F_p)$.

In general, monotonicity alone guarantees the existence of fixed points but not practical convergence of iteration.

## Interpretation

The fixed point is where further episodes induce no structural change. The agent's expectations have stabilized against world evidence.

This is not necessarily *truth* about the world—it is *consistency* with observed evidence. An agent can be grounded on a biased sample of the world.

## Grounding vs Learning

Grounding is a semantic property: the affordance structure is a fixed point.

Learning is the process of approaching that fixed point through refinement operations.

An agent may:
- Never reach grounding (non-stationary world, insufficient exploration)
- Reach a wrong grounding (biased evidence, adversarial feedback)
- Reach grounding slowly or quickly (depends on refinement policy)

The architecture guarantees fixed points exist. It does not guarantee any particular agent finds them.

