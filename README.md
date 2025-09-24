# Lead Intent Scoring Backend (Gemini AI)

Backend service that accepts product/offer details and a CSV of leads, then scores each lead’s buying intent (**High / Medium / Low**) using **rule-based logic + AI reasoning (Gemini)**.

---

## 🌍 Live Deployment

- **Backend API Base URL**: [https://lead-intent-scoring-backend.onrender.com](https://lead-intent-scoring-backend.onrender.com)  
- **Frontend (Sample UI)**: [https://lead-intent-scoring-frontend.vercel.app/](https://lead-intent-scoring-frontend.vercel.app/)  

> The frontend is provided as a **sample UI** for testing the project visually. Core assignment requirement is backend.

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
Copy `.env.example` → `.env`:
```bash
cp .env.example .env
```

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

## 🧮 Scoring Logic

### Rule Layer (max 50 points)
- **Role relevance**  
  - Decision maker (CEO, VP, Head, Director…) → +20  
  - Influencer (Manager, Lead, Analyst…) → +10  
  - Others → 0  

- **Industry match**  
  - Exact ICP match → +20  
  - Adjacent / related → +10  
  - Else → 0  

- **Data completeness**  
  - All fields present (`name, role, company, industry, location, linkedin_bio`) → +10  

**→ Max Rule Score = 50**

### AI Layer (max 50 points)
- Sends **offer + lead details** to Gemini AI  
- Prompt:

```
Product / Offer:
Name: <offer name>
Value props: <value_props>
Ideal use cases / ICP: <ideal_use_cases>

Prospect:
Name: <name>
Role: <role>
Company: <company>
Industry: <industry>
Location: <location>
LinkedIn bio: <linkedin_bio>

Task:
Classify this prospect's buying intent for the product as exactly one of: High, Medium, Low.
Then provide a 1–2 sentence explanation tying back to role, industry, and fit.
Respond in the exact format:
Intent: <High|Medium|Low>
Explanation: <one or two sentences>
```

- AI Response → Mapped to score:  
  - High = +50  
  - Medium = +30  
  - Low = +10  

### Final Score
```
final_score = rule_score (0–50) + ai_points (10/30/50)
clamped to max 100
```

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

The frontend is deployed separately at:  
👉 [https://lead-intent-scoring-frontend.vercel.app/](https://lead-intent-scoring-frontend.vercel.app/)  

If you want to connect your own frontend (React/Vite) to this backend:

1. In **backend `.env`**:
```
FRONTEND_ORIGIN=https://lead-intent-scoring-frontend.vercel.app
```

2. In **frontend `.env`**:
```
VITE_API_BASE_URL=https://lead-intent-scoring-backend.onrender.com
```

3. In backend (`index.js`), CORS is already configured to allow both local (`http://localhost:5173`) and deployed frontend.

4. When running locally:
   - Backend → `http://localhost:3000`
   - Frontend → `http://localhost:5173`

5. When deployed:
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

## 📊 Example Use Case
Sales/marketing teams can upload a list of prospects and instantly see **who is most likely to buy** based on:  
- Offer’s target ICP  
- Prospect’s role/industry  
- Gemini’s AI classification & reasoning  

---
