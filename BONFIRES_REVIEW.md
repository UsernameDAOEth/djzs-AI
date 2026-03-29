# Bonfires Documentation Review

**Source:** https://docs.bonfires.ai/bonfires/files/Overview/Introduction
**Reviewed:** 2026-03-29
**Reviewer:** DJZS Protocol

---

## Summary

Bonfires is a **knowledge coordination platform** that transforms group chat conversations (Telegram, Discord) into AI-accessible knowledge graphs. It acts as persistent institutional memory for communities — capturing decisions, insights, and context that would otherwise disappear into chat logs.

---

## What It Does

| Component | Description |
|---|---|
| **Agent** | Sits in group chats, reads messages silently, responds when tagged |
| **Knowledge Engine (Bonfire)** | Stores documents, vectors, knowledge graph, and taxonomy |
| **Knowledge Graph** | Visual representation at graph.bonfires.ai — entities and relationships extracted from conversations |
| **Semantic Search** | Meaning-based queries against accumulated community history |
| **HyperBlogs** | AI-generated articles synthesized from community knowledge, monetizable via x402 payments |
| **MCP Integration** | Connects to Claude Desktop, Cursor, and compatible tools |

**Processing loop:** Every 20 minutes, recent messages are processed → structured knowledge (entities, relationships, decisions, insights) is extracted → appended to the graph.

**Access model:** Currently via Genesis NFT mint (0.1 ETH) or direct team engagement. Permissionless deployment planned via `$KNOW` token.

**Reported scale:** 23+ live deployments, 36,700+ knowledge graph nodes, 5,700+ episodic records.

---

## Documentation Quality

### Strengths
- Concise problem statement: "Decisions get made, insights emerge, context accumulates — and almost all of it vanishes into chat logs." Clear and accurate.
- The four-stage operational model (join → extract → query → compound) is easy to follow.
- Honest about current access friction (NFT gate, team contact required).

### Gaps in Published Documentation
The Obsidian Publish vault currently contains only the Introduction page. The following pages are not yet published:
- Architecture overview
- Component deep-dives (Agent, Bonfire, Knowledge Graph, MCP, HyperBlogs)
- Getting Started / Quick Start
- FAQ

This means anyone trying to evaluate technical integration or deployment requirements has no self-serve path — they must contact the team directly.

---

## Relevance to DJZS

### Shared Infrastructure
Both DJZS and Bonfires use **x402 micropayments** as the monetization primitive. HyperBlogs are monetized via x402; DJZS audits are paid via x402 on Base Mainnet. This creates natural composability at the payment layer.

### Complementary Functions
| | DJZS | Bonfires |
|---|---|---|
| **Unit of analysis** | Individual agent reasoning trace | Community conversation history |
| **Output** | ProofOfLogic certificate (Irys) | Knowledge graph node / episodic record |
| **Memory model** | Stateless per-audit | Persistent and compounding |
| **Access** | REST API, XMTP MLS | Telegram/Discord agent, MCP |

DJZS audits *decisions before they execute*. Bonfires captures *why decisions were made after the fact*. Together they close a loop: pre-execution adversarial audit + post-execution institutional memory.

### Integration Opportunities

**1. Audit-linked episodic records**
When DJZS issues a ProofOfLogic certificate, the Irys TX ID and verdict could be forwarded to a community's Bonfire as a structured episodic record. Future queries like "what audits did we run on treasury proposals?" become answerable from the knowledge graph.

**2. Decision archaeology via MCP**
Bonfires' MCP integration means Claude Desktop users can query community history. A DJZS audit prompt could pull relevant prior decisions from Bonfires as `intelligence_context` before running — grounding the adversarial analysis in actual community history rather than the submitter's summary alone.

**3. HyperBlogs as audit summaries**
High-stakes Treasury Zone audits ($50.00) produce verbose ProofOfLogic certificates. Bonfires' HyperBlog generation could synthesize these into readable governance artifacts for communities, monetizable via x402 on the same payment rail DJZS already uses.

---

## Open Questions

1. **Knowledge graph schema** — What ontology does Bonfires use for entities and relationships? Knowing whether `Decision`, `Proposal`, `Actor` are first-class node types would determine how DJZS certificates could be ingested.

2. **Ingest API** — Does Bonfires expose a write endpoint, or is the only ingest path via monitored chat channels? A REST or MCP write tool would be needed for DJZS to post audit results directly.

3. **`$KNOW` token timeline** — Permissionless deployment is gated on this token. Until it launches, each integration requires direct team coordination.

4. **Data residency** — Bonfires processes private community conversations. For communities using DJZS for sensitive treasury decisions, understanding where the Bonfires graph is stored and who can query it is a prerequisite.

---

## Verdict

Bonfires is a credible platform addressing a real problem (community memory loss). The x402 payment overlap and MCP integration path make it the most architecturally compatible knowledge layer for DJZS-adjacent workflows identified to date. The primary blockers are documentation gaps and the current NFT-gated access model. Worth tracking for integration once permissionless deployment ships with `$KNOW`.
