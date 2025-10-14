---
title: TKN Project Proposal
author: Zach Garrett
summary: Outlining a project concept for a marketplace for ML training data created from user interactions with web apps.
---

# **Project Proposal: TKN**

**Date:** October 2025  
**Prepared by:** Zach Garrett
**Version:** Draft v0.3

## **1. Executive Summary**

Modern web and SaaS applications produce vast amounts of behavioral telemetry -- click streams, navigation paths, and user interaction sequences.  
Yet these signals remain locked inside proprietary analytics tools, invisible to emerging **browser and agentic AI models**.

**TKN** establishes a standard way for web applications to:

- Convert behavioral transition sequences into compact symbolic representations (“interaction tokens”).
- Expose a runtime **Model Context Protocol (MCP) server** that agents can discover and query in real time for workflow recipies based on historical usage and their goals.
- Optionally contribute behavioral data to a **shared training marketplace** for browser models.

The result: a universal interface between **apps, users, and agents** — letting LLM-based browsers or copilots safely understand and act within any web application, while giving app owners visibility, control, and economic upside.

## **2. Problem Statement**

### a) For Model Builders

- Browser agents need **structured, goal-oriented examples of real user behavior** to train on, not scraped HTML.
- Every app is different; today’s agents lack per-app grounding and fail on routine workflows.

### b) For App Owners

- They already collect user events but lack a simple way to analyze behavioral sequences in their systems and associate them with goals.
- They lack a way to tell arbitrary incoming agents how to interact with their apps.
- They receive no revenue or visibility when their apps are used to train agents.

## **3. Proposed Solution**

### 3.1 Overview

TKN is composed of three complementary layers:

| Layer                           | Description                                                                                                             | Primary Users                   |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| **A. Symbolic Event Engine**    | SDK + connectors that compress event sequences into symbolic tokens and Markov graphs.                                  | App developers, analytics tools |
| **B. Runtime MCP Server**       | Discoverable endpoint (`/.well-known/mcp`) exposing live goals, actions, and prompts to agents via **Streamable HTTP**. | Browser agents, LLM copilots    |
| **C. Behavioral Data Exchange** | Privacy-preserving marketplace where participating apps can share or sell anonymized event graphs to model builders.    | App owners, AI labs             |

## **4. Technical Architecture**

### 4.1 Event Capture & Compression

- Javascript SDK + analytics connectors (PostHog, Segment, Amplitude, GA4).
- Store raw event sequences, per session.
- Convert raw event sequences into **compressed symbols** with a shared dictionary.

### 4.2 Runtime MCP Server

- Hosted for the app owner (e.g., `https://app.example.com/api/mcp`).
- Discovered via `/.well-known/mcp` or HTTP `Link` header.
- Implements **MCP Streamable HTTP transport** (JSON-RPC).
- Exposes `list_tools`, `list_prompts`, `search_goals`, and `list_steps` tools.
- Accesses the event graph for the app. The agent expresses intent, the server responds with steps to accomplish.

### 4.3 Data Exchange & Privacy

- Multiple levels of granularity -- akin to character, subword, word, and motif tokens depeding on what the model architecture demands.
- Multiple scopes for data. multi app aggregates or individual apps
- All tokens can be decomposed to their constituent parts (words map back to sequences of characters)
- Event tokens can be mapped back to elements in the original app.
- Per-tenant ownership; opt-in sharing under a revenue-split license.

## **5. Distribution Strategy**

### 5.1 Phase 1 – Developer Integrations

- **Goal:** frictionless SDK adoption.
- Publish npm package (`@tkn/sdk`).
- One-line React/Vue hooks.
- Visualizer (Markov map) for instant feedback.

### 5.2 Phase 2 – Analytics Ecosystem Connectors

- Build **PostHog App**, **Segment Destination**, **Amplitude Exporter**.
- Leverage existing event streams — no extra instrumentation.
- Immediate reach into thousands of production apps.

### 5.3 Phase 3 – Agent Ecosystem Integration

- Collaborate with **browser-agent runtimes** (e.g., OpenDevin, BrowserUse, WebVoyager) to improve MCP servers.
- Publish SDKs for agent developers to auto-connect to app MCP endpoints.
- Launch “**Agent-Ready Apps**” directory for public visibility.

### 5.4 Phase 4 – Data Marketplace

- Invite apps to **opt-in** anonymized data sharing.
- Revenue split (70% to contributors).
- Provide usage analytics, provenance certificates, and per-app benchmarks.
- Market to ML engineers training browser or RLHF models.

## **6. Incentives & Monetization**

| Stakeholder        | Value                                                    | Revenue Mechanism                  |
| ------------------ | -------------------------------------------------------- | ---------------------------------- |
| **App Owners**     | Agent discoverability, analytics upgrades, data revenue  | Subscription or data-revenue share |
| **Developers**     | Learn common event sequences and build predictive models | Free tier → Pro SDK                |
| **Model Builders** | Access to rich, structured interaction data              | Dataset or API licensing           |
| **Platform**       | Transaction fees, hosting, premium analytics             | SaaS + marketplace commissions     |

---

## **7. Privacy & Governance**

- **PII never leaves the origin:** all IDs hashed with per-tenant salts.
- **K-anonymity + differential privacy** enforced pre-export.
- **App-level control:** owners choose which goals or actions are exposed.
- **Auditable pipelines:** automatic DP reports and versioned manifests.
- **Ethical use license:** prohibits re-identification; grants only model-training rights.

## **8. Roadmap**

| Phase                       | Timeline                                           | Deliverables                                 |
| --------------------------- | -------------------------------------------------- | -------------------------------------------- |
| **Alpha (Q4 2025)**         | Internal MVP; PostHog & Segment connectors; SDK    | Working symbol compressor, Markov visualizer |
| **Beta (Q1 2026)**          | `.well-known/mcp` examples + reference MCP server. | Integration with sample agents               |
| **Public Launch (Q2 2026)** | Agent-Ready Apps directory + data exchange pilot   | Revenue sharing, governance charter          |
| **Expansion (H2 2026)**     | Multi-language SDKs, enterprise compliance         | DP certification, federated learning nodes   |

## **9. Competitive Landscape**

| Category               | Examples                                    | Gap TKN Fills                           |
| ---------------------- | ------------------------------------------- | --------------------------------------- |
| Web Analytics          | Amplitude, Mixpanel, PostHog                | No agent interface or symbolic export   |
| RPA / Process Mining   | UiPath, Celonis                             | No open runtime protocol                |
| Browser Agent Research | AutoGPT, WebVoyager, AgentBench             | Lack real human interaction priors      |
| Data Marketplaces      | Snowflake Data Share, Hugging Face Datasets | Don’t support behavioral privacy layers |

## **10. Risks & Mitigation**

| Risk                          | Mitigation                                      |
| ----------------------------- | ----------------------------------------------- |
| App owner reluctance          | Immediate analytic value + opt-in + rev-share   |
| Privacy/legal scrutiny        | DP + k-anon + open governance                   |
| Agent ecosystem fragmentation | Base spec on open MCP standard                  |
| Context size limits           | Move to live MCP queries instead of static JSON |

## **11. Success Metrics**

- **Developer adoption:** SDK installs / active sessions / sites exposing MCP server.
- **Agent ecosystem:** # of agent runtimes integrated.
- **Marketplace traction:** # of participating apps, dataset queries, revenue.
- **Model impact:** reduction in failure rate on per-app tasks vs. baseline.

## **12. Long-Term Vision**

TKN transforms the web into a **machine-readable interaction layer** that allows agents to act within apps safely and efficiently. Model trainers view TKN data as a standard source of behavioral data for web interaction.
