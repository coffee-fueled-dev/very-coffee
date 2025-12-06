# Multi-Agent Composition

Grounded TA agents compose via lattice meet. This yields a category of agents with a monoidal structure.

## Grounded Agents

A grounded agent $A$ consists of:

- A port set $\mathcal{P}_A$
- Grounded affordance structures $\Phi_p^*$ for each $p \in \mathcal{P}_A$

Grounding means each $\Phi_p^*$ is a fixed point of the refinement operator:

$$
F_p(\Phi_p^*) = \Phi_p^*
$$

The agent's expectations are stable under world evidence.

## Shared World

Fix a common world $W$ with trajectory space $\mathcal{T}(\mathcal{X})$ and affordance lattice:

$$
\mathcal{H} = \prod_{x \in \mathcal{X}} \mathcal{P}(\mathcal{T}(x))
$$

All agents interact with the same world. Their affordance structures live in the same lattice.

## Composition via Meet

For grounded agents $A$ and $B$, define the composite agent $A \otimes B$ by:

$$
\Phi_{A \otimes B}^* = \Phi_A^* \wedge \Phi_B^*
$$

where $\wedge$ is the lattice meet (pointwise intersection of cones).

The composite admits only trajectories acceptable to both agents. This is parallel composition: both agents operate simultaneously, each constraining the shared world.

## Compatibility

Agents $A$ and $B$ are compositionally compatible when:

$$
\Phi_A^* \wedge \Phi_B^* \neq \bot
$$

There exist trajectories satisfying both agents' constraints. Incompatible agents have contradictory expectations; no world behavior satisfies both.

## The Category of Grounded Agents

Objects are grounded agents. Each object carries a port set and grounded affordance structures.

Morphisms $f : A \to B$ are structure-preserving maps between affordance lattices. A refinement morphism satisfies:

$$
f(\Phi_A^*) \preceq \Phi_B^*
$$

Agent $A$ refines to agent $B$ when $A$'s grounded affordances imply $B$'s.

## Monoidal Structure

The tensor product $\otimes$ is meet-based composition:

$$
A \otimes B := (A, B, \Phi_A^* \wedge \Phi_B^*)
$$

The unit object $I$ is the trivial agent with $\Phi_I^* = \top$ (all trajectories allowed).

This gives a symmetric monoidal category:

- $(A \otimes B) \otimes C \cong A \otimes (B \otimes C)$
- $A \otimes I \cong A$
- $A \otimes B \cong B \otimes A$

## Interpretation

Composition is constraint conjunction. Each agent narrows what the world may do. The composite is the most permissive system satisfying all constraints.

The lattice order captures refinement: smaller cones are stronger constraints. Meet is the least upper bound of constraints (most permissive satisfying both).

Grounding ensures agents are world-consistent before composition. Composing ungrounded agents may yield contradictions that resolve only after joint refinement.
