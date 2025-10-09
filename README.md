# Lead Intent Scoring Backend (I have used Gemini API):

Backend service that accepts product/offer details and a CSV of leads, then scores each lead’s buying intent (**High / Medium / Low**) using **rule-based logic + AI reasoning (Gemini)**.

---

## 🌍 Live Deployment

- **Backend API Base URL**: [https://lead-intent-scoring-backend.onrender.com](https://lead-intent-scoring-backend.onrender.com)  
- **Frontend (Sample UI)**: [https://lead-intent-scoring-frontend.vercel.app/](https://lead-intent-scoring-frontend.vercel.app/)  

> The frontend is provided as a **sample UI** for testing the project visually. Core assignment requirement is backend.

**Repository for Frontend**: https://github.com/PRM710/lead-intent-scoring-frontend

---

## 📌 Objective

- Build clean and well-documented backend APIs  
- Integrate AI models (Gemini, OpenAI, or choice)  
- Use product/offer context + prospect data for lead qualification  
- Deliver a working, testable backend in a short timeframe  

---

## ⚙️ Setup Instructions (Local)

### 1. Clone Repository
```bash
git clone <your-repo-url>
cd backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Make .env file in root of project
Edit `.env` and set:
```
PORT=3000
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-1.5-flash
FRONTEND_ORIGIN=https://lead-intent-scoring-frontend.vercel.app
```

> ⚠️ If `GEMINI_API_KEY` is not set, the backend falls back to heuristic-only scoring.  
> ⚠️ `PORT` is optional for deployment; Render auto-assigns a port.

### 4. Run Server
```bash
npm start
```

Server runs at:  
👉 `http://localhost:3000`

### 5. Sample CSV

A sample CSV file (`leads.sample.csv`) is included in the project root for quick testing.

Example:

```csv
name,role,company,industry,location,linkedin_bio
Ava Patel,Head of Growth,FlowMetrics,Software,Singapore,"Growth leader at FlowMetrics, scaling GTM for B2B SaaS"
Ravi Kumar,Marketing Manager,FinSolve,Finance,India,"Marketing lead focusing on fintech products"
John Doe,Software Engineer,DevCorp,Software,USA,"Fullstack engineer building developer tools"
```

To test quickly:
```bash
curl -X POST https://lead-intent-scoring-backend.onrender.com/leads/upload   -F "file=@leads.sample.csv"
```

---

## 🚀 API Usage

### 1. Save Offer
```bash
curl -X POST https://lead-intent-scoring-backend.onrender.com/offer   -H "Content-Type: application/json"   -d '{
    "name": "AI Outreach Automation",
    "value_props": ["24/7 outreach","6x more meetings"],
    "ideal_use_cases": ["B2B SaaS mid-market"]
  }'
```

### 2. Upload Leads (CSV)
Upload your own leads file or use the provided `leads.sample.csv`:
```bash
curl -X POST https://lead-intent-scoring-backend.onrender.com/leads/upload   -F "file=@leads.sample.csv"
```

### 3. Run Scoring
```bash
curl -X POST https://lead-intent-scoring-backend.onrender.com/score
```

### 4. Get Results
```bash
curl https://lead-intent-scoring-backend.onrender.com/score/results
```

Example response:
```json
[
  {
    "name": "Ava Patel",
    "role": "Head of Growth",
    "company": "FlowMetrics",
    "intent": "High",
    "score": 90,
    "reasoning": "Fits ICP SaaS mid-market and role is decision maker."
  },
  {
    "name": "Ravi Kumar",
    "role": "Marketing Manager",
    "company": "FinSolve",
    "intent": "Medium",
    "score": 60,
    "reasoning": "Relevant to fintech; role is influencer."
  }
]
```

### 5. Export Results as CSV (Bonus)
```bash
curl https://lead-intent-scoring-backend.onrender.com/score/results/export -o scored_leads.csv
```
---
---

## 🧪 Tests (Bonus)
Unit tests for rule layer:
```bash
npm test
```

---

## 🐳 Docker

### Local Run
Build and run with Docker:
```bash
docker build -t lead-scorer-backend .
docker run -p 3000:3000 --env-file .env lead-scorer-backend
```

### Deployment with Docker on Render (Optional)
If deploying on Render using Docker:
- Render automatically detects the Dockerfile.
- It builds the image and runs `CMD ["node", "index.js"]`.
- The service listens on `process.env.PORT` (Render injects this automatically).
- No manual port configuration is needed.

---

## 🔗 Connecting With Frontend (Optional)

The frontend is deployed separately at (This is mine you have to deploy it ureself on platforms like verce, netlify, etc..):  
👉 [https://lead-intent-scoring-frontend.vercel.app/](https://lead-intent-scoring-frontend.vercel.app/)  

If you want to connect your own frontend (React/Vite) to this backend:

1. In **backend `.env`**:
```
FRONTEND_ORIGIN=https://lead-intent-scoring-frontend.vercel.app
```

2. In **frontend `.env`**:
```
VITE_API_BASE_URL=https://your-deployed-frontend-link
```

3. In backend (`index.js`), CORS is already configured to allow both local (`http://localhost:5173`) and deployed frontend. But to allow for your frontend you must add your deployed frontend link

4. When running locally:
   - Backend → `http://localhost:3000`
   - Frontend → `http://localhost:5173`

5. When deployed (Will look something like this):
   - Backend → `https://lead-intent-scoring-backend.onrender.com`
   - Frontend → `https://lead-intent-scoring-frontend.vercel.app`

---

## ✅ Deliverables Checklist
- Clean, structured backend code  
- Environment-based config (`.env`)  
- Rule + AI scoring pipeline implemented  
- CSV upload & parsing  
- JSON + CSV results output  
- README with setup, usage, rule logic, Docker, and prompt explanation  
- Deployed backend accessible via public URL  
- (Optional) Connected frontend for demo purposes  

---
