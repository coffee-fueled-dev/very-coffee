Agents are compatible to the degree that adaptation converges faster than divergence

More generally, agents are compatible with their environment to the degree that adaptation converges faster than divergence (implying the environment the agent interacts with is never static)

we can drop one of these agents into an environment, and it will explicitly adapt its ports over time such that their affordance comes encapsulate the dynamics of the environment. Gradually, the function of a port (be that a literal function, vector field, neural field, enumeration) will grow to encapsulate the outcomes it has witnessed.

Choosing a port is exercising agency. The affordance cone represents the change the actor aims to impart on the world. A port whose cone contains all trajectories commits to no particular outcome and exercises no agency.

The actor may be a human in a negotiation, an AI agent completing a task, an algorithmic planner, or any other decision-making process.

---

## Learning and Port Refinement (TAM-Learn)

Must be defined before composition — compatibility depends on adaptation dynamics.

**Learning signal**: Binding failure — the port's interpretation produced an unacceptable trajectory.

**What adapts**:

- $\mathsf{Infer}_p$ — how the port interprets episodes as trajectories
- $\chi_p$ — what trajectories the port accepts (affordance cone shape)

**Open questions**:

- How does the cone expand/contract based on experience?
- Does learning happen on inference, affordance, or both?
- What's the update rule? Gradient-based? Bayesian? Constraint satisfaction?
- How is generalization handled (unseen states/contexts)?

**Key property**: Ports "grow to encapsulate the outcomes witnessed" — cones become calibrated to actual dynamics over time.

**Core insight**: $\mathsf{Infer}_p$ is invariant — it's the agent's perceptual apparatus, not subject to learning. Like color blindness: the agent sees the world a certain way and adapts to that. Learning is only about cone adjustment.

**Failure dynamics**:

- Binding failure = unexpected outcome = evidence the cone was too narrow
- Response options: (1) widen the cone, or (2) abandon the port
- Never narrow on failure — that would ignore evidence

**Strategic tension**:

- Agency ∝ 1/(cone width)
- Wide cone = accommodates many outcomes = weak inference about what will happen = low agency
- Narrow cone = specific expectation = strong inference = high agency (but higher failure risk)

**Port proliferation**:

- When a cone becomes too wide, the agent loses agency for that mode
- Rather than over-generalize, spawn a new specialized port
- Result: skill hierarchy / specialization tree
- "Move" doesn't become "anything can happen" — it splits into "move-in-context-A", "move-in-context-B"

**When do cones narrow?**

- Option 1: Never — cones only widen or get abandoned
- Option 2: Agent can choose to narrow (specialize) to regain agency, accepting higher failure risk
- Option 3: New ports start narrow, inheriting from wider parent ports

**Connection to exploration/exploitation**: Narrow cone = exploit (specific intent). Wide cone = explore (see what happens). Agent balances by managing portfolio of ports with different widths.

**Emergent properties from minimal machinery**:

The core engine: _failure widens cones → wide cones lose agency → lost agency motivates specialization_

- **Expertise** = many narrow ports covering a domain (high agency, low failure rate)
- **Novice** = few wide ports (low agency, high tolerance, frequent success but weak inference)
- **Transfer learning** = start wide in new contexts, narrow with experience
- **Adaptation to change** = environment shift → unexpected failures → cones widen → agency drops → pressure to specialize anew
- **Skill decay** = if you stop using a port, no failures, no updates — but environment may have drifted; re-engagement may trigger failures
- **Overconfidence** = cone too narrow for actual dynamics → frequent failure → forced to widen or abandon
- **Generalist vs specialist** = portfolio choice — few wide ports (generalist, robust, low agency) vs many narrow ports (specialist, fragile, high agency)

---

## Composition and Concurrency (TAM-Compose)

TAM as base model describes a single actor. Composition and concurrency are separate concerns.

**Actor as tuple**: $A = (\mathcal{X}, \mathcal{P}, \mathcal{C})$ — state space, ports, context domain.

**Parallel composition** $A_1 \otimes A_2$:

- Port sets: $\mathcal{P}_1 \sqcup \mathcal{P}_2$ (disjoint union)
- State spaces: $\mathcal{X}_1 \times \mathcal{X}_2$ (product)
- Each actor maintains its own offer chain

**Interaction through world**: The world mediates between actors. One actor's bindings produce episodes that become context for others.

**Compatibility**: Actors are compatible when their port bindings don't produce episodes that violate each other's affordance cones. Static compatibility = mutual expectations met. Dynamic compatibility = adaptation converges faster than divergence.

**Questions for TAM-Compose**:

- Routing: How does the world decide which actor sees which episode?
- Addressing: Can ports target specific actors, or is everything broadcast?
- Synchronization: Do actors bind in turns, simultaneously, or asynchronously?
- Port compatibility: Can two ports "connect" when their domains align?

**Categorical structure**:

- Objects = Actors (or Offers)
- Morphisms = Binding transitions
- Monoidal structure for parallel composition
- Potential for string diagrams / wiring diagrams to represent actor networks

---

## Trace Mechanism in Multi-Agent Hierarchies

In a hierarchy of specialists and orchestrators, agents both produce and consume context:

**World as shared broadcast**: Each agent broadcasts its traces to the World context. All agents in the system subscribe to this World context.

**Mixed context**: From any agent's perspective, World context is a mixture of:

- External context (entering the composite system from outside)
- Internal context (traces from other agents within the system)

**Episode boundaries**: An agent's episode is the sequence of context on the World broadcast between its own successive port bindings. Different agents have different episode boundaries depending on their binding timing.

**Adaptation responsibility**: Each agent in the hierarchy must adapt its affordance cones to the dynamics of this composite environment — which includes the behavior of other agents, not just external dynamics.

**Implication**: An agent doesn't distinguish between "the world" and "other agents" — it just sees context. Compatibility emerges when agents' affordance cones accommodate each other's traces.

---

## System 1/2 Architecture with LLMs

TAM as System 2 for LLM-based agents:

|             | System 1 (LLM)        | System 2 (TAM)         |
| ----------- | --------------------- | ---------------------- |
| Speed       | Fast                  | Deliberate             |
| Mode        | Intuitive, generative | Structured, evaluative |
| Disposition | Optimistic            | Risk-minimizing        |
| Role        | Propose               | Validate/select        |

**Ports as plaintext descriptions:**

```
port: move-forward
description: I move one step in the facing direction
expected outcomes: [moved-one-step, blocked-by-obstacle]
contexts: indoor navigation, outdoor navigation
last failure: blocked by door I didn't see
```

**Why this works:**

- Search is native — vector/fulltext similarity finds relevant ports for the situation
- Interpretable — just read the port to understand what the agent expects
- LLM-friendly — cone widening is text editing ("add 'blocked-by-door' to expected outcomes")
- No special infrastructure — LLM + database
- System 1 proposes, System 2 disposes — LLM generates intent, TAM checks feasibility

**The cone in text:**

"Expected outcomes" IS the cone. Widening = adding to the list:

- Before: `expected outcomes: [moved-one-step]`
- Failure: blocked by obstacle
- After: `expected outcomes: [moved-one-step, blocked-by-obstacle]`

**Port selection via search:**

1. Context → embed
2. Find ports with similar contexts
3. Rank by cone width (narrower = prefer, if context matches)
4. Select narrowest-but-safe port

**Enables:**

- Human-in-the-loop editing of ports
- Audit trail (port history)
- Transfer between agents (share port descriptions)
- Debugging via readable port state

---

## The Null Port

A port that represents "do nothing" or "wait":

**Properties:**

- Always afforded (cone includes "state unchanged" trajectory)
- Binding it = passing, waiting for context to change
- World still responds (time passes, context accumulates)
- Agency = 0 (widest cone, no commitment to any outcome)

**Circumstances it alleviates:**

1. **Agent wants to pass** — choosing not to act is itself binding the null port
2. **No ports afforded** — null port is always available as fallback
3. **No deadlocks** — agent can never be stuck with no options
4. **Observation without action** — agent can wait for more context before committing

**Semantics:**

- Passing = binding the null port
- Waiting is not agency — the null port exercises no agency (wide cone)
- Using the null port means "I give up on acting meaningfully right now"

**Implementation note:**

The null port is a convention, not a requirement. Implementations that want liveness guarantees include it. Implementations that want to detect unsolvable states may intentionally omit it (allowing deadlock as a signal).

---

## Goals as Context

A goal is a form of context. Context $\mathcal{C}$ is external information from the world — a goal fits naturally in that set.

**Why this works:**

- Port affordances depend on context via $\Phi_p(x_n, \vec{c})$
- Including a goal in $\vec{c}$ naturally biases the affordance cone
- Different goals → different cones → different afforded ports
- No special "goal" machinery needed

**Example:**

- Port: "move-forward"
- Without goal: cone includes many outcomes (moved anywhere)
- With goal "reach X": cone narrows to outcomes that progress toward X
- Same port, different affordance based on goal context

**What this unifies:**

- Goal-directed behavior and reactive behavior are the same mechanism
- Multi-goal scenarios = multiple goal values in context
- Goal priority = attention mechanism selecting which context to attend
- Goal completion = goal context changes when achieved
- Subgoals = decomposed goals appearing in context

**Implication:**

Goals don't need special representation. They're just context that shapes affordance. The agent doesn't "pursue goals" — it binds ports whose cones are attuned to the goal context.

This keeps the model minimal while accommodating goal-directed behavior naturally.
