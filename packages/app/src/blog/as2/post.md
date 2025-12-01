# Overview

Agentic System 2 (AS2) is an architecture for building agents that can reason about cause and effect. Most agent systems today treat actions as isolated events. They execute commands, observe results, and learn patterns, but don't maintain a coherent model of how their actions causally relate to the world around them.

AS2 is designed based on the belief is that internally consistent agents need three core capabilities:

1. A way to represent actions, resources, and their effects structurally
2. A way to learn patterns from experience
3. A way to synthesize sequences of actions to achieve goals based on current context and past experience

These three capabilities must work together in a closed loop: the agent acts in the world, learns from what happened, plans new actions based on what it learned, and revises its understanding when reality doesn't match expectations.

The posts start by formally defining each of three components which are responsible for the core functions, and then work up to their integration into a complete cognitive cycle.
