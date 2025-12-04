# Implementing TAM with LLMs

LLM-based agents with access to conversation history already exhibit a form of experience-based adaptation. The model sees what happened earlier in the context and adjusts its behavior accordingly. If a tool call failed, it might try something different. If a certain approach worked, it might repeat it. This is real learning, and it happens automatically.

What this in-context adaptation lacks is structure. The model adapts implicitly based on patterns in the history, but it doesn't maintain explicit expectations it can evaluate against. There's no formal step where the agent commits to a prediction, observes the outcome, and decides whether to update its beliefs. Any adaptation is ephemeral because it disappears when the context window ends or the session resets.

TAM extends conversation history with explicit expectations, a structured evaluation step that compares outcomes against those expectations, persistence across sessions so that learning accumulates over time, and selective refinement where the agent deliberately widens, narrows, or proliferates based on evidence. The result is an agent that not only adapts but knows what it expected and whether reality matched.

## Note about State Space $\mathcal{X}$

In TAM, $\mathcal{X}$ is defined as the set of states the system is capable of representing. TAM does not assume that states reflect objective truth. A state is any situation the actor can articulate as its current position, regardless of whether that description is symbolic, propositional, or narrative. For a LLM, this corresponds directly to whatever situations it can express under its constraints. Any coherent output the model can generate qualifies as a state by TAM’s definition. If we assume no limits on generation depth or output length, this set is effectively unbounded.

Adding a system prompt (or any other contextual constraint) narrows this representational capacity. The prompt biases the distribution of generated text, restricting which descriptions of state are reachable in practice. The resulting $\mathcal{X}$ may still be extremely large, but it is a smaller space than the unconstrained model.

Real world LLMs have additional practical bounds such as maximum generations per turn and maximum output length, which is ultimately capped by the context window; further reducing the reachable state set. TAM itself does not depend on whether $\mathcal{X}$ is finite or infinite; only that it is a well-defined (not necessarily explicit) set from which ports select admissible subsets.

The same logic applies to $\mathsf{Infer}$ and trajectory representation. A trajectory is simply the actor's expressed account of how its action changed the situation, as inferred from the episode it observed. If the model can produce an interpretation of what just happened under its constraints, then that output is a valid trajectory in TAM. Therefore, any generation conditioned on prior situation and context can serve as an instance of $\mathsf{Infer}\_p$.

> If multiple models and prompts are combined, $\mathcal{X}$ expands accordingly. Conceptually, the state space becomes the product of the reachable representations under each component.

## The Minimal Implementation

TAM maps onto LLM-based agents with almost no additional infrastructure. As we said, the state space $\mathcal{X}$ is already provided by the LLM's latent space and naturally constrained by the system prompt.

Ports map to tool calls. If you're using MCP-style function calling, you already have a version of ports. Each tool is a mode of interaction with the world: a function the agent can invoke, with arguments and a description. When the agent selects a tool, it delegates execution elsewhere and waits for the world to respond. Ports additionally require a description of how the world is expected to evolve as a result of using the tool. This can start out broad. For example, the expectation of a send email tool can be:

> "After using this tool, the recipient will have received the contents of the email without errors."

## Port Selection

When the agent faces a situation, it needs to choose one port according to these constraints:

1. The port must be available for use in the current situation.
2. The port must align with the agent's intent.
3. The agent must believe the outcome should fall within the port's expectations.
4. Among safe options, the agent should choose the port with the narrowest expectations. A narrow cone represents a specific commitment to particular outcomes. A wide cone accepts anything and commits to nothing.

An agent with well-calibrated expectations can make specific commitments confidently. A novice agent must use wider cones to accomodate its uncertainty about the dynamics of the world. Expertise is the accumulation of narrow, reliable ports.

## Episode Interpretation

After the agent binds a port, the world must provide feedback. Feedback could be tool execution logs, API responses, user messages, error traces, or any other signal from outside. The agent must interpret the feedback into an internal hypothesis about what happened in the world as a result of its action, and what situation it is currently in.

## Breadcrumbs and Learning

After interpreting the feedback, the agent compares what happened against what it expected. Binding succeeds when it believes the world behaved within the port's expectations and fails otherwise.

Either way, the agent leaves breadcrumbs on the port by adding notes about this binding, removing irrelevant notes, or some combination of the two. By doing so, the agent changes what it can expect by using that port in the future. If the binding failed, the agent may add the erroneous outcome as a new expectation. If the binding was successful, the agent may remove notes of make special notes about why this port was the right choice in the previous situation.

## Port Proliferation

Sometimes a port's expectations become too broad. Perhaps the agent has seen many different outcomes in many different contexts, and the cone has widened to accommodate all of them. The agent can choose to proliferate by creating a new port that wraps the same underlying action with specialized expectations for a particular context.

For example, the original "send-email" port may work in many situations but predict outcomes poorly. The agent can create "send-email-to-executive" with expectations tuned to that context: faster response times, more formal acknowledgments, higher stakes for errors. The underlying tool call is identical but the expectations differ.

## The Loop

Putting it together, the agent cycle is:

The agent finds itself in a situation. It examines the available tools with their accumulated expectations. It selects the port that aligns with its intent, whose expectations it trusts, and whose cone is narrowest among safe options.

It uses the tool and the world responds with feedback.

The agent interprets the feedback, constructing a theory of the transition and arrives at a new situation.

It compares the interpreted outcome against the port's expectations, determining if the expectations were in range, and then refines notes or adds a new port.

A new situation has arisen. The cycle repeats.
