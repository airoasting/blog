---
title: "세계는 왜 아직도 SAP 위에서 돌아가는가"
date: 2026-03-16
category: company
source: a16z (Eric Zhou, Seema Amble)
tags: [SAP, ERP, 레거시, AI에이전트, 엔터프라이즈, 디지털전환, 임원, 창업자, 팀장]
original_url: https://a16z.com/why-the-world-still-runs-on-sap/
roasting_quote: "SAP 업그레이드에 7억 달러, 3년, 컨설턴트 50명. 그래 놓고 결과물은 읽기 전용 보고서다. 당신 회사의 디지털 전환도 이 코스를 밟고 있지 않은가?"
next_post:
---

## 소스 원문

**출처**: https://a16z.com/why-the-world-still-runs-on-sap/
**날짜**: 2026년 3월 16일
**저자**: Eric Zhou, Seema Amble (Andreessen Horowitz)

### Why the World Still Runs on SAP

**목차**
- SAP is Painful, And Yet We Still Use It
- Implementation
- Usage and Maintenance
- Extensions
- What does the endgame look like?

With AI, startups and their customers have focused their attention on net-new capabilities and the products they've enabled. Think shiny new voice agents, workflow automation tools, and text-to-app platforms.

While there have been and will be many exciting businesses in these categories (we are invested in several!), AI will have a massive impact on something far less glamorous and far more valuable: helping organizations get more from the large amount of software they already run. To ask a question that sounds almost disrespectful until you've spent a week in a Fortune 500: why do people still use SAP (and ServiceNow, and Salesforce) at all?

The short answer is that SAP, or any major legacy system of record, captures critical data across the businesses that use it. But on top of that, the business has customized it and built a set of specific procedures and roles on top of it, much of which is not actually documented anywhere. Moving off has been painful, expensive, and time consuming – often requiring an army of consultants, years of time and hundreds of millions of dollars. Upgrading from SAP ECC to SAP S4HANA can cost $700M, take 3 years, and require a team of 50 from Accenture. And then after the move, the software is almost only useful for generating read-only reports that are impossible to manipulate.

That is until now. AI unlocks that opportunity to upgrade, customize, replace, and frankly better access and use the data captured in these systems of record.

Ultimately, the destination with AI might not be to "replace SAP/ServiceNow/Salesforce," but to make them more programmable and approachable. The winners will be the platforms that (1) plug into transformation budgets with measurable risk and timeline reduction, then (2) expand into day-to-day operations as the trusted control plane for work, gradually unbundling the legacy UI into composable, governed, AI-assisted actions and thin apps. In other words, the systems of record endure; the interface, automation, and extension layer becomes the new software frontier.

### SAP is Painful, And Yet We Still Use It

To set the stage here, let's share a bit about SAP and what it does. On the surface, these systems are hard to navigate, painful to change, and somehow still the backbone of how the world's biggest organizations operate.

But that "somehow" is the opportunity.

The uncomfortable answer is that, beneath the ugly UI and the endless configuration, these systems are very powerful: they encode the canonical data model of the business, the permissions and controls that keep it compliant, the workflows that make it operable at scale, and the integrations that connect dozens (or hundreds) of downstream processes. They're not "apps" in the consumer sense, they're accumulated institutional memory expressed as tables, roles, approvals, posting logic, and exception handling.

Replacing this is more than just expensive; it's risky. And the more a company has invested – custom fields, workflows, pricing rules, reporting logic – the more the system becomes a moat of switching costs and a competitive advantage. That's also why extensibility is so powerful: every enterprise is unique, change is constant (new regulations, new products, new org structures), and these platforms survive because they can be bent to fit reality. The challenge is that the same extensibility that makes them valuable also makes them brittle: each customization becomes a future upgrade landmine, each workflow a maze, each screen a tax on every human who has to use it.

This brittleness shows up everywhere. User satisfaction with CRM remains mixed despite broad adoption, and heavy customization in ERP is consistently tied to timeline and budget overruns. Workers are drowning in fragmented workflows – digital workers toggle between different applications ~1,200 times per day (about 4 hours a week lost), and 47% of digital workers struggle to find the information they need to do their jobs. Large-scale "transformations" routinely stumble; one estimate has roughly 70% failing to meet objectives. The spend tied to this friction is enormous: the software implementation/system integration market alone was about $380B in 2023.

The process and pain here presents an opportunity for AI to change the way this software is implemented and used. The easiest way to understand the opportunity is to follow the lifecycle of the suite: first you implement or migrate it, then you live inside it every day, and then you build on top of it as the business changes. In each phase, the job is turning messy human intent into correct, auditable action against systems of record.

Let's consider how AI can improve how we use legacy software systems at every stage.

### Implementation

Let's start with implementation – the riskiest, most budget-sensitive phase and the one with the clearest payback. Concretely, that looks like turning messy discovery (meetings, docs, tickets) into structured requirements, then auto-producing the implementation workstream: process and field mappings, config and code, test scripts, cutover plans, and migration playbooks – plus the data cleansing and validation needed to go live. This is hard to get right: German supermarket giant Lidl once famously scrapped its effort to transition onto SAP after spending $500 million.

Companies here build copilots, project management tools, and other software to help with migrations and implementations. Here are some examples of startups working in the space (Andreessen Horowitz is invested in some of these companies):

- Axiamatic is an AI "assurance" layer for ERP: it builds a knowledge graph from project artifacts and flags hidden failures in requirements/change management via Slack/Teams to de-risk and accelerate S/4HANA programs (partnered with SAP Build; baked into KPMG/EY/IBM motions).
- Conduct is a code- and process-mapping copilot that generates a semantic layer and technical documentation across ECC→S/4, with Q&A over custom tables/APIs to speed internal takeover.
- Auctor does agentic implementation delivery for SIs/pro services, auto-capturing discovery into structured requirements before becoming a system of record for SOWs, design docs, user stories, configs, and test plans.
- Supersonik helps with AI-powered product enablement for channels/MSPs and customers – vision and voice agents that teach inside the real UI, reducing SE headcount needs and enabling reseller-led implementations/expansions.
- Tessera's AI-native SI manages enterprise transformations end-to-end – connecting into a customer's existing ERP instance, evaluating how it's implemented, and then flagging/automatically remediating what needs to be changed during migration.

These companies create value by making transformations faster, cheaper, and less risky. They do this in a few key ways: catching problems early in requirements and change management before they snowball, compressing timelines (where a single slipped month can cost millions, turning messy project data into structured knowledge so internal teams can take ownership faster, and reducing reliance on large SI teams through automation of mapping, documentation, testing, and enablement.

We see room for more startups building tools that work with existing partners rather than against them. Specifically:

- Implementation agents that share in outcomes and risk (think requirements tracking, config comparison, cutover simulation, code generation, and drift detection)
- Semantic documentation tools that keep knowledge current and accessible
- Enablement agents that turn training and channel rollout into a repeatable product

Because startups can alleviate enterprise-level burdens, they can price to the delay avoided, and sell into the transformation budgets CIOs and CFOs are already spending, displacing bloated SI engagements in the process.

### Usage and Maintenance

Next, after a software suite has been implemented, using it means navigating the mess of a UI these software suites have today. Day-to-day work spans dozens of screens, role turnover resets know-how, and a long tail of edge-case workflows never gets first-class product treatment. Users spend time hunting for fields, mirroring data between systems, and asking ops teams to "just run this report." The result is slow cycle times, avoidable errors, and persistent training burden.

The opportunity is for AI to wrap legacy systems with a friendlier, more capable "system of action."

Companies in this category build tools that help teams get more out of the systems they already use. In practice this looks like a copilot that lives in Slack or as a browser sidecar, that can answer "Where can I find X?" or "How do I do Y?" using semantic search, and then take safe actions (create a case, post a journal entry, update supplier terms) via APIs when available. These tools can also chain together compose multi-app workflows ("pull last quarter's POs from SAP, check contract terms in Coupa, draft a variance note in ServiceNow"), with human approval steps, audit trails, and granular RBAC. The best ones track adoption, time saved, and error rates.

A lot of the work that matters in enterprises still isn't exposed cleanly through APIs – it lives in screens, thick clients, VDI sessions, and half-documented admin consoles. That's why modern "computer-use" agents are such an important complement to API-first copilots: they expand the reachable surface area of automation to the last 30–40% of workflows where there simply isn't a reliable endpoint to call. The core capability isn't "clicking buttons," it's reliability under mess – agents that can perceive the UI, anchor to stable elements, recover from pop-ups and layout drift, and checkpoint progress so they can resume safely mid-flow. When paired with validation (diffs, reconciliations, sandbox runs) and enterprise controls (SSO, secrets, least privilege, audit), this turns what used to be manual work into governed, repeatable automation – ticket triage, period-close steps, customer updates, pricing changes – even in the parts of SAP/ServiceNow/Salesforce that vendors never built for automation. APIs make the happy path fast, and computer-use makes the long tail automatable.

Companies like Factor Labs and Sola are already deploying these agents in production, replacing BPO spend and helping large organizations automate tasks at scale.

### Extensions

Finally, even if you make SAP/ServiceNow/Salesforce easier to use, your business will keep changing which means your system of record will have to as well. New products, new policies, new acquisitions, new regulations, and a long tail of workflows that will never justify a core-module project mean constant work to keep software relevant to the actual state of your business. Historically, teams have had two options: customize the suite (and inherit the brittleness tax) or build one-off apps (and struggle to integrate, govern, and maintain them). This is the third wedge for AI: shipping small, governed experiences on top of systems of record, fast, while keeping the core clean.

Building net-new tools and automations on top of legacy estates becomes the "Lovable" layer over unloved software. The pattern starts with a unified data-and-action plane: read from systems of record via APIs and events (and safe UI capture where needed), normalize into a semantic model of business objects (orders, vendors, cases), then expose a governed set of actions with RBAC, approvals, and audit.

On top of that plane, teams ship focused experiences that feel modern and purpose-built. Instead of sending a procurement analyst through 12 SAP transactions to onboard a supplier, you give them a single "Vendor Onboarding" thin app that gathers documents, checks duplicates, routes approvals, and posts the right records back to SAP. Instead of asking RevOps to open five Salesforce screens to update renewal terms, you give them a spreadsheet-speed editor that can bulk-edit, validate against policy, preview impact, and then commit changes with a full audit trail. Instead of yet another "portal project," you give frontline teams a command palette that can answer questions and execute the handful of actions they do every day ("create return," "extend credit," "open a Sev-2," "post accrual") across multiple systems, without spelunking through 20 tabs.

These extensions also unlock cross-system workflows and automations that no single vendor would ever prioritize: event-driven triggers like "if invoice posted AND variance >3% → draft an explanation → route for approval," or "if ticket reopened twice → create problem record → assign owner → update customer," with human-in-the-loop checkpoints where it matters. Over time, the most valuable deployments turn into reusable "intent packs" — quote-to-cash, vendor onboarding, period close — that encode not just what to do, but how to do it safely in your environment.

Platforms like General Magic's Cell make the building blocks for architecting these bespoke workflows tangible: you upload OpenAPI specs so every endpoint becomes an action, then embed a native command bar with a single script tag that executes real API calls, backed by analytics, multitenancy, security guardrails, and RBAC, so the work shifts from rebuilding another UI to composing the right actions and policies on top of systems you already trust.

### What does the endgame look like?

We think legacy systems will mostly persist, but they'll stop being the surface area where work happens. ERPs, CRMs, and ITSM suites are too embedded to be ripped out on a typical software cadence; they evolve slowly and remain systems of record. What will change is the user-facing "system of action" that sits on top: AI will become the default interface for discovering how the system works, executing workflows across it, and shipping small, modern experiences that bypass legacy UI altogether. In other words, the bridge becomes the highway.

Enduring software in this category will look less like a chatbot and more like an operating layer: a unified data and action plane with a semantic model of business objects, plus guardrails that make AI trustworthy in production. If you're an end user, instead of learning which screen, field, and transaction code to use (and then re-learning it every time the UI or process shifts), you describe the outcome you want and the system gets you there. You'll ask a couple clarifying questions, be shown a preview of what it's going to do, and then the tool will execute with the right approvals and an audit trail. Closing the loop looks like "create a return and notify the customer," "open a Sev-2 and pull the last three related incidents," or "onboard this vendor, collect the docs, route approvals, and set payment terms" — actions that today require hopping across SAP, Salesforce, ServiceNow, and spreadsheets. This gives us fewer errors and reversals, less dependency on tribal knowledge, faster cycle times, and dramatically lower training burden because the interface is intent-driven, role-aware, and self-serve by default.

The moat compounds from real usage: every successful workflow becomes a reusable intent, every exception becomes a guardrail, every migration artifact becomes living lineage, and every integration deepens the graph of how the enterprise actually runs. Over time, the "AI layer" becomes the place teams go to understand change impact, prevent drift, measure ROI, and ship new workflows, even when the underlying systems remain the same.

### 저자 소개
- **Eric Zhou**: Andreessen Horowitz 파트너, Generative AI 애플리케이션 레이어 투자 담당
- **Seema Amble**: Andreessen Horowitz 파트너, B2B 소프트웨어 및 핀테크 투자 담당
