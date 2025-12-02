## Representational Capacity

The state space $\mathcal{X}$ contains exactly those states that could arise from some inference:

$$
\mathcal{X} = \bigcup_{p \in \mathcal{P}, x \in \mathcal{X}, \vec{c} \in \mathcal{C}^*} \{ \tau[i] \mid \tau = \mathsf{Infer}_p(x, \vec{c}), \, 0 \le i < |\tau| \}
$$

The trajectory space $\mathcal{T}(\mathcal{X})$ is the cumulative affordance across all ports, states, and contexts:

$$
\mathcal{T}(\mathcal{X}) = \bigcup_{p \in \mathcal{P}, x \in \mathcal{X}, \vec{c} \in \mathcal{C}^*} \Phi_p(x, \vec{c})
$$

What is representable is bounded by what the ports can collectively infer and afford.

---

Agents are compatible to the degree that adaptation converges faster than divergence

More generally, agents are compatible with their environment to the degree that adaptation converges faster than divergence (implying the environment the agent interacts with is never static)

we can drop one of these agents into an environment, and it will explicitly adapt its ports over time such that their affordance comes encapsulate the dynamics of the environment. Gradually, the function of a port (be that a literal function, vector field, neural field, enumeration) will grow to encapsulate the outcomes it has witnessed.

Choosing a port is exercising agency. The affordance cone represents the change the actor aims to impart on the world. A port whose cone contains all trajectories commits to no particular outcome and exercises no agency.

The actor may be a human in a negotiation, an AI agent completing a task, an algorithmic planner, or any other decision-making process.

---

## Agency

Agency is inversely proportional to cone width:

$$
\text{agency}(p, x, \vec{c}) \propto \frac{1}{|\Phi_p(x, \vec{c})|}
$$

A port whose cone contains all trajectories exercises no agency:

$$
\Phi_p(x, \vec{c}) = \mathcal{T}(x) \implies \text{agency} = 0
$$

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

### Actor Tuple

An actor is a tuple:

$$
A = (\mathcal{X}, \mathcal{P}, \mathcal{C}, \Sigma)
$$

where:

- $\mathcal{X}$ is the internal state space
- $\mathcal{P}$ is the set of ports
- $\mathcal{C}$ is the context domain
- $\Sigma$ is the trace alphabet — messages the actor may emit to the World

### Global World Bus

The World maintains a single, time-ordered trace sequence:

$$
\boldsymbol{\sigma} = (\sigma_0, \sigma_1, \dots)
$$

where each $\sigma_k \in \Sigma$ is a trace symbol containing:

- a topic (e.g., process instance identifier)
- a payload
- metadata (e.g., suggested next actor, role, priority)

**All actors see the same bus.** The context domain $\mathcal{C}$ of every actor is built from (some function of) the same prefix of $\boldsymbol{\sigma}$:

$$
C^{(i)}_n = g_i(\sigma_0, \dots, \sigma_t)
$$

Actors cannot avoid seeing what others do — at best they compress or de-emphasize it.

### Episode Boundaries Under Shared Bus

Episodes are actor-local slices of the same global log.

Let $b^{(i)}_k$ be the global indices at which actor $A_i$ binds its ports. Then the $k$-th episode for $A_i$ is:

$$
E^{(i)}_{k \to k+1} = (C^{(i)}_{k,0}, \dots, C^{(i)}_{k,m}, C^{(i)}_{k+1})
$$

derived from the global traces $(\sigma_{b^{(i)}_k+1}, \dots, \sigma_{b^{(i)}_{k+1}})$ — all traces emitted by any actor between $A_i$'s own bindings.

Each actor's episode includes **everyone's behavior** in that interval, not just their own thread.

### Turn Markers

Delegation uses special traces called turn markers:

$$
\tau = \text{Turn}\{\text{topic}, \text{assignee}, \text{role}, \text{constraints}\}
$$

- `topic` identifies the process instance
- `assignee` is an actor identity or abstract role
- `role` may specify a functional type
- `constraints` captures expectations for the next binding

Semantics:

- Everyone **sees** the turn marker
- Only actors whose identity/role matches treat it as "I am obliged/allowed to bind next on this topic"
- Others treat it as context — updating their cones but not binding ports for that topic

An actor $A_i$ treats a turn marker $\tau$ as an enabling condition:

$$
\text{EnabledPorts}^{(i)}(\tau) \subseteq \mathcal{P}_i
$$

For non-assigned actors, this set is typically empty for that topic, but the trace is still visible and may influence other cones.

### Compositional Contextuality

Affordance predicates are defined over context derived from the full global trace:

$$
\chi_p : \mathcal{T}(\mathcal{X}_i) \times \mathcal{X}_i \times \mathcal{C} \to \{\top, \bot\}
$$

where $\mathcal{C}$ summarizes the global trace prefix. An actor cannot ignore other actors' traces: its cones are defined relative to the composite system evolution, not merely its own local actions.

### Compatibility

**Static compatibility**: Actors are compatible when their port bindings don't produce episodes that violate each other's affordance cones — mutual expectations met.

**Dynamic compatibility**: Adaptation converges faster than divergence.

**Port compatibility**: Two ports $p_1$ and $p_2$ are compatible when the cones they induce over shared traces have non-empty intersection:

$$
\Phi_{p_1}(x_1, \vec{c}) \cap \Phi_{p_2}(x_2, \vec{c}) \neq \emptyset
$$

If the intersection is empty, no outcome satisfies both actors' expectations — binding either port guarantees one actor experiences failure.

### Routing as Normative Expectation

Routing in TAM-Compose is not about limiting information flow, but about constraining which actors are permitted or expected to perform the next binding on a given process thread, as encoded by turn markers on the shared World bus.

### Categorical Structure

- Objects = Actors (or Situations)
- Morphisms = Binding transitions
- Monoidal structure for parallel composition
- Potential for string diagrams / wiring diagrams to represent actor networks

### Next Steps to Formalize TAM-Compose

**Underspecified (needs tightening):**

- [ ] Constraints on trace alphabet Σ and its relationship to C
- [ ] Composition operator: given $A_1, A_2$, what exactly is $A_1 \otimes A_2$?
- [ ] Properties of context derivation $g_i$ — monotonic? computable?
- [ ] How EnabledPorts interacts with $\chi_p$ — override? conjunction?

**Not yet addressed:**

- [ ] Execution model — interleaving, true concurrency, or round-robin?
- [ ] Trace emission — when does binding produce a trace? what trace?
- [ ] Global ordering — is $\boldsymbol{\sigma}$ totally ordered? simultaneous bindings?
- [ ] Initial conditions — starting states, initial trace sequence
- [ ] Projection theorem — composed behavior restricts to individual TAM behavior
- [ ] Equivalence — when are two composed systems behaviorally the same? (bisimulation)
- [ ] Liveness / progress — can we guarantee no deadlock?

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
