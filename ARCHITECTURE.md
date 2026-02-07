# Cosmic Watch Architecture Overview

This project follows a "Clean Architecture" inspired structure to ensure scalability, maintainability, and clear separation of concerns.

## 🏗️ Layered Architecture

### 1. UI Layer (Frontend)
- **`src/pages/`**: High-level page components and route definitions.
- **`src/components/`**:
  - **`layout/`**: Structural components (Navbar, Footer, Sidebar).
  - **`features/`**: Complex components that include specific business logic (e.g., `AstroAI`, `LandingScene`).
  - **`common/`**: Reusable atomic UI elements (Buttons, Inputs, Cards).
  - **`3d/`**: Three.js / React Three Fiber specific visualization components.

### 2. Logic Layer (Bridge)
- **`src/hooks/`**: Custom React hooks that orchestrate data fetching, local state management, and business rules. Hooks act as the interface between the UI and the Data Layer.
  - Example: `useAsteroids.ts`, `useNotifications.ts`.

### 3. Data Layer (Backend & APIs)
- **`src/services/`**: Integration with external APIs (NASA NeoWs, DONKI, APOD).
- **`src/integrations/`**: Cloud infrastructure bindings (Supabase Client, external library configurations).
- **`supabase/migrations/`**: Database schema, RLS policies, and server-side functions.

### 4. Core Layer (Shared)
- **`src/lib/`**: Generic utilities, constants, and shared configuration.
- **`src/types/`**: TypeScript interfaces and types used across all layers.

## 🔄 Data Flow
1. **Trigger**: User interacts with a Page or Component.
2. **Logic**: The Component calls a Hook.
3. **Data**: The Hook calls a Service or Integration to fetch/mutate data.
4. **State**: The Hook returns the result (Loading/Error/Data) back to the Component for rendering.

## 🛡️ Best Practices
- **No Logic in UI**: Components should only handle rendering and interaction events.
- **Strict Typing**: All data structures must be defined in `src/types`.
- **Atomic Components**: Keep UI components small and focused.
- **Environment Driven**: API keys and secrets must stay in `.env` or highly localized constants.
