# TA Refinement

_Heads up, a lot of this was AI generated from the core math. I still need to validate some of it, and make sure it lines up with how I think it should work._

An architecture for training behavioral agents via affordance refinement over a geometric-logical substrate.

## Motivation

Standard reinforcement learning conflates three concerns into a single value or policy function:

- What action to take
- What outcome to expect
- How to update beliefs

TA Refinement separates these:

- **Port selection**: Choose which port to bind
- **Affordance prediction**: Classify whether a trajectory is acceptable (learned predicate)
- **Refinement policy**: Decide how to update expectations on failure (learned meta-behavior)

## Invariants

The inference map $\mathsf{Infer}_p$ is fixed for each port. It is analogous to a sense—the agent may have bias in how it interprets episodes, but this interpretation is not subject to learning. The world's dynamics are external; the agent perceives them through $\mathsf{Infer}$, accurately or not.

Learning applies only to:

1. **Affordance cones** — what trajectories the agent expects
2. **Refinement policy** — how the agent updates expectations

The agent does not learn to perceive differently. It learns to expect differently.

## Affordance Predicates

Affordance cones are defined intensionally by predicates, not enumerated as discrete sets. The predicate $\chi_p$ classifies trajectories as acceptable or not—its acceptance region is the cone $\Phi_p$.

Port space and trajectory space can be continuous. The predicate is a function over these spaces, implementable as any classifier (neural network, learned formula, etc.). The set notation in the formalism specifies membership semantics, not representation.

## Training Signal

The training signal is **binding success or failure**: did the observed trajectory land in the cone?

On binding failure, the agent must choose a refinement action:

- **Widen**: Expand the cone to admit the observed trajectory
- **Narrow**: Contract the cone to exclude similar failures
- **Proliferate**: Spawn a new port with a specialized cone
- **Noop**: Leave the cone unchanged

This choice is itself learned. The refinement policy is a meta-learner that acquires the agent's inductive bias—when to generalize, when to specialize, when to split.

## Algebraic Structure

Affordance cones form a **complete lattice** under set inclusion:

- **Meet** (intersection): Trajectories acceptable to both cones
- **Join** (union): Trajectories acceptable to either cone
- **Order**: Smaller cones are stronger predictions

This structure enables:

- Monotone refinement operators
- Fixed-point grounding via Knaster-Tarski
- Compositional reasoning about agents

In continuous domains, ports can form a **manifold** with geometric structure enabling gradient-based optimization. See [Continuous Ports](./port-selection/continuous-ports) for this extension.

## Grounding

Refinement operators are monotone on the affordance lattice. By Knaster-Tarski, fixed points exist. An agent is grounded when its affordance predicates stabilize: binding outcomes no longer trigger refinement.

Grounding is convergence of expectations to world evidence—not reward maximization, but predictive consistency.

## Value Functions

Port selection can be guided by **value functions** that evaluate expected returns over affordance cones. Bellman operators are monotone on a lattice of value functions, giving value grounding alongside affordance grounding. See [Value Functions](./port-selection/value-functions).

## Composition

Grounded agents can compose via lattice meet: the composite admits only trajectories acceptable to all. Compatibility requires non-empty intersection of cones.

## Scope

This architecture specifies:

- Three learned components with distinct roles (port selection, affordance prediction, refinement policy)
- Algebraic structure (lattices) with optional geometric extension (manifolds)
- Grounding as fixed-point convergence
- Compositional structure for multi-agent interoperability

TA Refinement describes how an idealized agent could update its affordance structure in response to experience. In practice, convergence and correctness depend on:

- The agent's exploration policy
- Stationarity of the world
- Expressiveness of the affordance representation
- Presence or absence of adversarial feedback

Open problems:

- Concrete predicate representations and update rules
- Convergence analysis under function approximation
- Sample complexity of refinement learning
