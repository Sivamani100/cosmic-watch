# AI Usage Log (AI-LOG.md)

This document details the balance between manual development and AI assistance in the creation of **Cosmic Watch**.

## 🚀 Development Philosophy
The development of Cosmic Watch was led manually, with the team possessing full competency in all codebases (React, TypeScript, SQL, 3D Graphics). AI was utilized strictly as an **acceleration tool** to meet the tight **time constraints** of the hackathon, focusing on boilerplate generation and rapid prototyping while the core architecture and logic remained under manual control.

## 🤖 Work Distribution & Concepts

| Area | Manual Effort & Concepts | AI Contribution (Speedup) |
|--------------|-----------------|-----------------|
| **Authentication & Security** | Implemented **JWT** session handling, **Password Complexity** logic, and visual strength feedback. | Assisted in implementing regex patterns for validation checks. |
| **Real-time Collaboration** | Designed **Supabase Realtime** architecture and **PostgreSQL** triggers. **RLS (Row Level Security)** design. | Generated boilerplate for hook-based subscriptions. |
| **Database Architecture** | Manually designed schema for `community_messages`, `profiles`, and `watched_asteroids`. | Rapid generation of migration SQL files. |
| **3D Engineering** | Scene orchestration, **Lighting (Rim/Point)**, and **Orbit Math**. Optimized geometry for performance. | Assisted with boilerplate for React Three Fiber components. |
| **State Management** | Implemented **React Query** for server state and custom hooks for business logic. | Suggested initial structures for mutation hooks. |

## 🛠️ Key Technical Concepts Leveraged
- **Security**: JWT (JSON Web Tokens), Row Level Security (RLS), Password Hashing (Supabase managed), SSL/HTTPS compliance.
- **Frontend**: Glassmorphism CSS, Framer Motion (Animations), React Three Fiber (WebGL).
- **Backend/Database**: PostgreSQL, Real-time WebSockets, Relational Schema Design.
- **API**: NASA NeoWs Integration, REST protocols.

## ⚖️ Origin & Integrity
- **Manual Control**: Every line of code was reviewed, debugged, and integrated manually to ensure it meets our architectural standards.
- **Expertise-Driven**: AI was used to save time, not to replace understanding. The team maintains full ownership of all logic and implementation details.
- **Problem Statement Alignment**: All features were custom-built to specifically address the NASA/IIT-BHU hackathon tracks.

---
*Developed with a blend of manual expertise and AI acceleration for the IIT BHU Hackathon.*
