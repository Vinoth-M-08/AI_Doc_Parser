# DocReady — Frontend (UI)

The React + Vite single-page application for **DocReady**, a document analysis & migration readiness tool. This UI talks to the Spring Boot backend at `http://localhost:8080` and renders an interactive dashboard with metrics, AI insights, and migration verdicts.

> See the [root README](../README.md) for the full project overview, architecture, and backend setup.

---

## 🛠 Tech Stack

| Library | Purpose |
|---|---|
| **React 18** | UI framework |
| **Vite 5** | Dev server + bundler (HMR) |
| **React Router 6** | Client-side routing (`/` upload, `/dashboard` results) |
| **TailwindCSS 3** | Utility-first styling |
| **Axios** | HTTP client |
| **Recharts** | Readability bar chart |
| **lucide-react** | Icon set |
| **react-hot-toast** | Toast notifications (success / Gemini-fallback alerts) |

---

## 📦 Prerequisites

- **Node.js** ≥ 20.18 and **npm** ≥ 10
- The backend running on `http://localhost:8080` (see [`../backend`](../backend))

> If you're on Node < 20.19, this project pins **Vite 5** + **`@vitejs/plugin-react@4`** to stay compatible.

---

## 🚀 Quick Start

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**.

The Vite dev server proxies `/api/*` to the backend, so no CORS or env vars are needed for local development.

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server with HMR (port 5173) |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Locally preview the production build |
| `npm run lint` | Run ESLint over `src/` |

---

## 🌐 Backend URL

By default the app calls `http://localhost:8080`. Override via env var:

```bash
# .env.local
VITE_API_BASE_URL=https://your-backend.example.com
```

---

## 🗂 Project Structure

```
frontend/
├── public/
│   ├── favicon.svg              # DocReady brand icon
│   └── icons.svg
├── src/
│   ├── api/
│   │   └── analysisApi.js       # axios calls: analyze(), getSettings()
│   ├── components/
│   │   ├── Navbar.jsx           # top bar + Settings menu
│   │   ├── SettingsMenu.jsx     # AI toggle + model picker
│   │   ├── FileDropzone.jsx     # drag-drop upload
│   │   ├── LoadingScreen.jsx    # progress UI
│   │   ├── VerdictBanner.jsx    # READY / NOT_READY hero
│   │   ├── MetricsGrid.jsx      # words / pages / headings cards
│   │   ├── ReadinessGauge.jsx   # 0-100 score gauge
│   │   ├── ReadabilityChart.jsx # clarity vs structure bars
│   │   ├── StructureTree.jsx    # heading hierarchy view
│   │   ├── SuggestionsList.jsx  # AI strengths / issues / suggestions
│   │   ├── RawJsonViewer.jsx    # collapsible JSON
│   │   └── ExportButton.jsx     # download analysis as JSON
│   ├── context/
│   │   ├── AnalysisContext.jsx  # current analysis state
│   │   └── SettingsContext.jsx  # AI toggle, model, server settings
│   ├── pages/
│   │   ├── UploadPage.jsx       # `/`
│   │   └── DashboardPage.jsx    # `/dashboard`
│   ├── App.jsx                  # routes + global Toaster
│   ├── main.jsx                 # providers + render
│   └── index.css                # Tailwind layers + theme tokens
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js               # /api proxy → :8080
├── index.html
└── package.json
```

---

## ✨ Key UI Features

### 1. Upload Page (`/`)
- Drag-and-drop or browse-to-select for `.docx` / `.pdf` (max 20 MB)
- Status pill shows whether **AI** or **Heuristic** mode is active
- Live upload progress

### 2. Settings Menu (navbar)
- **Use Gemini AI** toggle — disabled with clear status if `GEMINI_API_KEY` isn't set on the server
- **Model picker** — populated from `GET /api/settings`. Choose any configured Gemini model (default: `gemini-2.5-flash-lite`)
- Both choices are persisted to `localStorage` (`docready.useAi`, `docready.model`)

### 3. Dashboard (`/dashboard`)
- **Verdict banner** — color-coded readiness verdict + one-line summary
- **Metrics grid** — pages, words, paragraphs, headings, images, tables, links, lists
- **Readiness gauge + readability chart** — visualize the AI's clarity & structural-quality scores
- **Structure tree** — heading hierarchy with orphan/long-paragraph flags
- **AI Insights panel** — visually distinct between **Gemini AI** (purple gradient + sparkles) and **Heuristic** (plain + cpu icon), with the AI's quoted summary
- **Raw JSON viewer** — collapsible full response
- **Export** — download analysis as `<filename>.analysis.json`

### 4. Toast Notifications
- ✅ **Success** — *"Analyzed with gemini-2.5-flash-lite"*
- ❌ **Error** — *"Model X failed — using heuristic"* with the exact backend reason (e.g. `HTTP 429`, `404`, network)

---

## 🎨 Design Tokens

Colors are defined in `tailwind.config.js`:

| Token | Use |
|---|---|
| `ink-50 … ink-900` | Neutral greys (light → dark) |
| `accent` / `accent-dark` | Brand accent (Gemini purple) |
| `success` / `warning` / `danger` | Semantic states |

Fonts: **Inter** (body), **Space Grotesk** (display), **JetBrains Mono** (monospace).

---

## 🔌 Backend API Used

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/health` | Backend liveness check |
| `GET` | `/api/settings` | Discover Gemini config + available models |
| `POST` | `/api/analyze?useAi=…&model=…` | Multipart upload + analysis |

See the [root README](../README.md#-rest-api) for full request/response schemas.

---

## 🐛 Troubleshooting

| Symptom | Fix |
|---|---|
| `ERR_EMPTY_RESPONSE` from Vite proxy | Reload the page once after the backend finishes starting |
| Settings toggle is greyed out | `GEMINI_API_KEY` not set on the backend — see root README |
| Toast: *"Model X failed — using heuristic"* | Quota / unsupported model. Switch to `gemini-2.5-flash-lite` in Settings |
| Vite refuses to start with *"requires Node 20.19+"* | `npm i -D vite@5 @vitejs/plugin-react@4` (already pinned) or upgrade Node |
| Stale HMR after file rename | Hard-refresh the browser (Ctrl+Shift+R) |

---

## 📜 License

For evaluation / take-home assignment purposes.
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
