# MatchWise

**LLM-powered job matching platform.** MatchWise analyzes résumés against job descriptions using context-aware language models to produce a compatibility score, matched/missing/transferable skills, and a plain-language explanation — replacing keyword-only ATS scoring with semantic, skill-aware matching.

Repository: https://github.com/Adharsh-Rengarajan/matchwise

## Stack

- **Frontend:** React + TypeScript, Vite
- **Backend:** FastAPI (async), MongoDB (Motor), JWT auth
- **AI:** HuggingFace Inference Providers + OpenRouter, with a rule-based fallback
- **Infra:** Docker, GitHub Actions, Render (API), Vercel (web), MongoDB Atlas

## Features

- **Job seekers:** search/filter jobs, preview their AI match score and skill gaps, apply with a résumé and screening answers, track status, and message recruiters.
- **Recruiters:** post jobs with screening questions, view an AI-ranked candidate shortlist, inspect skill-gap analysis, add notes, and reach out to candidates.

Match scores are computed once at application time and stored on each application, so recruiters rank candidates instantly without new LLM calls. If all providers fail, a rule-based adapter keeps matching working.

## Getting Started

**Backend**
```bash
cd backend
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000          # docs at /docs
```

**Frontend**
```bash
cd frontend
npm install
npm run dev                                         # http://localhost:5173
```

## Environment Variables

**Backend (`backend/.env`)**
```env
MONGO_DB_URI=mongodb+srv://user:pass@cluster.mongodb.net
DATABASE_NAME=matchwise
JWT_SECRET_KEY=replace-with-a-long-random-string
CORS_ORIGINS=http://localhost:5173,https://your-app.vercel.app
ENVIRONMENT=development
HF_KEY_1=hf_xxx          # optional HuggingFace token(s): HF_KEY_1..3
OR_KEY_1=sk-or-xxx       # optional OpenRouter key(s): OR_KEY_1..3
# HUGGINGFACE_MODEL / OPENROUTER_MODEL optional overrides
```

**Frontend (`frontend/.env`)**
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_API_TIMEOUT=30000
```

> HuggingFace tokens only need the "Make calls to Inference Providers" permission. Vite inlines `VITE_` vars at build time — set `VITE_API_BASE_URL` on Vercel and redeploy. Never commit secrets.

## Testing

```bash
cd backend && pytest --cov     # pytest + pytest-cov, ~85% coverage
```

## Deployment

Backend is Dockerized and deploys to Render; frontend builds with Vite and deploys to Vercel; database is MongoDB Atlas. GitHub Actions runs tests and triggers auto-deploy on push to `main`.

