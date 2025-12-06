# Refinement Calculus

TA-Learn operates on affordance cones as elements of a complete lattice. Refinement is monotone, and grounding emerges as a fixed point.

## Affordance Structures

For each port $p$, the induced cone is an element of the global affordance lattice:

$$
\Phi_p(\cdot, \cdot) \in \mathcal{H} = \prod_{x \in \mathcal{X}} \mathcal{P}(\mathcal{T}(x))
$$

TA-Learn updates these cones after each binding based on the observed trajectory $\hat{\tau}$.

## Refinement Operators

For each port $p$, define a refinement operator:

$$
F_p : \mathcal{H} \to \mathcal{H}
$$

mapping a current cone assignment $\Phi_p$ to a new assignment $\Phi'_p$ after incorporating evidence.

Refinement must be monotone: for any $\Phi \subseteq \Psi$ pointwise,

$$
F_p(\Phi) \subseteq F_p(\Psi)
$$

If one affordance structure admits more trajectories than another, updating both with the same evidence preserves that order.

## Refinement Operations

Widening at $x$:

$$
\Phi'_p(x) = \Phi_p(x) \cup E(x)
$$

where $E(x)$ is the set of newly observed trajectories to admit.

Narrowing at $x$:

$$
\Phi'_p(x) = \Phi_p(x) \cap S(x)
$$

where $S(x)$ excludes trajectories now judged incompatible.

Proliferation creates a new port $p'$ whose cone is derived from $\Phi_p$ on some region of $(x, \vec{c})$. This splits $\Phi_p$ into multiple elements in the product lattice.

All operations are monotone over $\mathcal{H}$.

## Grounding

An affordance structure $\Phi_p^*$ is grounded when:

$$
F_p(\Phi_p^*) = \Phi_p^*
$$

After updating with world evidence, the cone no longer changes. Expected trajectories match observed behavior.

## Grounding Fixed Point Theorem

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

## Interpretation

The least fixed point is the most conservative affordance structure that is self-consistent under refinement.

Iterating $F_p$ from top (everything allowed) yields a descending sequence:

$$
\Phi^{(0)} = \top, \quad \Phi^{(1)} = F_p(\Phi^{(0)}), \quad \Phi^{(2)} = F_p(\Phi^{(1)}), \dots
$$

Under reasonable continuity conditions, this converges to $\mathrm{lfp}(F_p)$.

The fixed point is where further episodes induce no structural change. This is grounding of expectations.
