from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, List
from dotenv import load_dotenv
from .stock_scorer import StockScorer, StockEvaluation
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

app = FastAPI(title="Islamic Stock Morality Scorer")

# Allow requests from your frontend (assuming it runs on localhost:3000)
origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    # Add your Vercel deployment URL here later
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

scorer = StockScorer()

class StockNameRequest(BaseModel):
    company_name: str

class SurveyRequest(BaseModel):
    risk_tolerance: str
    investment_horizon: str
    ethical_priorities: List[str]
    number_of_stocks: int

@app.post("/evaluate", response_model=StockEvaluation)
async def evaluate_stock(request: StockNameRequest):
    try:
        evaluation = scorer.evaluate_stock(
            company_name=request.company_name,
        )
        return evaluation
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/suggest-basket")
async def suggest_basket(request: SurveyRequest):
    try:
        suggestions = scorer.suggest_basket(
            risk_tolerance=request.risk_tolerance,
            investment_horizon=request.investment_horizon,
            ethical_priorities=request.ethical_priorities,
            number_of_stocks=request.number_of_stocks
        )
        return suggestions
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    return {"message": "Welcome to the Islamic Stock Morality Scorer API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 