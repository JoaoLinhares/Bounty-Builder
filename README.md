# 🏴‍☠️ Bounty Builder: OPBR Optimization Engine

**Bounty Builder** is a high-performance decision-support tool designed for **One Piece Bounty Rush (OPBR)**. It leverages Large Language Models (LLMs) to analyze character traits and medal effects, providing players with the most efficient build recommendations for competitive play.

## 🚀 The Mission

In the current OPBR meta, matching the right medals to a character's unique traits is the difference between winning and losing. This project automates this complex analysis by:

1. Extracting and categorizing complex character traits using AI.
2. Storing unstructured game data efficiently using PostgreSQL JSONB.
3. Calculating tag compatibility to suggest optimized medal sets.

## 🛠️ Tech Stack

- **Framework:** [Next.js 15+](https://nextjs.org/) (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL (via Prisma ORM)
- **AI Integration:** Google Gemini API (Analysis Pipeline)
- **Data Fetching:** TanStack Query v5
- **UI Components:** Radix UI & Tailwind CSS

## 🧠 Key Features (Roadmap)

- [ ] **Character Database:** Robust catalog with JSONB storage for trait flexibility.
- [ ] **AI-Powered Trait Analysis:** Automated categorization into playstyles (Runner, Attacker, Defender).
- [ ] **Medal Recommender:** Logic-driven engine to match medal tags based on specific character needs.
- [ ] **Custom Seed System:** Structured scripts to populate and update game data (characters and medals) manually as new content drops.

## ⚙️ Development Setup

### Prerequisites

- Node.js (Latest LTS)
- Docker (for PostgreSQL) or a local Postgres instance

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/JoaoLinhares/Bounty-Builder.git
   ```
