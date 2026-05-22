

# 🤖 FlavourMod AI Engine

### ⚡ Real-time AI moderation system for Reddit (Sticky-Comment First Architecture)

FlavourMod AI Engine is a **Devvit-based, event-driven moderation system** that processes Reddit posts in real time, applies hybrid AI scoring, and produces moderation decisions using a scalable worker pipeline.

Unlike traditional moderation tools, FlavourMod does **not rely on external dashboards**.

Instead, it delivers a **live moderation interface directly inside Reddit posts via sticky comments**, making moderation fully native, transparent, and real-time.

It is optimized for **recipe and structured content communities**, with full traceability, audit logs, and KV-backed queue processing.

---

# 🚀 Key Features

## ⚡ Real-Time Content Moderation

* Processes posts instantly on `PostCreate`
* Fully event-driven Devvit pipeline
* AI evaluates post quality + safety in real time
* Automatic moderation decisions:

  * 🟢 **APPROVE** → Safe content
  * 🟡 **REVIEW** → Needs inspection
  * 🔴 **REMOVE** → High-risk / invalid content

---

## 🧠 Hybrid AI Scoring Engine

FlavourMod uses a **multi-layer scoring system**:

* 🧠 OpenAI moderation (primary intelligence layer)
* ⚙️ Rule-based engine (fast structural detection)
* 🛡️ Safety floor system (prevents false removals)

### Outputs:

* Score (0–100)
* Confidence (0–100%)
* Reason explanation
* Flags (missing content, spam signals, recipe structure detection)

---

## 🔄 Event-Driven Worker Pipeline

A production-style async architecture:

```
PostCreate Trigger
        ↓
KV Queue (Job Storage)
        ↓
Lock-Safe Worker Engine
        ↓
AI Scoring Layer (OpenAI + Rules)
        ↓
Decision Engine
        ↓
State Machine (QUEUED → PROCESSING → DECIDED → MODERATED → DONE)
```

### Features:

* Lock-safe execution (prevents duplicate processing)
* Multi-job iteration per cycle
* Full trace logging per job
* Fault-tolerant fallback engine

---

## 💬 Sticky Comment “Live Dashboard”

FlavourMod replaces dashboards with **native Reddit UI output**:

### Each post contains a live sticky comment showing:

* Score
* Confidence
* Decision (APPROVE / REVIEW / REMOVE)
* Flags
* AI reasoning

### Why this matters:

* No external dashboard needed
* Fully inside Reddit UX
* Always synchronized with KV state
* Real-time moderation transparency

---

## 📦 Persistent KV Queue System

* KV-backed job queue (`dashboard:queue`)
* Stores last 50 moderation results
* Version-controlled updates for real-time sync
* Efficient read/write for Devvit runtime

---

## 📊 Real-Time System Behavior

* ⚡ Instant moderation on post creation
* 🔄 Live queue + worker updates
* 💬 Sticky comment updates inside Reddit
* 📡 Realtime broadcast events (`dashboard:update`)
* 🧾 Full trace logs per moderation cycle

---

# 🏗️ System Architecture

```
Reddit Post Created
        ↓
Devvit PostCreate Trigger
        ↓
KV Queue (Job Enqueue)
        ↓
Worker Engine (Lock-Safe Processor)
        ↓
Hybrid AI Layer (OpenAI + Rule Engine)
        ↓
Decision Engine (Score → Action)
        ↓
State Machine Tracker
        ↓
Sticky Comment Renderer (Live Output)
        ↓
Realtime Dashboard Sync (KV Versioning)
```

---

# Screenshots

## Architecture Diagram

<p align="center">
  <img src="screenshots/architecture-diagram.png" width="900">
</p>

---

## Live Moderation Dashboard

<p align="center">
  <img src="screenshots/dashboard-main.jpeg" width="900">
</p>

---

## Worker Pipeline Logs

<p align="center">
  <img src="screenshots/worker-logs.png" width="900">
</p>

---


## State Machine


<p align="center">
  <img src="screenshots/state-machine.png" width="900">
</p>


---



# 🧠 Moderation Logic

| Score Range | Decision | Meaning                 |
| ----------- | -------- | ----------------------- |
| 80–100      | APPROVE  | High-quality content    |
| 40–79       | REVIEW   | Needs moderation review |
| 0–39        | REMOVE   | Spam / unsafe content   |

### Every decision includes:

* AI reasoning
* Confidence score
* Flags (spam, missing body, recipe structure, etc.)

---

# ⚙️ Core Components

## 1. Devvit Trigger Layer

* Captures Reddit `PostCreate` events
* Converts posts into moderation jobs
* Initializes KV + queue pipeline

---

## 2. Queue System

* KV-backed queue storage
* Maintains job ordering
* Syncs with dashboard version updates
* Ensures fault-tolerant processing

---

## 3. Worker Engine

* Async job processor
* Lock-safe execution model
* Calls AI scoring engine
* Updates state machine
* Emits realtime events

---

## 4. AI Moderation Engine

* OpenAI moderation (primary layer)
* Rule-based fallback engine
* Content classifier (recipe/question/spam detection)
* Safety floor system (prevents false negatives)

---

## 5. Sticky Comment Dashboard

* Native Reddit embedded moderation view
* Displays live AI decisions
* Updates via KV version sync
* Acts as the **only UI layer in the system**

---

# 📡 Live System Behavior

* ⚡ Instant moderation on post creation
* 🔄 Continuous worker + queue processing
* 💬 Sticky comment reflects real-time state
* 🧠 AI reasoning displayed transparently
* 📊 KV + realtime sync ensures consistency

---

# 🔐 Safety Model

FlavourMod is a **human-aligned AI moderation system**:

* AI provides recommendations, not final authority
* Every decision is explainable
* Full audit trail via KV + logs
* Moderation transparency via sticky comments

---

# ⚠️ Current Limitations

* UI is **sticky-comment-based only (no dashboard panel UI)**
* Optimized primarily for structured / recipe-like content
* Requires OpenAI API key for full scoring accuracy
* KV updates may introduce slight real-time delay under load

---

# 🛠️ Tech Stack

* 🧩 Devvit (Reddit platform runtime)
* ⚡ TypeScript (core engine)
* 🗄️ KV Store (Redis-like persistence)
* 🧠 OpenAI GPT moderation model
* 🔁 Async Worker Architecture
* 📡 Devvit Realtime API

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

| Key            | Purpose                     |
| -------------- | --------------------------- |
| OPENAI_API_KEY | AI moderation engine access |

---

# 🎯 Use Cases

* Reddit recipe communities moderation
* Spam / low-quality filtering
* AI-assisted moderator workflows
* Real-time content safety systems
* Event-driven moderation pipelines

---

# 📌 Future Improvements

* Embedded moderator action buttons (Approve / Remove)
* Multi-subreddit scaling engine
* Advanced analytics dashboard (external optional)
* AI feedback learning loop
* Weighted confidence tuning system

---

# 🏁 Impact Summary

FlavourMod AI Engine delivers a **production-style, event-driven moderation system** for Reddit that replaces external dashboards with **live, in-post AI moderation transparency**.

It combines:

* AI reasoning
* Rule-based safety systems
* Worker-based architecture
* Real-time KV synchronization
* Native Reddit UI output

All inside a single scalable Devvit pipeline.

---

# 👨‍💻 Author

Built for the Reddit Devvit ecosystem
Focused on real-time AI systems, moderation infrastructure, and event-driven architecture

---

