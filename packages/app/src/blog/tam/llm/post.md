# Implementing TAM with LLMs

A practical guide for building agents with situational learning.

---

## The Minimal Implementation

TAM maps onto LLM-based agents with almost no additional infrastructure. The state space $\mathcal{X}$ is already provided by the LLM's latent space constrained by the system prompt.

Ports map to tool calls. If you're using MCP-style function calling, you already have a version of ports. Each tool is a mode of interaction with the world: a function the agent can invoke, with arguments and a description. When the agent selects a tool, it delegates execution elsewhere and waits for the world to respond.

Ports require an additional property over MCP tools: a description of how the world is expected to evolve as a result of using the tool. This can start out broad. For example, the expectation of a send email tool can be:

> "After using this tool, the recipient will have received the contents I added to the email without errors."

## Port Selection

When the agent faces a situation, it needs to see the available ports: tools with their descriptions and accumulated expectations. Selection follows three constraints.

First, the port must align with the agent's intent.

Second, the agent must believe the outcome should fall within the port's expectations.

Third, among safe options, the agent should choose the port with the narrowest expectations, thus maximizing agency. A narrow cone represents a specific commitment to particular outcomes. A wide cone accepts anything and commits to nothing.

An agent with well-calibrated expectations can make specific commitments confidently. A novice agent, uncertain about what will happen, must use wider cones. Expertise is the accumulation of narrow, reliable ports.

## Episode Interpretation

After the agent binds a port, the world must provide feedback. Feedback could be tool execution logs, API responses, user messages, error traces, or any other signal from outside. The agent must interpret the feedback into an internal hypothesis about what happened in the world as a result of its action, and what situation it is currently in.

## Breadcrumbs and Learning

After interpreting the feedback, the agent compares what happened against what it expected. Binding succeeds when it believes the world behaved within the port's expectations and fails otherwise.

Either way, the agent leaves breadcrumbs on the port by adding notes about this binding, removing irrelevant notes, or some combination of the two. By doing so, the agent changes what it can expect by using that port in the future. If the binding failed, the agent may add the erroneous outcome as a new expectation. If the binding was successful, the agent may remove notes of make special notes about why this port was the right choice in the previous situation.

## Port Proliferation

Sometimes a port's expectations become too broad. The agent has seen many different outcomes in many different contexts, and the cone has widened to accommodate all of them. A wide cone is safe but weak because it commits to nothing. The agent can choose to proliferate by creating a new port that wraps the same underlying action with specialized expectations for a particular context.

The original "send-email" port may work in many situations but predict outcomes poorly. The agent can create "send-email-to-executive" with expectations tuned to that context: faster response times, more formal acknowledgments, higher stakes for errors. The underlying tool call is identical but the expectations differ.

## The Loop

Putting it together, the agent cycle is:

The agent finds itself in a situation. It examines the available tools with their accumulated expectations. It selects the port that aligns with its intent, whose expectations it trusts, and whose cone is narrowest among safe options.

It uses the tool and the world responds with feedback.

The agent interprets the feedback, constructing a theory of the transition and arrives at a new situation.

It compares the interpreted outcome against the port's expectations, determining if the expectations were in range, and then refines notes or adds a new port.

A new situation has arisen. The cycle repeats.
