# Overview

Agentic System 2 (AS2) is an architecture for building agents that can reason about cause and effect. Most agent systems today treat actions as isolated events. They execute commands, observe results, and learn patterns, but don't maintain a coherent model of how their actions causally relate to the world around them.

The belief I aim to embody in AS2 is that internally consistent agents need three things working together:

1. **A causal interface** that represents actions, resources, and their effects in a structured way
2. **A learning system** that extracts reusable patterns from experience without needing to understand what those patterns "mean"
3. **A planning engine** that can synthesize sequences of actions to achieve goals, using both primitive actions and learned patterns

These three components must work together in a closed loop: the agent acts in the world, learns from what happened, plans new actions based on what it learned, and revises its understanding when reality doesn't match expectations.

The posts dive into each component in detail, starting with the formal definitions and working up to how they integrate into a complete cognitive cycle.

## A Note on Category Theory

AS2 uses category theory as its formal backbone but it's alright if you're unfamiliar with the notation. The architectural intuitions (composition, typed interfaces, parallel execution) are more important than the formalism. The category-theoretic framing is chosen because it makes these intuitions precise and composable:

**Compositionality as a first-class concept.** Agentic behavior is fundamentally compositional—actions sequence into plans, plans compose into strategies, and subsystems interface through well-defined boundaries. Category theory makes composition explicit: morphisms compose associatively, and the laws are baked into the structure rather than enforced externally.

**Typed interfaces without implementation details.** Categories describe _what_ can connect to _what_ without prescribing _how_. Objects serve as abstract interface types; morphisms are transformations between them. This lets us specify that the learner's output must be compatible with the planner's input without coupling their implementations.

**Functors as principled system interfaces.** The three subsystems don't share internal state but rather communicate through functors:

- A **trace functor** $\mathrm{Tr} : \mathcal{W} \to \mathbf{List}(\Sigma)$ extracts linear action streams from OBP's causal structure.
- A **promotion functor** $J : \mathcal{C}_L \to \mathcal{P}$ lifts learned morphemes into plannable operations.
- An **execution functor** $\mathrm{Exec} : \mathcal{P} \to \mathcal{W}$ grounds plans back into causal reality.

Functors map identities to identities and respect composition. This guarantees that information crossing subsystem boundaries remains coherent.

**Monoidal structure for concurrency.** The tensor product $\otimes$ in symmetric monoidal categories captures parallel independence: $f \otimes g$ means "$f$ and $g$ execute concurrently without interference." This is precisely the semantics needed for modeling concurrent causal processes in OBP and parallel plan fragments in $\mathcal{P}$.

**Enrichment for quantitative reasoning.** Categories can be _enriched_ over structures beyond sets, which allows morphisms to carry not just type information but also quantitative metadata (expected cost, failure probability) that the planner uses for optimization.
