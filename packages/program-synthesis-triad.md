# Executive Summary: The Program Synthesis Triad

This document formally defines a closed-loop framework for adaptive program synthesis, built upon a triad of causality modeling, online learning, and formal planning. The system is composed of three interconnected formalisms:

1. **The Offer--Bind--Port Calculus (OBP, $\mathcal{W}$):** Establishes the rigorous, concurrent, resource-aware execution semantics (Causal Modeling).
2. **The TKN Online Morpheme Learner:** Extracts high-utility, reusable pattern sequences (_morphemes_) from OBP execution traces (Online Learning).
3. **The Program Synthesis Engine ($\mathcal{P}$):** Uses the learned morphemes as macro-actions to perform optimal graph search, synthesizing goal-directed programs (Formal Planning).

The framework operates as a self-improving cycle: $\mathcal{W}$ generates execution data, TKN abstracts this data into $\mathsf{MacroAction}\text{s}$, and $\mathcal{P}$ uses the $\mathsf{MacroAction}\text{s}$ to synthesize new, optimized programs for execution by $\mathcal{W}$.

---

# The Offer--Bind--Port Calculus (OBP)

## Primitive Sorts and Core Definitions

The calculus is founded upon the following **primitive sorts**:

[
\mathsf{Party},\qquad
\mathsf{Offer},\qquad
\mathsf{Port},\qquad
\mathsf{Action}.
]

In addition, OBP is interpreted over a **state space** $X$ and a set of admissible trajectories $\mathcal{T}(X)$, which together provide the semantic foundation for ports and actions.

### State Space and Admissible Trajectories

Let $X$ denote the global state space of the system.

Let $\mathcal{T}(X)$ denote the set of all **admissible trajectories**:

[
\tau : [0,T] \to X, \qquad T < \infty,
]

where _admissibility_ incorporates all system-level constraints, including:

- physical or logical invariants,
- resource availability and consumption rules,
- party permissions and capabilities,
- port-state and capacity conditions.

Thus, $\mathcal{T}(X)$ is the constraint-closed set of possible system evolutions.

Each concrete offer $O \in \mathsf{Offer}$ carries a distinguished **state component**:

[
\mathsf{StateOf} : \mathsf{Offer} \to X,\qquad
x_O := \mathsf{StateOf}(O).
]

This state component determines which trajectories are admissible at the ports exposed by $O$.

### Context and Binding-Relevant Data

Binding semantics depend on additional contextual information such as party coalitions, resource inventories, and port metadata. This information is collectively modeled as an element of a **context space**:

[
\mathsf{Context}.
]

A context $C \in \mathsf{Context}$ encodes, for example:

- the coalition of parties participating in the binding,
- the current resource inventories of those parties,
- global resource pool levels,
- port states (e.g.\ published, consumed),
- capacity counters and permission sets.

A deterministic function

[
\mathsf{Ctx} : \mathsf{Offer} \times \mathsf{Port} \times \mathcal{P}(\mathsf{Party}) \to \mathsf{Context}
]

computes the binding context associated with a proposed binding of a coalition of parties to a port of a given offer.

### Ports as Action Cones

A **port** is interpreted as an **affordance map** exposing a cone of admissible trajectories at each state and context:

[
P : X \times \mathsf{Context} ;\to; \mathcal{P}(\mathcal{T}(X)).
]

For $x \in X$ and $C \in \mathsf{Context}$, the set

[
P(x,C) \subseteq \mathcal{T}(X)
]

is the **action cone** exposed by the port $P$ at state $x$ under context $C$. Each $\tau \in P(x,C)$ is a trajectory that can be launched by binding to $P$ in state $x$ under context $C$.

This definition uniformly subsumes a range of affordance regimes:

- **Discrete ports:** $P(x,C)$ is a finite set (often a singleton) of discrete trajectories.
- **Parameterized ports:** $P(x,C) = {\tau_\theta : \theta \in \Theta}$ for a parameter domain $\Theta$.
- **Continuous manifolds:** $P(x,C) = {\tau_\alpha : \alpha \in \Omega}$ for a region $\Omega \subseteq \mathbb{R}^n$.
- **Vector fields and control flows:** $P(x,C)$ is the set of integral curves of a controlled vector field under admissible controls.

### Port Structure of Offers

The port structure of an offer is defined by the function $\mathsf{Ports}$, which maps an offer to an ordered sequence of ports:

[
\mathsf{Ports} : \mathsf{Offer} \to \mathsf{Port}^*.
]

Each $p \in \mathsf{Ports}(O)$ is a port endowed with an affordance-map interpretation

[
\llbracket p \rrbracket : X \times \mathsf{Context} \to \mathcal{P}(\mathcal{T}(X)).
]

For notational simplicity, this interpretation is identified with $p$ itself when no confusion arises.

### Failure Sink ($\bot$)

The set of all offers is defined as the union of valid offers $\mathsf{Offer}^+$ and the distinguished **failure sink** $\bot$:

[
\mathsf{Offer} = \mathsf{Offer}^+ \cup {\bot}.
]

The sink $\bot$ exposes the empty sequence of ports:

[
\mathsf{Ports}(\bot) = \epsilon.
]

No admissible trajectories emanate from $\bot$; informally, all action cones at $\bot$ are empty.

### The Action-Morphism Constructor

An **action** is a subset of the Cartesian product of offers:

[
\mathsf{Action} \subseteq \mathsf{Offer} \times \mathsf{Offer}.
]

The associated input and result offers are defined by the projection maps:

[
\mathsf{InOffer} : \mathsf{Action} \to \mathsf{Offer},\qquad
\mathsf{ResultOffer} : \mathsf{Action} \to \mathsf{Offer}.
]

For $a \in \mathsf{Action}$, $a : O \to O'$ denotes an action with

[
O = \mathsf{InOffer}(a), \qquad O' = \mathsf{ResultOffer}(a).
]

Each action $a$ corresponds semantically to an admissible trajectory segment

[
\tau_a \in \mathcal{T}(X)
]

such that

[
\tau_a(0) = \mathsf{StateOf}(\mathsf{InOffer}(a)), \qquad
\tau_a(T_a) = \mathsf{StateOf}(\mathsf{ResultOffer}(a))
]

for some finite horizon $T_a$.

The set of **Hom-sets** (morphisms between individual offers) is defined by:

[
\mathrm{Hom}(O,O') = { a \in \mathsf{Action} \mid \mathsf{InOffer}(a) = O,\ \mathsf{ResultOffer}(a) = O' }.
]

---

## Structural Functions and Semantics

### Binding as Trajectory Selection (Multi-Party)

The **binding function** $\mathsf{Bind}$ is a partial function that constructs an action from an initial offer, a chosen port, and a coalition of parties $\mathcal{P}(\mathsf{Party})$:

[
\mathsf{Bind} : \mathsf{Offer}^+ \times \mathsf{Port} \times \mathcal{P}(\mathsf{Party}) \rightharpoonup \mathsf{Action}.
]

Given a triple $(O,p,\mathcal{C})$, the associated context is

[
C = \mathsf{Ctx}(O,p,\mathcal{C}) \in \mathsf{Context},
]

and the port $p$ exposes an action cone of admissible trajectories at the state $x_O = \mathsf{StateOf}(O)$:

[
p(x_O,C) \subseteq \mathcal{T}(X).
]

A binding is **defined** if and only if the cone is non-empty:

[
\mathsf{Bind}(O,p,\mathcal{C}) \ \text{defined}
\quad\Longleftrightarrow\quad
p(x_O, \mathsf{Ctx}(O,p,\mathcal{C})) \neq \varnothing.
]

In the defined case, the binding operation selects a trajectory

[
\tau \in p(x_O,C)
]

and advances the workflow state to

[
x_O' = \tau(T),
]

where $T$ is the horizon of $\tau$. A resulting offer $O'$ is defined such that

[
\mathsf{StateOf}(O') = x_O',
]

and metadata (ports, resources, ownership) are updated as determined by the semantics of $\tau$.

An action $a = \mathsf{Bind}(O,p,\mathcal{C})$ thus satisfies

[
\mathsf{InOffer}(a) = O,\qquad
\mathsf{ResultOffer}(a) = O'.
]

#### Binding Constraints

The validity of a binding is governed by the admissibility of the cone $p(x_O,C)$. This admissibility encodes, in particular:

- **Port State Validity:** The port $p$ must be in a published or otherwise bindable state.
- **Capacity:** The current number of bindings at $p$ must be less than a maximum capacity $\max\text{bindings}(p)$.
- **Resource Feasibility:** Resource checks must confirm that the state component of $O$, the participating parties $\mathcal{C}$, and the global resource pool collectively support the resource expenditure induced by trajectories in $p(x_O,C)$.
- **Permission and Policy Conditions:** The parties in $\mathcal{C}$ must have the necessary permissions to initiate the actions encoded by trajectories in $p(x_O,C)$.

These constraints are internalized into the definition of $\mathcal{T}(X)$ and into the computation of $p(x_O,C)$ via $\mathsf{Context}$.

### Evaluation Semantics (Deterministic Local Effects)

The OBP calculus has **deterministic local evaluation**: for a fixed action $a$, the successor offer and its port structure are uniquely determined.

The evaluation function

[
\mathsf{Eval} : \mathsf{Action} \to \mathsf{Offer} \times \mathsf{Port}^*
]

maps an action to its resulting offer and the ports exposed by that offer:

[
\mathsf{Eval}(a) = \bigl(\mathsf{ResultOffer}(a),\ \mathsf{Ports}(\mathsf{ResultOffer}(a))\bigr).
]

Global nondeterminism arises from the existence of **multiple admissible bindings** (multiple cones and trajectories) and from the scheduling of concurrent actions, not from the evaluation of a specific action once chosen.

### Trajectory Concatenation

For trajectories

[
\tau_1 : [0,T_1] \to X,\qquad
\tau_2 : [0,T_2] \to X
]

with $\tau_1(T_1) = \tau_2(0)$, their concatenation is the trajectory

[
(\tau_2 \circledast \tau_1)(t) :=
\begin{cases}
\tau_1(t) & 0 \le t \le T_1,[4pt]
\tau_2(t - T_1) & T_1 < t \le T_1 + T_2.
\end{cases}
]

Concatenation is associative up to canonical time reparameterization, providing the semantic basis for sequential composition of actions.

### Failure Transition Rule

A violation of binding constraints yields an empty action cone. When no admissible trajectory exists, the binding is undefined and may be represented at the action level by a distinguished failure action $a_{\mathsf{fail}}$ with

[
\mathsf{ResultOffer}(a_{\mathsf{fail}}) = \bot.
]

This convention models failure as a transition into the failure sink $\bot$, after which no further ports are exposed.

---

## The Symmetric Monoidal Category $\mathcal{W}$ (SMC)

### Objects and Tensor Product

The category $\mathcal{W}$ has objects corresponding to distributed states, represented as tensor products of offers:

[
X = O_1 \otimes \dots \otimes O_n.
]

The tensor product $\otimes$ is associative and symmetric, modeling concurrency and distribution of offers across parties or subsystems.

A distinguished **failure sink** object $\bot$ is included, representing a globally failed state in which no further progress is possible.

### Axiom (A6): Strict Absorbing Element

The failure sink $\bot$ is a **strict absorbing element** under the tensor product, enforcing failure contagion across concurrent contexts:

[
\forall O \in \mathsf{Offer},\quad
O \otimes \bot = \bot \otimes O = \bot.
]

### Morphisms

Morphisms in $\mathcal{W}$ are generated by:

- primitive actions in $\mathsf{Action}$,
- identity maps,
- symmetry maps $\sigma$,
- sequential composition $\circ$,
- parallel composition $\otimes$.

Semantically, each morphism corresponds to an admissible concatenated trajectory (or combination of trajectories) in $\mathcal{T}(X)$, assembled via concatenation and parallel execution.

---

## Trace Semantics and Trace Extraction

Execution histories are abstracted by a trace functor that maps workflow morphisms to ordered sequences of atomic actions.

### Trace Functor $\mathrm{Tr}$

The trace functor

[
\mathrm{Tr} : \mathcal{W} \to \mathrm{List}(\mathsf{Action})
]

is a monoidal natural transformation that extracts the sequence of primitive actions from any composed workflow. The codomain is the free monoid $\mathrm{List}(\mathsf{Action})$ of finite action sequences.

The functor is defined inductively:

- **Atomic Action:**

[
\mathrm{Tr}(a) = [a].
]

- **Identity/Symmetry:**

[
\mathrm{Tr}(\mathrm{id}*X) = \epsilon,\qquad
\mathrm{Tr}(\sigma*{X,Y}) = \epsilon,
]

where $\epsilon$ is the empty sequence.

- **Sequential Composition:**

[
\mathrm{Tr}(g \circ f) = \mathrm{Tr}(f) \frown \mathrm{Tr}(g),
]

where $\frown$ denotes sequence concatenation.

- **Parallel Composition:**

[
\mathrm{Tr}(f \otimes g) = \mathrm{Tr}(f) \parallel \mathrm{Tr}(g),
]

where $\parallel$ is a **concurrent shuffle** of two sequences, constrained by causal validity.

### Formal Definition of the Concurrent Shuffle ($\parallel$)

Let $\mathrm{Tr}(f) = [f_1,\dots,f_m]$ and $\mathrm{Tr}(g) = [g_1,\dots,g_n]$. The concurrent shuffle $\parallel$ produces the set of all sequences $h \in \mathrm{List}(\mathsf{Action})$ that interleave these actions while respecting internal order and causal constraints.

#### Unconstrained Shuffle

The unconstrained shuffle (or perfect shuffle) $A \bowtie B$ of sequences $A$ and $B$ is defined inductively:

- **Base Case:**

[
A \bowtie \epsilon = \epsilon \bowtie A = {A}.
]

- **Inductive Step:** For non-empty $A = [a] \frown A'$ and $B = [b] \frown B'$,

[
A \bowtie B
= \bigl{ [a] \frown h \mid h \in A' \bowtie B \bigr}
\cup
\bigl{ [b] \frown h \mid h \in A \bowtie B' \bigr}.
]

This yields all interleavings that preserve the relative order of actions within each component sequence.

#### Causal Validity Predicate $C(h)$

The concurrent shuffle $\parallel$ is defined by filtering the unconstrained shuffle via a causal validity predicate $C$:

[
\mathrm{Tr}(f) \parallel \mathrm{Tr}(g)
= { h \in \mathrm{Tr}(f) \bowtie \mathrm{Tr}(g) \mid C(h) = \mathsf{True} }.
]

For a combined trace $h = [h_1, \dots, h_{m+n}]$, define $\mathsf{State}(h_1,\dots,h_k)$ to be the distributed state in $\mathrm{Ob}(\mathcal{W})$ resulting from evaluating $h_1,\dots,h_k$ in sequence via $\mathsf{Eval}$ and the monoidal structure.

The predicate $C(h)$ is satisfied if, for every $k \in {1,\dots,m+n}$:

- the input offer of $h_k$ is available in the preceding state:

[
\mathsf{InOffer}(h_k) \in \mathsf{Offers}(\mathsf{State}(h_1,\dots,h_{k-1})),
]

- the context computed for each binding in $h_k$ admits a non-empty action cone at the relevant port, so that $h_k$ corresponds to a valid binding under the action-cone semantics.

Thus, $C(h)$ ensures that $h$ is a valid global execution path.

### Significance for TKN

The concurrent shuffle induces:

- **Data Generation:** The execution of $f \otimes g$ may yield any interleaving in $\mathrm{Tr}(f) \parallel \mathrm{Tr}(g)$, depending on scheduling and concurrency. The trace functor $\mathrm{Tr}$ extracts one such valid linearization as an action sequence $\mathsf{Action}^*$.
- **Robustness:** TKN operates on these traces; its learned $\mathsf{MacroAction}\text{s}$ are therefore robust to variations in concurrent execution order that respect underlying causal dependencies.

The output $\mathrm{Tr}(f)$ is the concrete, recorded **execution log** or **trace** of the workflow $f$.

---

## Relationship to Operadic Structure

The OBP calculus admits a complementary **symmetric operad** $\mathcal{O}_{\mathrm{OBP}}$ that formalizes compositional interface patterns independently of concrete execution.

The relationship between specification, execution, and logging is captured schematically by:

[
\text{Operadic Tree}
;\xrightarrow{\ \text{Evaluation}\ };
\text{SMC Braid/Net}
;\xrightarrow{\ \mathrm{Tr}\ };
\text{Concrete Database Log}.
]

Here:

- $\mathcal{O}_{\mathrm{OBP}}$ encodes abstract composition rules over interfaces and ports,
- $\mathcal{W}$ provides concrete execution semantics via action cones and trajectories,
- $\mathrm{Tr}$ extracts concrete histories as sequences of actions.

### The Symmetric Operad $\mathcal{O}_{\mathrm{OBP}}$

The symmetric operad $\mathcal{O}_{\mathrm{OBP}}$ defines abstract composition laws over the fundamental sorts of the calculus.

#### Operadic Objects and Arity

The objects of $\mathcal{O}_{\mathrm{OBP}}$ include $\mathsf{Offer}$, $\mathsf{Port}$, $\mathsf{Party}$, and related interface sorts.

An operadic $n$-ary operation is a function

[
\mu : \mathsf{Offer}^{\otimes n} \to \mathsf{Offer},
]

which takes $n$ input offers and yields a single output offer.

#### Operadic Generators

The operad is generated by operations corresponding to the semantic primitives:

- **Binding Operation (Abstract):**

[
\mu_{\mathsf{Bind}} : O \otimes (\mathsf{Party})^{\otimes k} \to O',
]

representing the abstract effect of binding parties to offers via ports, consistent with the existence of non-empty action cones.

- **Sequential Composition:**

[
\mu_{\circ} : \mathsf{Offer} \otimes \mathsf{Offer} \to \mathsf{Offer},
]

representing abstract wiring where the output interface of one component feeds the input of another.

- **Parallel Composition:**

[
\mu_{\otimes} : \mathsf{Offer} \otimes \mathsf{Offer} \to \mathsf{Offer},
]

representing the combination of interfaces without sequential dependency.

#### Operadic Substitution

The core operadic composition is substitution, denoted $\circ_i$. Given an $n$-ary operation $\mu$ and a $k$-ary operation $\nu$, the substitution

[
\mu \circ_i \nu
]

is an $(n+k-1)$-ary operation formed by wiring the output of $\nu$ into the $i$-th input of $\mu$.

Semantically, each port in an operadic interface corresponds to an action cone. Substitution corresponds to:

- selecting trajectories from the cones exposed at the interfaces,
- gluing them along matching states and contexts,
- forming a new composite cone for the resulting interface.

The operadic structure thus provides a syntactic blueprint for generating valid OBP workflows, while the SMC $\mathcal{W}$ instantiates their concrete execution via trajectories and action cones. The trace functor $\mathrm{Tr}$ closes the loop by mapping executed operadic compositions into concrete logs for learning.

---

# The TKN Online Morpheme Learner

TKN is an online, LZ-style pattern discovery mechanism that learns _morphemes_ — reusable subsequences — from execution traces induced by OBP. The mechanism operates via two components: a fast, greedy local segmenter and a global lattice for structural analysis.

## Input: Action Traces from OBP

The input stream for TKN is derived from the causal execution category $\mathcal{W}$. The trace functor $\mathrm{Tr} : \mathcal{W} \to \mathrm{List}(\mathsf{Action})$ provides the sequence of executed actions.

An alphabet $\Sigma$ of observable symbols is assumed. The symbol stream $x_1 x_2 \dots x_T \in \Sigma^*$ is obtained by applying a projection-based labeling map $\mathsf{lab}$ to the trace sequence:

[
\mathsf{lab} : \mathsf{Action} \to \Sigma,
]

where $\Sigma$ is a set of abstract action types (e.g., $\Sigma = { \mathsf{Initiate}, \mathsf{Transfer}, \mathsf{Commit}, \dots }$). The map $\mathsf{lab}$ discards concrete entity identifiers, offer content, and resource metrics, reducing the trace to an abstract sequence of behavioral primitives.

The symbol stream $x_1 x_2 \dots x_T$ is processed online, one symbol at a time.

## Local LZ-Style Segmentation

The core streaming engine is the _Sequencer_, which contains an _LZGate_ and manages pattern discovery. At any time $t$, the Sequencer is defined by a **dictionary** $D_t \subseteq \Sigma^*$ of known patterns and a **current key** $w_t \in \Sigma^*$, representing the candidate pattern.

The LZ-style inclusion heuristic is implemented by a dictionary interface $\mathsf{merge}$, which returns the novelty status of a key:

[
\mathsf{merge} : \Sigma^* \to { \mathsf{known},\ \mathsf{novel} }.
]

### Definition (LZGate Evaluation)

Given previous key $w_t$ and new symbol $x_{t+1}$, the candidate pattern is

[
w_{t+1}^{\mathrm{cand}} = w_t x_{t+1}.
]

The LZGate determines the segmentation boundary:

[
\mathsf{LZGate}\bigl(w*{t+1}^{\mathrm{cand}}\bigr) =
\begin{cases}
\mathsf{continue} & \text{if } \mathsf{merge}(w*{t+1}^{\mathrm{cand}}) = \mathsf{known},[4pt]
\mathsf{segment} & \text{if } \mathsf{merge}(w\_{t+1}^{\mathrm{cand}}) = \mathsf{novel}.
\end{cases}
]

The segmentation process yields a greedy, single-pass decomposition of the input stream into a sequence of **patterns**:

[
p_1, p_2, \dots, p_N \in \Sigma^+, \qquad
p_1 p_2 \dots p_N = x_1 x_2 \dots x_T.
]

Segmentation boundaries are induced exactly at points where an extended key becomes novel with respect to the dictionary.

## Queue and Resegmentation

Emitted patterns are stored in a **Queue**. The Queue applies an optional sequence of **resegmenters** $\mathsf{Resegmenter}$ to transform the local LZ-patterns before exposure.

Each resegmenter is defined by a transformation map:

[
\mathsf{Resegmenter} : (p_1,\dots,p_k) \mapsto \text{transformed segments}.
]

**Example Resegmenter (MDL):** A resegmenter may utilize a cost minimization function such as the Minimum Description Length (MDL) principle, applied over a finite window of queued patterns. This provides a structural optimization layer, balancing pattern length against encoding complexity before patterns are exposed to the global lattice.

The final output of the Queue constitutes an asynchronous stream of locally discovered **morphemes** $(p_i)$.

## Global Context: The Lattice

Global structure over discovered patterns is captured by the **Lattice**, composed of a directed pattern transition graph $G$ and a prefix trie $\mathcal{T}$.

### Nodes and Edges

Each distinct pattern $p \in \Sigma^+$ corresponds to a node $v_p \in V$. Ingestion of the pattern stream $(p_1, p_2, \dots, p_N)$ accumulates transitions:

[
(p_i, p_{i+1}) \mapsto \text{edge } e_i = (v_{p_i} \to v_{p_{i+1}}).
]

The weight $w(p \to q)$ of an edge is defined as the empirical count of the transition:

[
w(p \to q) = \bigl| { i \mid p_i = p,\ p_{i+1} = q } \bigr|.
]

### Trie Layer

The prefix trie $\mathcal{T}$ stores the symbol-level decomposition of each pattern $p$, linking its terminal node to the corresponding graph node $v_p$.

## Hub Scoring and Morpheme Confidence

Pattern importance is ranked by a **hub scoring** algorithm applied to the graph $G$.

### Degree-Based Hub Scoring

For each node $v \in V$, the weighted out-degree is defined as:

[
\deg^+(v) = \sum_{(v \to u) \in E} w(v \to u).
]

The degree-based hub score provides a fast, online approximation of importance:

[
\mathrm{hub}(v) = \log\bigl(1 + \deg^+(v)\bigr).
]

### Top Tokens

The lattice exposes a query $\mathsf{TopTokens}(k)$ returning the $k$ patterns with the highest hub scores. These high-scoring patterns are designated as **morphemes** (stable, high-utility units). Informally,

[
\mathsf{TopTokens}(k) = { p \in \Sigma^+ \mid p \text{ is among the $k$ highest-scoring patterns under } \mathrm{hub} }.
]

Each morpheme is associated with a confidence score $\mathrm{hub}(v_p)$.

## TKN as Morpheme Learning over the Causal Graph

TKN discovers reusable pattern units induced by OBP workflows and ranks them according to their structural roles in the transition network. The overall data flow is:

[
\mathcal{W}
;\xrightarrow{\ \mathrm{Tr}\ };
\mathsf{Action}^*
;\xrightarrow{\ \text{labeling}\ };
\Sigma^*
;\xrightarrow{\ \text{LZ-based TKN}\ };
(p_1,\dots,p_N)
;\xrightarrow{\ \text{Lattice}\ };
G,\ \mathcal{T},\ \mathrm{hub}.
]

OBP establishes the causal execution structure ($\mathcal{W}$), and TKN applies online sequence analysis and graph theory to extract hierarchical knowledge (morphemes) from the resulting trace data.

---

# The Program Synthesis Engine ($\mathcal{P}$)

The Program Synthesis Engine $\mathcal{P}$ utilizes the learned TKN morphemes to perform **graph search** over the OBP state space $\mathcal{W}$. $\mathcal{P}$ acts as the formal planner, finding an optimal path (a program) that satisfies a specified goal condition.

## The Planning State Space ($\mathcal{S}$)

The engine $\mathcal{P}$ operates over the **Planning State Space** $\mathcal{S}$, which is a subset of the global states (objects) of $\mathcal{W}$ that are materialized for search.

### State Representation

A planning state $S \in \mathcal{S}$ is defined as a structured, declarative serialization of an OBP global state $X \in \mathrm{Ob}(\mathcal{W})$. $S$ adheres to a formal schema, enabling validation and immutable manipulation during the search process.

The Planning State $S$ is a tuple of four key components:

[
S = (\mathsf{OfferSet}, \mathsf{PartyState}, \mathsf{Topology}, \mathsf{ResourcePool}).
]

#### 1. The Offer Set ($\mathsf{OfferSet}$)

This component maintains the identity and status of all currently available offers in the system:

[
\mathsf{OfferSet} \subseteq \mathsf{Offer}^+ \times \mathsf{OfferMetadata},
]

where $\mathsf{OfferMetadata}$ includes:

- **ID:** A unique identifier for tracking the offer across $\mathsf{MacroAction}$ compositions.
- **Type:** The offer's abstract type (e.g., $\mathsf{DataService}$, $\mathsf{ComputationRequest}$, etc.).
- **OwnerParty:** The $\mathsf{Party}$ responsible for the offer.
- **CurrentState:** An element of ${\mathsf{Active}, \mathsf{Consumed}, \mathsf{Expired}, \dots}$.

#### 2. The Party State ($\mathsf{PartyState}$)

This component tracks the critical mutable state for each participating $\mathsf{Party}$:

[
\mathsf{PartyState} \subseteq \mathsf{Party} \times \mathsf{PartyMetadata},
]

where $\mathsf{PartyMetadata}$ includes:

- **ID:** A unique party identifier.
- **CurrentInventory:** A mapping from resource types to available quantities (e.g., ${\mathsf{CPU} \mapsto 12, \mathsf{Storage} \mapsto 512}$).
- **Permissions:** The set of $\mathsf{Action}$ types the party is authorized to initiate.

#### 3. The Topology ($\mathsf{Topology}$)

This component links $\mathsf{Offer}\text{s}$ to their exposed $\mathsf{Port}\text{s}$ and defines the preconditions for binding. It is the planning abstraction of the $\mathsf{Ports}$ function:

[
\mathsf{Topology} \subseteq \mathsf{OfferSet} \times \mathrm{List}(\mathsf{PortMetadata}),
]

where $\mathsf{PortMetadata}$ tracks the state and semantics of an individual port:

- **PortID:** A unique port identifier.
- **PortType:** The required input type or contract for a successful bind.
- **BindingState:** The port's availability state (e.g., $\mathsf{published}$).
- **MaxBindings:** The global capacity constraint for the port.
- **ResourceCost:** The resource consumption/production delta induced by binding at this port.

These metadata determine the context elements used when computing port action cones in the underlying OBP semantics.

#### 4. The Resource Pool ($\mathsf{ResourcePool}$)

This component provides a global view of system-wide resources and environmental variables that influence $\mathsf{MacroAction}$ validity:

[
\mathsf{ResourcePool} : \mathsf{GlobalResourceType} \to \mathbb{N}.
]

### $\mathsf{MacroAction}$ Pre-condition and Effect

The state schema $S$ is precisely what is required to define the transition function for $\mathsf{MacroAction}\text{s}$.

#### Pre-Condition ($\mathsf{Constraints}$)

A $\mathsf{MacroAction}$ $m$ is executable in state $S_i$ if and only if:

- **Topology Match:** The topology in $S_i$ contains the specific $\mathsf{Offer}$ and $\mathsf{Port}$ configuration required by the underlying TKN morpheme $p$ (which compiles to a sequence of OBP actions and port bindings).
- **Binding Validity:** For all bindings implied by $p$:

  - The port's $\mathsf{BindingState}$ in $S_i$ is $\mathsf{published}$.
  - The $\mathsf{MaxBindings}$ constraint is not violated.
  - The $\mathsf{PartyState}$ in $S_i$ shows sufficient $\mathsf{CurrentInventory}$ to satisfy the aggregate $\mathsf{ResourceCost}$ of the underlying OBP bindings, consistent with non-empty action cones at each port.

#### Effect

The $\mathsf{Effect}$ function of $m$ computes the successor state $S_j$ by applying the net impact of the morpheme's sequence of OBP actions:

- **Topology Update:** Initial $\mathsf{Offer}\text{s}$ may transition to $\mathsf{Consumed}$ or $\mathsf{Expired}$. New $\mathsf{Offer}\text{s}$ and their $\mathsf{Port}\text{s}$ (as determined by the resulting offers and ports in OBP) are added to $\mathsf{OfferSet}$ and $\mathsf{Topology}$.
- **Resource Update:** The global and per-party resource inventories in $\mathsf{PartyState}$ and $\mathsf{ResourcePool}$ are updated according to the net resource deltas induced by the underlying action sequence.

### Goal Condition ($\mathsf{Goal}$)

The synthesis objective is specified by a goal predicate

[
\mathsf{Goal} : \mathcal{S} \to \mathsf{Bool}.
]

A state $S_k$ is considered a goal if

[
\mathsf{Goal}(S_k) = \mathsf{True},
]

indicating that the synthesis requirements have been met.

---

## The Planner's Operations ($\mathcal{M}$)

The elementary operations available to the planner are the $\mathsf{MacroAction}\text{s}$, which are compiled from the high-utility patterns discovered by TKN.

### MacroAction ($\mathsf{MA}$)

A $\mathsf{MacroAction}$

[
m : S_i \to S_j
]

is a transition in the planning state space $\mathcal{S}$. Each $\mathsf{MacroAction}$ $m$ corresponds to a compiled TKN morpheme $p$, representing a sequence of atomic OBP actions and bindings.

The set of available macro-actions $\mathcal{M}$ is derived directly from the TKN $\mathsf{TopTokens}$ output, together with a compilation process from morphemes to OBP action sequences:

[
\mathsf{MA} : \mathcal{S} \times \mathcal{M} \rightharpoonup \mathcal{S}.
]

### Deterministic Effects and Constraints

Each $\mathsf{MacroAction}$ is defined by a deterministic $\mathsf{Effect}$ function, which encapsulates the sequential composition of the underlying OBP actions. A set of $\mathsf{Constraints}$ ensures the validity of the macro-action by checking preconditions against the current planning state $S$.

---

## Program Synthesis as Optimal Search

The synthesis task is formulated as a graph search problem in $\mathcal{S}$.

### The Plan (Program)

A **plan** $\Pi$ is a finite, ordered sequence of composable $\mathsf{MacroAction}\text{s}$:

[
\Pi = [m_1, m_2, \dots, m_k].
]

The plan must satisfy:

[
S_0 \xrightarrow{m_1} S_1 \xrightarrow{m_2} \dots \xrightarrow{m_k} S_k,
]

with $S_0$ an initial state and $S_k$ a goal state such that $\mathsf{Goal}(S_k) = \mathsf{True}$.

### Cost and Optimality

Each $\mathsf{MacroAction}$ $m \in \mathcal{M}$ is assigned a cost $\mathsf{Cost}(m)$. The Synthesis Engine $\mathcal{P}$ uses graph search algorithms (e.g., A*, Dijkstra) to determine an **optimal plan** $\Pi^*$ minimizing total cost.

A typical multi-criteria cost function is:

[
\mathsf{Cost}(m) =
\frac{\mathsf{Length}(\mathrm{Tr}(m))}{\mathrm{hub}(v_p) + \epsilon}

- \mathsf{FixedOverhead},
  ]

where:

- $\mathsf{Length}(\mathrm{Tr}(m))$ is the number of atomic OBP actions in the underlying trace of $m$ (favoring shorter programs),
- $\mathrm{hub}(v_p)$ is the TKN hub score of the morpheme $p$ corresponding to $m$ (favoring high-utility, reusable patterns),
- $\epsilon > 0$ is a regularization constant to avoid division by zero,
- $\mathsf{FixedOverhead}$ is a nominal cost assigned to each macro-action.

Optimality is defined as:

[
\Pi^* = \arg\min_{\Pi} \sum_{m \in \Pi} \mathsf{Cost}(m),
]

subject to the constraint that $\Pi$ transforms $S_0$ into a state satisfying $\mathsf{Goal}$.

---

## Synthesis Loop Closure

The execution of the synthesized plan $\Pi^{\ast}$ within the OBP calculus unrolls the sequence of $\mathsf{MacroAction}\text{s}$ into their full OBP $\mathsf{Action}$ traces. The trace functor $\mathrm{Tr}$ records these executions as sequences in $\mathsf{Action}^*$, which are then labeled into symbol streams and ingested by TKN.

This closes the self-improving loop:

1. $\mathcal{W}$ executes workflows via action cones and trajectories.
2. $\mathrm{Tr}$ extracts concrete traces of actions.
3. TKN converts traces into morphemes and ranks them via the lattice and hub scores.
4. $\mathcal{P}$ compiles morphemes into $\mathsf{MacroAction}\text{s}$ and searches for optimal plans.
5. New plans are executed in $\mathcal{W}$, generating improved traces for subsequent learning.

Through this triadic interaction between causality modeling, online learning, and formal planning, the system adaptively synthesizes increasingly efficient and structured programs.
