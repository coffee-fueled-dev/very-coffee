# Bridging Ports to Affordances

Ports live in a geometric space. Affordances live in logical spaces. The semantics map $p \mapsto \Phi_p$ induces a fiber bundle whose fibers encode expectations. Refinement of affordances defines a Grothendieck fibration over ports.

## Base Space

The port manifold $\mathcal{M}$ is the base space. Each $p \in \mathcal{M}$ corresponds to a mode of interaction. The geometry supports similarity, continuity, and proliferation.

## Fiber

For each state/context pair $(x, \vec{c})$, the fiber is the affordance Heyting algebra:

$$
\mathcal{H}_{x,\vec{c}} := \mathcal{P}(\mathcal{T}(x))
$$

with meet (intersection), join (union), implication ($\Rightarrow$), bottom ($\emptyset$), and top ($\mathcal{T}(x)$).

The fiber over port $p$ contains $\Phi_p(x, \vec{c})$.

## Total Space

The total space of port-affordance pairs:

$$
\mathcal{E}_{x,\vec{c}} := \{ (p, A) \mid p \in \mathcal{M},\ A \in \mathcal{H}_{x,\vec{c}},\ A = \Phi_p(x, \vec{c}) \}
$$

The projection:

$$
\pi : \mathcal{E}_{x,\vec{c}} \to \mathcal{M}, \quad \pi(p, A) = p
$$

$\mathcal{E}_{x,\vec{c}}$ is the full space of meaningful port-affordance objects. $\pi$ forgets the affordance and returns the underlying port.

## Semantic Bundle

Over each port $p$, the fiber is the logically determined affordance:

$$
\pi^{-1}(p) = \{ (p, \Phi_p(x, \vec{c})) \}
$$

This is a trivial bundle identifying:

- Base: port geometry
- Fiber: expected behavior (logical affordance)

During learning, ports accumulate candidate affordances:

$$
\pi^{-1}(p) = \{ (p, A) \mid A \preceq \Phi_p(x, \vec{c}) \text{ in refinement ordering} \}
$$

The fiber contains all affordance variants reachable under refinement.

## Indexed Category of Affordances

Define an indexed category over $\mathcal{M}$:

- Objects over port $p$ are affordance cones $A \preceq \Phi_p$
- Morphisms are refinement steps $A \to A'$ such that $A' \preceq A$
- This gives a category $\mathbf{Aff}(p)$ for each port

The assignment $p \mapsto \mathbf{Aff}(p)$ is a contravariant functor from the port manifold to categories. Neighborhood morphisms in the manifold map backward to refinement inclusions.

## Grothendieck Fibration

The projection $\pi : \mathcal{E} \to \mathcal{M}$ is a Grothendieck fibration when for every morphism $f : p \to q$ in $\mathcal{M}$ and object $A \in \mathbf{Aff}(q)$, there exists a cartesian morphism lifting refinement:

$$
f^* A \in \mathbf{Aff}(p)
$$

satisfying the universal property.

A geometric move in port space lifts uniquely to the most specific affordance refinement compatible with that move. This connects port geometry and expectation logic.

## Refinement Dynamics

Refinement operators:

$$
F_p : \mathbf{Aff}(p) \to \mathbf{Aff}(p)
$$

To maintain the fibration structure, refinement must be indexed-functorial:

$$
F_q \circ f^* = f^* \circ F_p
$$

for morphisms $f : p \to q$.

This ensures:

- Moving in port space commutes with refining in affordance space
- Geometric and logical learning stay consistent
- Neighborhood-based updates are well-behaved

## Grounding as Fiberwise Fixed Points

With a Heyting algebra of affordances, monotone refinement operators $F_p$, and a Grothendieck fibration structure, grounding follows from fiberwise Knaster-Tarski:

- Each fiber contains a complete Heyting algebra
- Each $F_p$ is monotone
- Each fiber has a least fixed point:

$$
A_p^* = F_p(A_p^*)
$$

Smoothness of the fibration ensures $p \mapsto A_p^*$ is a section of the fibration: a consistent grounded affordance assignment across all ports.

Grounded expectations form a bundle section over port space. That section is the agent's stabilized model of the world.
