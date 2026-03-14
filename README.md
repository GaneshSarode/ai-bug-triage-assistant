# AI Bug Triage Assistant 🤖

An AI-powered full-stack system that automatically predicts GitHub issue labels and priorities. Built with **FastAPI** (backend) and **React + Tailwind CSS** (frontend).

---

## ✨ Features

### Frontend (React)
- 🎨 **Beautiful Dashboard** — Overview with stats cards and recent predictions
- 🔍 **Prediction Form** — Enter issue title & body, get instant AI predictions
- 📋 **History Table** — Browse all past predictions with filtering, sorting, pagination
- 📊 **Statistics Dashboard** — Pie chart (label distribution) + bar chart (priority distribution)
- 🌙 **Dark Mode** — Toggle light/dark theme
- 📱 **Responsive Design** — Works on mobile, tablet, and desktop
- 💬 **Feedback** — Mark predictions as correct/incorrect

### Backend (FastAPI)
- `GET  /health`         — Health check
- `POST /predict`        — Predict label & priority for a single issue
- `POST /batch-predict`  — Predict for multiple issues at once
- `GET  /history`        — Get prediction history
- `GET  /stats`          — Label/priority distribution statistics
- `POST /feedback`       — Submit feedback on a prediction
- CORS enabled for frontend integration

---

## 🗂 Project Structure

```
ai-bug-triage-assistant/
├── backend/
│   ├── app.py           # FastAPI app with all endpoints
│   ├── predict.py       # Prediction logic (rule-based + ML-ready)
│   ├── train.py         # ML model training script
│   ├── requirements.txt # Python dependencies
│   └── data/
│       └── training_data.csv
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx      # Navigation + dark mode toggle
│   │   │   ├── Dashboard.jsx   # Main overview page
│   │   │   ├── PredictForm.jsx # Issue prediction form
│   │   │   ├── History.jsx     # Prediction history table
│   │   │   └── Stats.jsx       # Charts & analytics
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
└── README.md
```

---

## 🚀 Quick Start

### 1. Backend

```bash
cd backend

# Create virtual environment
python -m venv .venv
source .venv/bin/activate   # Mac/Linux
# OR: .venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Start API server
python app.py
```

API runs at: `http://localhost:8000`  
Interactive docs: `http://localhost:8000/docs`

### 2. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs at: `http://localhost:5173`

> **Note:** Set `VITE_API_URL=http://localhost:8000` in a `.env` file if your backend runs on a different URL.

---

## 🧪 API Examples

**Predict a single issue:**
```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"title": "Login page crashes", "body": "Error 500 on submit"}'
```

**Get statistics:**
```bash
curl http://localhost:8000/stats
```

**Get history:**
```bash
curl http://localhost:8000/history?limit=20
```

---

## 🛠 Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | React 19, Vite, Tailwind CSS 3    |
| Routing   | React Router v7                   |
| Charts    | Recharts                          |
| Icons     | React Icons                       |
| Backend   | FastAPI, Python 3.10+             |
| ML        | scikit-learn, TF-IDF + Naive Bayes|

---

## 📊 Prediction Labels

| Label   | Example                              |
|---------|--------------------------------------|
| bug     | "App crashes with error 500"         |
| feature | "Add dark mode toggle"               |
| docs    | "Update authentication documentation"|

| Priority | Trigger Keywords                    |
|----------|--------------------------------------|
| high     | urgent, critical, asap               |
| medium   | important                            |
| low      | (default)                            |
