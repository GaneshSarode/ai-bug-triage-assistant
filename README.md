# AI Bug Triage Assistant

An AI-powered system that automatically predicts GitHub issue labels and priorities.

## Features
- Predict issue label: `bug`, `feature`, `docs`
- Predict priority: `low`, `medium`, `high`
- REST API with FastAPI
- Simple rule-based + ML models

## Setup

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python app.py