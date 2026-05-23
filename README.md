# 🔥 FlavourMod AI — Real-Time Reddit Moderation Engine

<p align="center">
  <img src="https://img.shields.io/badge/Devvit-Reddit_App-orange?style=for-the-badge" />
  <img src="https://img.shields.io/badge/AI-Moderation-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Realtime-KV_Events-green?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Architecture-Event_Driven-purple?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Status-Production_Ready-brightgreen?style=for-the-badge" />
</p>

<p align="center">
  <b>Real-time AI moderation system that replaces external dashboards with live sticky comments directly inside Reddit posts.</b>
</p>

---

# 🚀 Live Concept

<p align="center">
  <img src="screenshots/dashboard-main.jpeg" width="90%">
</p>

<p align="center">
  Every Reddit post becomes its own <b>self-updating moderation dashboard</b>.
</p>

---

# ⚡ Why FlavourMod?

Traditional moderation systems rely on:

* ❌ External moderation dashboards
* ❌ Delayed moderation visibility
* ❌ Hidden AI decision logic
* ❌ Separate moderator tooling

FlavourMod introduces a different model:

* ✅ Native Reddit moderation experience
* ✅ Real-time AI moderation visibility
* ✅ Transparent AI reasoning
* ✅ Sticky-comment-first architecture
* ✅ Fully event-driven moderation pipeline

---

# 🧠 Core Innovation

<p align="center">
  <img src="https://img.shields.io/badge/Innovation-Sticky_Comment_Dashboard-blueviolet?style=for-the-badge" />
</p>

Instead of building an external dashboard UI, FlavourMod transforms every Reddit post into a live moderation interface.

Moderation decisions are rendered directly inside Reddit using sticky comments synchronized with the AI pipeline.

---

# ⚡ Key Features

## 🧠 Hybrid AI Moderation Engine

FlavourMod uses a multi-layer moderation pipeline:

* 🧠 OpenAI moderation layer
* ⚙️ Rule-based scoring engine
* 🛡️ Safety floor protection system
* 🔁 Fallback moderation engine

### AI Output Includes

* Score (0–100)
* Confidence score
* Moderation reasoning
* Structured moderation flags
* Final decision state

---

## 🔄 Real-Time Event-Driven Pipeline

```text
PostCreate Event
      ↓
KV Queue Storage
      ↓
Lock-Safe Worker Engine
      ↓
AI Scoring Layer
   ├── OpenAI Moderation
   ├── Rule Engine
   ├── Fallback Engine
      ↓
Decision Engine
      ↓
Sticky Comment Renderer
```

### System Features

* Lock-safe worker execution
* Multi-job queue processing
* Real-time event broadcasting
* State-machine-based moderation flow
* Full trace logging and observability

---

# 🏗️ Architecture

```mermaid
graph TD;

A[Reddit Post Created] --> B[Devvit PostCreate Trigger]
B --> C[KV Queue Storage]
C --> D[Worker Engine]

D --> E[OpenAI Moderation]
D --> F[Rule Engine]
D --> G[Fallback Engine]

E --> H[Decision Engine]
F --> H
G --> H

H --> I[State Machine]
I --> J[Sticky Comment Dashboard]
J --> K[Realtime KV Sync]
```

---

# 📸 Screenshots

---

## 🏗️ Architecture Diagram

<p align="center">
  <img src="screenshots/architecture-diagram.png" width="900">
</p>

---

## 💬 Sticky Comment Dashboard

<p align="center">
  <img src="screenshots/dashboard-main.jpeg" width="900">
</p>

---

## ⚡ Worker Pipeline Logs

<p align="center">
  <img src="screenshots/worker-logs.png" width="900">
</p>

---

## 🔄 State Machine Flow

<p align="center">
  <img src="screenshots/state-machine.png" width="900">
</p>

---

# 🧠 Moderation Intelligence

## 🍲 Recipe Detection

FlavourMod is optimized for recipe communities:

* Ingredients parsing
* Cooking-step recognition
* Structured recipe detection
* Food-context classification

---

## ❓ Question Detection

Detects:

* “how”
* “what”
* “why”
* instructional content

Used to reduce false removals.

---

## 🚨 Spam Detection

Detects:

* promotional patterns
* low-quality content
* suspicious links
* spam signals

---

# 📊 Moderation Logic

| Score Range | Decision | Meaning |
|---|---|---|
| 80–100 | APPROVE | High-quality safe content |
| 40–79 | REVIEW | Requires moderator inspection |
| 0–39 | REMOVE | Unsafe or spam-like content |

---

# 💬 Example Sticky Comment

```text
🧠 FlavourMod AI Moderation

Score: 65/100
Decision: REVIEW

Flags:
- missing_body

Reason:
The post lacks structured content for classification.

Confidence: 70%
```

---

# 📡 Real-Time Infrastructure

FlavourMod includes:

* KV-backed moderation queue
* Version-based synchronization
* Live realtime broadcasts
* Sticky comment updates
* Queue observability
* Worker state tracking

### State Machine

```text
QUEUED
   ↓
PROCESSING
   ↓
DECIDED
   ↓
MODERATED
   ↓
DONE
```

---

# 🔒 Reliability Features

* Lock-safe worker execution
* Idempotent processing model
* Fault-tolerant fallback system
* Score normalization layer
* AI safety floor protections
* Queue recovery support

---

# ⚙️ Core Components

## 1. Devvit Trigger Layer

* Captures `PostCreate` events
* Initializes moderation jobs
* Starts worker execution pipeline

---

## 2. KV Queue System

* Persistent moderation queue
* Stores latest moderation jobs
* Maintains synchronization state
* Real-time dashboard versioning

---

## 3. Worker Engine

* Async moderation processor
* Lock-safe execution
* AI orchestration layer
* State transition manager

---

## 4. AI Moderation Layer

* OpenAI moderation scoring
* Rule-engine classification
* Recipe/question/spam detection
* Safety override system

---

## 5. Sticky Comment Dashboard

* Native Reddit moderation UI
* Live moderation visibility
* Real-time synchronization
* Transparent AI reasoning

---

# 🎬 Demo Video

[🎬 Watch Demo Video](https://www.loom.com/share/89d9b75e7bb945818836aef1d2fb8eeb)

---

# 🛠️ Tech Stack

<p align="center">

<img src="https://img.shields.io/badge/Devvit-Framework-orange" />
<img src="https://img.shields.io/badge/TypeScript-Strict-blue" />
<img src="https://img.shields.io/badge/OpenAI-GPT-black" />
<img src="https://img.shields.io/badge/KV-Storage-green" />
<img src="https://img.shields.io/badge/Realtime-Events-purple" />

</p>

---

# 📦 Setup

```bash
npm install
npm run build
npx devvit upload
npx devvit install
```

---

# 🔐 Environment Variables

| Variable | Purpose |
|---|---|
| OPENAI_API_KEY | OpenAI moderation access |

---

# 🎯 Use Cases

* Reddit recipe moderation
* AI-assisted moderation workflows
* Spam filtering
* Low-quality content detection
* Real-time moderation infrastructure
* Event-driven moderation systems

---

# 🏆 Why This Project Stands Out

FlavourMod combines:

* 🧠 AI reasoning
* ⚡ Real-time event systems
* 🔄 Worker-based infrastructure
* 💬 Native Reddit moderation UX
* 📡 Transparent moderation visibility
* 🏗️ Production-style architecture

Most moderation tools rely on external dashboards.

FlavourMod brings moderation directly into Reddit itself.

---

# 🔮 Future Improvements

* Moderator action buttons
* Embedded approval controls
* Multi-subreddit scaling
* Historical analytics engine
* AI learning feedback loops
* Advanced moderation metrics

---

# 🔐 Safety & Transparency

FlavourMod is designed as a human-aligned moderation system:

* AI assists moderators
* Decisions are explainable
* Every action is traceable
* Logs are audit-friendly
* Human moderators retain final authority

---

# ⚠️ Current Limitations

* Sticky-comment-based UI only
* Optimized primarily for structured content
* OpenAI API key required
* Minor KV synchronization delay possible under load

---

# 🏁 Final Statement

<p align="center">
<b>
FlavourMod transforms Reddit moderation into a real-time, AI-powered, transparent system directly inside every post.
</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Built_For-Reddit_Devvit-orange?style=for-the-badge" />
</p>

---

# 👨‍💻 Author

Built for the Reddit Devvit ecosystem  
Focused on scalable AI moderation systems, realtime infrastructure, and event-driven architecture.
