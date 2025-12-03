# Implementing TAM with LLMs

A practical guide for building agents with situational learning.

---

## The Minimal Implementation

TAM maps onto LLM-based agents with almost no additional infrastructure. The state space $\mathcal{X}$ — every distinct state the system can represent — is already provided by the LLM's latent space constrained by the system prompt.

Ports map to tool calls. If you're using MCP-style function calling, you already have ports. Each tool is a mode of interaction with the world: a function the agent can invoke, with arguments and a description. When the agent selects a tool, it delegates execution elsewhere and waits for the world to respond.

TAM requires two additional properties of Ports over MCP tools:

- A Port must have expectations that can be transformed to an evaluation of whether or not the world responded in a way the agent was willing to accept
- A Port must have a way of mapping feedback from the world into an internal assumption about the how the world changed as a result of its action

Both of these can be in natural language and can be as involved as you like. Just set some expectations for the agent about how the world may respond and waht those responses mean.

## Port Selection

When the agent faces a situation, it needs to see the available ports: tools with their descriptions and accumulated expectations. Selection follows three constraints.

First, the port must align with the agent's intent.

Second, the agent must believe the outcome should fall within the port's expectations.

Third, among safe options, the agent should choose the port with the narrowest expectations, thus maximizing agency. A narrow cone represents a specific commitment to particular outcomes. A wide cone accepts anything and commits to nothing.

In short: choose the narrowest cone you trust.

An agent with well-calibrated expectations can make specific commitments confidently. A novice agent, uncertain about what will happen, must use wider cones. Expertise is the accumulation of narrow, reliable ports.

All of these concepts can be rolled into a prompt.

## Episode Interpretation

After the agent binds a port, the world responds. It might be tool execution logs, API responses, user messages, error traces, or any other signal from outside.

The agent's task is interpretation. Given the raw response from the world, what happened? What states did the world pass through? Where is the agent now?

This is the inference function in practice. The agent reads the logs and constructs a theory about the transition. This doesn't need to be explicit.

The output of interpretation is the new situation: the agent's understanding of where it currently stands, ready to select the next port.

## Breadcrumbs and Learning

After interpreting the episode, the agent compares what happened against what it expected. If the outcome falls within the port's expectations, binding succeeded. If not, it failed.

Either way, the agent leaves breadcrumbs on the port by adding notes about this binding, removing irrelevant notes, or some combination of the two.

Changing the notes should change what the agent can expect by using that port in the future, meaning notes must be provided to the agent as context wach time it evaluates ports. This is effectively altering the affordance cone. Widening happens when unexpected outcomes get added to expectations. Narrowing happens when the agent learns to distinguish contexts where different outcomes occur. The affordance predicate evolves through accumulated experience encoded in text.

## Port Proliferation

Sometimes a port's expectations become too broad. The agent has seen many different outcomes in many different contexts, and the cone has widened to accommodate all of them. A wide cone is safe but weak — it commits to nothing.

Rather than accept low agency, the agent can proliferate. It creates a new port that wraps the same underlying action but carries specialized expectations for a particular context.

The original "send-email" port might work in many situations but predict outcomes poorly. The agent can create "send-email-to-executive" with expectations tuned to that context: faster response times, more formal acknowledgments, higher stakes for errors. The underlying tool call is identical. The expectations differ.

Proliferation doesn't add new actions. It specializes expectations. The agent gains agency by committing to narrower outcomes in contexts where it has learned what to expect.

## The Loop

Putting it together, the agent cycle is:

The agent finds itself in a situation. It examines the available ports — tools with their accumulated expectations. It selects the port that aligns with its intent, whose expectations it trusts, and whose cone is narrowest among safe options.

It binds the port. Execution happens elsewhere. The world responds with an episode.

The agent interprets the episode. What happened? Where am I now? It constructs a theory of the transition and arrives at a new situation.

It compares the interpreted outcome against the port's expectations. Match or mismatch, it annotates the port with what it learned.

A new situation has arisen. The cycle repeats.

Over time, the agent's ports become calibrated to reality. Expectations narrow where the world is predictable. They widen where surprises occur. New specialized ports emerge for contexts that deserve specific treatment. The agent becomes an expert in its domain — not by changing its weights, but by refining the text that shapes its decisions.
