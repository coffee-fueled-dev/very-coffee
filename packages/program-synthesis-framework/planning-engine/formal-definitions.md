# **Planning Engine**

## **1. Overview**

A **planning engine** is a formal system that constructs sequences of actions that transform an initial state into a desired goal state. It operates over:

- a **state space** $(\mathcal{S})$,
- a set of **primitive actions** $(\mathcal{A})$,
- a set of **macro-actions** $(\mathcal{M})$,
- a **transition function**,
- a **goal predicate**,
- a **search procedure** that identifies an optimal or admissible plan.

The planning engine specifies **what constitutes valid planning behavior**, without assuming anything about the internal representation of states or actions.

---

# **2. State Space**

### **Definition (State Space)**

$$
\mathcal{S} \text{ is a non-empty set of valid system states.}
$$

A state $(S \in \mathcal{S})$ represents a complete snapshot of all information relevant to planning.

The planning engine assumes only that states are:

- **distinct** (equality is decidable),
- **immutable** (a transition produces a new state, not a mutation),
- **serializable** (states can be compared or stored reliably).

No assumptions are made about the content or structure of states beyond these properties.

---

# **3. Actions**

## **3.1 Primitive Actions**

### **Definition (Primitive Action)**

A primitive action $(a \in \mathcal{A})$ is defined by:

- a **precondition** function
  $$
  \mathsf{Pre}(a) : \mathcal{S} \to \{\mathsf{True}, \mathsf{False}\},
  $$
- an **effect** function
  $$
  \mathsf{Eff}(a) : \mathcal{S} \to \mathcal{S}.
  $$

### **Applicability**

An action $(a)$ is **applicable** in state $(S)$ iff:

$$
\mathsf{Pre}(a)(S) = \mathsf{True}.
$$

### **Result**

When applicable, action $(a)$ transforms state $(S)$ into:

$$
S' = \mathsf{Eff}(a)(S).
$$

Actions are **deterministic**: each action maps a state to a single successor state.

---

## **3.2 Macro-Actions**

A **macro-action** groups multiple primitive actions into a single planning operation.

### **Definition (Macro-Action)**

A macro-action $(m \in \mathcal{M})$ is defined by:

- a finite sequence of primitive actions
  $$
  [a\_1, a\_2, \dots, a\_k],
  $$
- a composite precondition
  $$
  \mathsf{Pre}(m)(S) = \mathsf{True}
  \quad\text{iff}\quad
  \mathsf{Pre}(a\_1)(S) = \mathsf{True}
  $$
  **and** each subsequent action is applicable in the state produced by its predecessors,
- a composite effect
  $$
  \mathsf{Eff}(m) = \mathsf{Eff}(a\_k) \circ \dots \circ \mathsf{Eff}(a\_1).
  $$

Macro-actions provide a **compressed planning horizon**, enabling long-range transitions to be reasoned about in a single step.

---

# **4. Transition System**

Together, the state space and actions form a **transition system**:

$$
(\mathcal{S},\ \mathcal{A} \cup \mathcal{M},\ \Rightarrow)
$$

where the transition relation is defined by:

### **Definition (State Transition)**

$$
S \Rightarrow S' \quad\text{iff}\quad
\exists o \in (\mathcal{A} \cup \mathcal{M}) \text{ such that }
o \text{ is applicable in } S
\text{ and }
S' = \mathsf{Eff}(o)(S).
$$

The planning engine requires that:

- transitions are **deterministic**,
- cycles **may** exist,
- the space may be **finite or infinite**.

---

# **5. Plan Structure**

### **Definition (Plan)**

A **plan** is a finite sequence of operations

$$
\Pi = [o\_1, o\_2, \dots, o\_n], \qquad
o\_i \in \mathcal{A} \cup \mathcal{M}.
$$

A plan transforms an initial state $(S\_0)$ into a final state $(S\_n)$ via:

$$
S\_0 \xRightarrow{o\_1} S\_1 \xRightarrow{o\_2} \dots \xRightarrow{o\_n} S\_n.
$$

---

# **6. Goal Specification**

### **Definition (Goal Predicate)**

$$
\mathsf{Goal} : \mathcal{S} \to \{\mathsf{True},\ \mathsf{False}\}.
$$

A state $(S)$ is a **goal state** iff $(\mathsf{Goal}(S) = \mathsf{True})$.

A plan $(\Pi)$ is a **solution** iff applying $(\Pi)$ to the initial state yields a goal state.

---

# **7. Cost Model**

Each operation has an associated non-negative cost:

$$
\mathsf{Cost}(o) \in \mathbb{R}_{\ge 0}.
$$

A plan's cost is:

$$
\mathsf{Cost}(\Pi)
= \sum_{i=1}^{n} \mathsf{Cost}(o\_i).
$$

The planning engine supports:

- **uniform-cost search**,
- **heuristic search**,
- **multi-criteria cost functions** (unspecified; engine-agnostic).

---

# **8. Search Procedure**

The planning engine uses a search strategy to discover a valid or optimal plan.

### **Definition (Planning Problem)**

Given:

- initial state $(S\_0)$,
- goal predicate $(\mathsf{Goal})$,
- operations $(\mathcal{A} \cup \mathcal{M})$,

find a plan $(\Pi)$ such that:

$$
\mathsf{Goal}(S\_0 \xRightarrow{\Pi}) = \mathsf{True}.
$$

### **Admissible Search Procedures**

The planning engine may use any search procedure that satisfies:

1. **Soundness**
   Every plan returned must be valid and lead to a goal state.

2. **Optionally, Optimality**
   If declared an _optimal_ planner, the engine must return a plan $(\Pi^*)$ such that:

   $$
   \mathsf{Cost}(\Pi^*) = \min_{\Pi} \mathsf{Cost}(\Pi).
   $$

3. **Online or Offline Operation**
   The planner may operate fully offline or interleave planning with execution.

Search algorithms may include (but are not required):

- BFS, DFS
- Uniform-cost search
- $A^*$
- heuristic-guided search
- best-first graph search
- iterative deepening or bounded-horizon search

The engine is agnostic regarding how search is implemented, as long as the above properties hold.

---

# **9. Failure Handling**

The planner may define **failure transitions**, where an operation's precondition is false:

- The engine must **not apply** an inapplicable operation.
- The planner may store failure information (e.g., to avoid re-exploring unproductive branches), but this is optional and unspecified.

A plan that encounters an inapplicable operation is **invalid**.

---

# **10. Interface Summary**

The planning engine exposes the following abstract interface:

### **Initialization**

```text
Initialize(state S0, goal predicate Goal)
```

### **Plan Construction**

```text
Search(S0, Goal) → plan Π or failure
```

### **Operation Applicability**

```text
Applicable?(operation o, state S) → Bool
```

### **State Transition**

```text
Apply(operation o, state S) → state S'
```

### **Cost Function**

```text
Cost(operation o) → ℝ≥0
```

All other details (heuristics, indexing, caching, pruning, etc.) are left unspecified.

---

# **11. Behavioral Guarantees**

A valid planning engine guarantees:

1. **Deterministic transitions**
   Every operation yields a single successor state.

2. **Correctness**
   Any returned plan transforms the initial state into a goal state.

3. **Termination**
   If the engine claims that no solution exists, it must halt with a definitive answer.

4. **Optional optimality**
   If advertised as optimal, its returned plan must minimize cost.
