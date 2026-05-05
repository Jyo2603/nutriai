# NutriAI — AI-Powered Diet & Nutrition Planner

A modern web app that generates personalized meal plans, recipes, and shopping lists using AI, tailored to each user's goals, dietary preferences, allergies, and budget.

Live AI features powered by **OpenAI** + **LangChain**, with **Firebase** for authentication and user profile storage.

---

## ✨ Features

- **Secure authentication** — email/password signup & login (Firebase Auth)
- **Multi-step onboarding** — captures dietary restrictions, allergies, health goals, activity level, preferred cuisines, and budget
- **AI meal recommendations** — personalized meals grouped by cuisine with full macros (calories, protein, carbs, fat)
- **Recipe modal** — step-by-step cooking instructions on demand
- **AI nutrition coach** — chat with an AI dietitian for personalized advice
- **Smart shopping assistant** — generates optimized grocery lists based on goals, budget, and preferences
- **User profile** — view BMI, weight-to-goal delta, edit personal info, delete account
- **Modern UI** — slate + emerald palette, Lucide icons, fully responsive

---

## 🛠 Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, TypeScript, Vite |
| Styling | Tailwind CSS, Lucide Icons |
| Routing | React Router v7 |
| State | Zustand |
| Auth & DB | Firebase Auth + Firestore |
| AI | OpenAI API, LangChain |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- A **Firebase** project ([create one](https://console.firebase.google.com/))
- An **OpenAI API key** ([get one](https://platform.openai.com/api-keys))

### 1. Clone & install

```bash
git clone https://github.com/Jyo2603/nutriai.git
cd nutriai
npm install
```

### 2. Configure environment variables

Copy the example file and fill in your own keys:

```bash
cp .env.example .env
```

Then edit `.env`:

```env
# Firebase
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# OpenAI
VITE_OPENAI_API_KEY=sk-...
```

> **Firebase setup:** Enable **Email/Password** sign-in under *Authentication → Sign-in method*, and create a **Firestore Database** in test mode.

### 3. Run the dev server

```bash
npm run dev
```

The app will be available at **http://localhost:5173**.

---

## 📜 Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server with HMR |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint across the codebase |

---

## 📁 Project Structure

```
src/
├── components/         # Reusable UI components (modals, auth wrappers)
│   ├── auth/           # AuthProvider, ProtectedRoute
│   ├── NutritionCoachModal.tsx
│   ├── RecipeModal.tsx
│   └── ShoppingAssistantModal.tsx
├── hooks/              # Custom React hooks
│   └── useAIRecommendations.ts
├── pages/              # Route-level pages
│   ├── LandingPage.tsx
│   ├── auth/           # Login, Signup, Profile
│   ├── dashboard/      # Main dashboard
│   └── onboarding/     # Multi-step onboarding wizard
├── services/           # External integrations
│   ├── aiService.ts        # OpenAI meal recommendations
│   ├── authService.ts      # Firebase Auth wrapper
│   ├── firebase.ts         # Firebase init
│   └── langchainService.ts # LangChain pipelines
├── stores/             # Zustand stores
│   └── authStore.ts
├── types/              # Shared TypeScript types
└── App.tsx             # Root + routes
```

---

## 🔒 Security Notes

- **Never commit `.env`** — it's gitignored. Only `.env.example` is tracked.
- All AI requests go through the user's own OpenAI key (configured client-side via Vite env vars).
- For production, route OpenAI calls through a backend proxy to keep the API key server-side.

---

## 🗺 Roadmap

- [ ] Backend proxy for OpenAI requests (security)
- [ ] Meal plan history & favorites
- [ ] Weekly progress tracking with charts
- [ ] Export shopping lists to PDF / share via WhatsApp
- [ ] Mobile app (React Native)

---

## 📄 License

Private — all rights reserved.
