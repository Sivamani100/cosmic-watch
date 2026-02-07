# 🌌 Cosmic Watch
**Interstellar Asteroid Tracker & Risk Analyser**

Cosmic Watch is a sophisticated, full-stack monitoring platform designed to provide real-time tracking, risk assessment, and 3D visualization of Near-Earth Objects (NEOs). Built for the IIT BHU Hackathon, it translates complex NASA trajectory data into intuitive, actionable insights for researchers and space enthusiasts alike.

---

## 🚀 Features

### 🛡️ Core Requirements
- **Secure Authentication**: Robust user login and registration powered by Supabase.
- **NASA NeoWs Integration**: Real-time fetching of live asteroid data from NASA's official APIs.
- **Risk Analysis Engine**: Intelligent scoring system based on hazardous status, diameter, and miss distance.
- **Automated Alerts**: Dynamic notification generator that alerts users of upcoming close approaches for watched asteroids.
- **NEO Watchlist**: Personalized tracking system for researchers to monitor specific high-risk objects.
- **Custom Alert Parameters**: Set individual proximity thresholds and research notes for every watched object.

### 🌟 Bonus Features
- **3D Interactive Visualization**: Immersive 3D scene using **React Three Fiber**.
  - **Accurate Orbital Scaling**: 1 scene unit = 1,000,000 km.
  - **Orbital Inclination**: Paths are rendered using real NASA inclination data.
  - **Risk Heatmap**: Asteroids are color-coded based on their calculated risk level.
- **Real-Time Community Chat**: Live discussion threads for every asteroid using Supabase Realtime, enabling global collaboration.

---

## 🛠️ Tech Stack
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS.
- **UI Components**: Shadcn UI, Framer Motion (Animations), Lucide React (Icons).
- **Backend/Database**: Supabase (PostgreSQL, Auth, Realtime).
- **3D Engine**: Three.js, React Three Fiber, @react-three/drei.
- **Deployment**: Docker, Nginx (Multi-stage builds).

---

## 🐳 Docker Deployment

The platform is fully containerized and easy to set up.

### Prerequisites
- Docker & Docker Compose installed.
- A `.env` file (see `.env.example`).

### Setup Instructions
1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd iitbhu-main
   ```

2. **Run with Docker Compose**:
   ```bash
   docker-compose up --build
   ```
   The application will be available at `http://localhost:80`.

---

## 🧪 Postman Documentation

A fully documented Postman Collection is included in the root directory: `postman_collection.json`.

### How to use:
1. Import `postman_collection.json` into Postman.
2. Configure the following environment variables:
   - `supabase_url`: Your Supabase project URL.
   - `supabase_anon_key`: Your Supabase anonymous key.
   - `nasa_api_key`: Your NASA API key (defaults to `DEMO_KEY`).
3. Start testing endpoints for **Authentication**, **NEO Feed**, **Watchlist**, and **User Profiles**.

---

## 📄 Compliance & Documentation
- **AI-LOG.md**: Included in the root directory. Details all AI assistance used during development.
- **Architecture**: Clear separation between the UI layer, data hooks, and service layer.
- **Sustainability**: All asteroid data is cached in Supabase to respect NASA API rate limits.

---
*Created by the Cosmic Watch Team for the IIT BHU Hackathon 2026.*
