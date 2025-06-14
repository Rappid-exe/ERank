from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict
from .stock_scorer import StockScorer
from fastapi.middleware.cors import CORSMiddleware

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

@app.post("/evaluate")
async def evaluate_stock(request: StockNameRequest):
    try:
        evaluation = scorer.evaluate_stock(
            company_name=request.company_name,
        )
        return evaluation
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    return {"message": "Welcome to the Islamic Stock Morality Scorer API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 