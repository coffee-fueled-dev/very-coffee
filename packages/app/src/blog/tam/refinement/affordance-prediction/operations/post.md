# Refinement Operations

The mechanics of updating affordance cones: widen, narrow, and proliferate.

## Refinement Operators

For each port $p$, define a refinement operator:

$$
F_p : \mathcal{H} \to \mathcal{H}
$$

mapping a current cone assignment $\Phi_p$ to a new assignment $\Phi'_p$ after incorporating evidence from binding.

## Monotonicity

Refinement must be monotone: for any $\Phi \subseteq \Psi$ pointwise,

$$
F_p(\Phi) \subseteq F_p(\Psi)
$$

If one affordance structure admits more trajectories than another, updating both with the same evidence preserves that order.

This constraint ensures refinement is well-behaved on the lattice and guarantees fixed points exist.

## Widening

Expand the cone to include new trajectories:

$$
\Phi'_p(x) = \Phi_p(x) \cup E(x)
$$

where $E(x)$ is the set of newly observed trajectories to admit.

**When to widen**: The observed trajectory was acceptable but fell outside the current cone. The cone was too narrow—it excluded valid behavior.

**Effect**: Moves up in the lattice (weaker prediction, lower agency).

## Narrowing

Contract the cone to exclude trajectories:

$$
\Phi'_p(x) = \Phi_p(x) \cap S(x)
$$

where $S(x)$ excludes trajectories now judged incompatible.

**When to narrow**: The observed trajectory was unacceptable but fell inside the current cone. The cone was too broad—it included invalid behavior.

**Effect**: Moves down in the lattice (stronger prediction, higher agency).

## Proliferation

Create a new port $p'$ whose cone is derived from $\Phi_p$ on some region of $(x, \vec{c})$:

$$
\Phi_{p'}(x, \vec{c}) \subseteq \Phi_p(x, \vec{c})
$$

This splits $\Phi_p$ into multiple elements in the product lattice.

**When to proliferate**: The port conflates distinct behaviors that should be separated. Different contexts require different cones.

**Effect**: Increases the port set $\mathcal{P}$, specializes behavior.

## Noop

Leave the cone unchanged:

$$
\Phi'_p = \Phi_p
$$

**When to noop**: The binding outcome is consistent with current expectations, or the failure is deemed noise not worth updating on.

## Monotonicity of Operations

All operations preserve monotonicity:

- **Widening** with fixed $E(x)$: If $\Phi \subseteq \Psi$, then $\Phi \cup E \subseteq \Psi \cup E$
- **Narrowing** with fixed $S(x)$: If $\Phi \subseteq \Psi$, then $\Phi \cap S \subseteq \Psi \cap S$
- **Proliferation**: Derived cones preserve the subset relationship
- **Noop**: Identity is trivially monotone

This ensures composed refinement operators remain monotone, preserving the fixed-point guarantees.
