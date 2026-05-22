
---

# 🤖 FlavourMod AI Engine

### Real-time AI moderation system for Reddit recipe communities

FlavourMod AI Engine is a **Devvit-based event-driven moderation system** that processes Reddit posts in real time, applies AI scoring for content evaluation, and routes submissions into **APPROVE / REVIEW / REMOVE** decisions using a scalable worker pipeline.

It is currently optimized for **recipe-related content moderation workflows**, with full traceability and a live moderation view delivered through **sticky comment updates inside Reddit posts**.

---

## 🚀 Key Features

### ⚡ Real-Time Content Moderation

* Processes Reddit posts instantly on creation
* AI evaluates content quality and safety
* Automatically assigns moderation state:

  * 🟢 APPROVE (safe content)
  * 🟡 REVIEW (needs inspection)
  * 🔴 REMOVE (high-risk or invalid content)

---

### 🧠 AI Scoring Engine

* Structured risk scoring (0–100)
* Confidence-based moderation decisions
* Explanation-driven AI reasoning
* Automatic flag detection:

  * Missing content
  * Off-topic posts
  * Low-quality / incomplete recipes

---

### 🔄 Event-Driven Worker Pipeline

* Asynchronous job-based processing system
* Safe worker execution with locking mechanism
* Step-by-step moderation lifecycle tracking:

  * QUEUED → PROCESSING → DECIDED → MODERATED
* Full trace logging for debugging and auditability

---

### 💬 Live Sticky Comment Dashboard

* Real-time moderation updates displayed inside Reddit posts
* Queue state + decision results shown via sticky comments
* Live sync using KV versioning system
* Lightweight transparency layer for moderation tracking

---

### 📦 Persistent Queue System

* KV-backed moderation queue storage
* Last-50 job tracking for dashboard visibility
* Version-controlled updates for real-time sync
* Fast read/write architecture optimized for Devvit

---

## 🏗️ System Architecture

```
Reddit Post Created
        ↓
Devvit Trigger Layer
        ↓
KV Queue Storage
        ↓
Worker Engine (Async Processor)
        ↓
AI Moderation Model (OpenAI)
        ↓
Decision Engine (Score → APPROVE / REVIEW / REMOVE)
        ↓
State Tracking + Timeline Logger
        ↓
Sticky Comment Dashboard Update
```

---

## 🧠 Moderation Logic

| Score Range | Decision | Meaning                       |
| ----------- | -------- | ----------------------------- |
| 80–100      | APPROVE  | High-quality safe content     |
| 40–79       | REVIEW   | Needs human moderation        |
| 0–39        | REMOVE   | Low-quality or unsafe content |

Each decision includes:

* AI reasoning
* Confidence score
* Moderation flags

---

## ⚙️ Core Components

### 1. Devvit Trigger Layer

* Captures `PostCreate` events
* Converts posts into moderation jobs

---

### 2. Queue System

* Stores jobs in KV (`dashboard:queue`)
* Maintains processing order
* Syncs with dashboard updates

---

### 3. Worker Engine

* Processes moderation jobs asynchronously
* Calls AI model for scoring
* Updates decision state
* Emits real-time updates

---

### 4. Sticky Comment Dashboard

* Lightweight live UI inside Reddit
* Displays:

  * Post IDs
  * Decisions
  * Scores
  * Reasoning
* Auto-refresh via version sync

---

## 📡 Live System Behavior

* ⚡ Instant moderation on post creation
* 🔄 Continuous queue updates
* 💬 Sticky comment reflects live system state
* 🧾 Full trace logs per moderation event
* 🧠 AI-driven classification with explanations

---

## 🔐 Safety Model

FlavourMod AI Engine is designed as a **human-assisted moderation system**:

* AI provides recommendations, not final authority
* All decisions are explainable and traceable
* Moderators retain full control
* System supports audit-ready logs

---

## ⚠️ Current Limitations

* Dashboard is currently implemented via **sticky comment (not full UI panel)**
* Optimized primarily for **recipe-related content flow**
* Requires OpenAI API key for scoring
* KV-based sync may introduce minor delay

---

## 🛠️ Tech Stack

* 🧩 Devvit (Reddit Platform)
* ⚡ TypeScript
* 🗄️ Redis / KV Store
* 🧠 OpenAI GPT-based scoring
* 🔁 Async Worker Architecture

---

## 📦 Setup

```bash
npm install
npm run build
npx devvit upload
npx devvit install
```

---

## 🔐 Environment Variables

| Key            | Purpose                     |
| -------------- | --------------------------- |
| OPENAI_API_KEY | AI moderation engine access |

---

## 🎯 Use Cases

* Reddit recipe community moderation
* Spam and low-quality content filtering
* AI-assisted moderator workflows
* Real-time content safety monitoring

---

## 📌 Future Improvements

* Full embedded dashboard UI (post-level panel)
* Moderator action buttons (Approve / Remove)
* Multi-subreddit scaling support
* AI feedback learning loop
* Advanced analytics dashboard

---

## 🏁 Impact Summary

FlavourMod AI Engine delivers a **real-time, scalable, explainable moderation pipeline** for Reddit, combining AI decisioning, worker-based processing, and live sticky-comment transparency to improve community safety and moderation efficiency.

---

## 👨‍💻 Author

Built for the **Reddit Devvit ecosystem**
Focused on scalable AI moderation infrastructure and real-time systems

---


