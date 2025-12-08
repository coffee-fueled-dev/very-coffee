# Port-Affordance Fibration

Ports live in a geometric space. Affordances live in logical spaces. The map $p \mapsto \Phi_p$ bridges these: geometric structure on ports should correspond coherently to logical structure on affordances.

## The Bridge

The port manifold $\mathcal{M}$ is the base space. Each port $p \in \mathcal{M}$ determines an affordance cone $\Phi_p(x, \vec{c})$ in the affordance lattice.

The essential requirement: **geometric locality in port space should imply logical locality in affordance space**.

If ports $p$ and $q$ are nearby in $\mathcal{M}$, their affordance cones should be related—not identical, but not arbitrarily different.

## Fiber Structure

For each state/context pair $(x, \vec{c})$, the space of possible affordances is:

$$
\mathcal{H}_{x,\vec{c}} := \mathcal{P}(\mathcal{T}(x))
$$

This is the fiber over the point $(x, \vec{c})$. It contains all possible affordance cones.

The total space consists of port-affordance pairs:

$$
\mathcal{E} := \{ (p, A) \mid p \in \mathcal{M},\ A \in \mathcal{H}_{x,\vec{c}} \}
$$

The projection $\pi : \mathcal{E} \to \mathcal{M}$ forgets the affordance and returns the port.

## Coherence

The fibration property is a coherence condition: geometric moves in port space should lift to consistent moves in affordance space.

Informally: if you move from port $p$ to nearby port $q$, the affordance should change in a predictable way—not arbitrarily.

This can be formalized in various ways (fiber bundles, indexed categories, Grothendieck fibrations) depending on the required precision. The essential property is:

$$
p \approx q \implies \Phi_p \text{ and } \Phi_q \text{ are related by refinement}
$$

Nearby ports have affordances connected by logical operations (meet, join, refinement).

## Refinement Dynamics

Refinement operators act fiberwise:

$$
F_p : \mathcal{H}_{x,\vec{c}} \to \mathcal{H}_{x,\vec{c}}
$$

For the fibration to be well-behaved, refinement should commute with geometric moves:

- Refining at $p$ then moving to $q$ should equal
- Moving to $q$ then refining there

This ensures geometric exploration and logical learning stay synchronized.

## Grounding as Sections

When each fiber has a grounded fixed point $A_p^* = F_p(A_p^*)$, the assignment:

$$
p \mapsto A_p^*
$$

is a section of the fibration: a consistent choice of grounded affordance for each port.

The section is the agent's stabilized model—a coherent assignment of expectations across all modes of interaction.

## Why Fibration?

The fibration view clarifies:

1. **Separation of concerns**: Geometry (ports) and logic (affordances) are distinct but connected
2. **Coherence**: The connection is structured, not arbitrary
3. **Grounding**: Fixed points exist fiberwise and assemble into a global section

Without fibration structure, there's no guarantee that smooth port exploration corresponds to meaningful affordance learning.
