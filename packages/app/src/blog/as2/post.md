## Overview

Agentic System 2 (AS2) is an architecture for building agents that can reason about cause and effect. Most agent systems today treat actions as isolated events—they execute commands, observe results, and learn patterns, but they don't maintain a coherent model of how their actions causally relate to the world around them.

The belief I aim to embody in AS2 is that internally consistent agents need three things working together:

1. **A causal interface** that represents actions, resources, and their effects in a structured way
2. **A learning system** that extracts reusable patterns from experience without needing to understand what those patterns "mean"
3. **A planning engine** that can synthesize sequences of actions to achieve goals, using both primitive actions and learned patterns

These three components must work together in a closed loop: the agent acts in the world, learns from what happened, plans new actions based on what it learned, and revises its understanding when reality doesn't match expectations.

The architecture is built on formal foundations but maintains a practical goal: agents that can operate in dynamic, uncertain environments while maintaining an internally consistent understanding of cause and effect.

The posts dive into each component in detail, starting with the formal definitions and working up to how they integrate into a complete cognitive cycle.
