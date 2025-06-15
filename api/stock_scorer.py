import os
import json
import re
from typing import Dict, List, Optional, Tuple
import yfinance as yf
from pydantic import BaseModel, Field
from openai import OpenAI

class ScoreItem(BaseModel):
    score: int
    notes: List[str]

class ScoreSet(BaseModel):
    military: ScoreItem
    israel: ScoreItem
    environment: ScoreItem
    social: ScoreItem
    governance: ScoreItem
    sharia_compliance: ScoreItem
    ethical_business: ScoreItem

class EvaluationDetails(BaseModel):
    strengths: List[str]
    concerns: List[str]
    halal_status: str
    recommendation: str

class MarketData(BaseModel):
    current_price: Optional[float] = Field(None, alias="currentPrice")
    day_high: Optional[float] = Field(None, alias="dayHigh")
    day_low: Optional[float] = Field(None, alias="dayLow")
    market_cap: Optional[int] = Field(None, alias="marketCap")
    volume: Optional[int] = Field(None, alias="volume")
    previous_close: Optional[float] = Field(None, alias="previousClose")
    fifty_two_week_high: Optional[float] = Field(None, alias="fiftyTwoWeekHigh")
    fifty_two_week_low: Optional[float] = Field(None, alias="fiftyTwoWeekLow")

class StockEvaluation(BaseModel):
    symbol: str
    name: str
    type: str = "Company"
    overall_score: int
    scores: ScoreSet
    details: EvaluationDetails
    market_data: Optional[MarketData] = None
    market_data_error: Optional[str] = None

class StockSuggestion(BaseModel):
    symbol: str
    name: str
    reasoning: str

class StockScorer:
    def __init__(self):
        self.api_key = os.getenv("OPENROUTER_API_KEY")
        if not self.api_key:
            raise ValueError("OPENROUTER_API_KEY not found in environment variables. Please set it in your .env file.")
        
        self.client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=self.api_key,
        )

    def _get_market_data(self, symbol: str) -> Tuple[Optional[MarketData], Optional[str]]:
        try:
            ticker = yf.Ticker(symbol)
            info = ticker.info
            
            if not info or info.get('quoteType') != 'EQUITY' or 'currentPrice' not in info:
                error_msg = f"No valid equity data found for symbol '{symbol}'. It may be delisted or an incorrect ticker."
                print(error_msg)
                return None, error_msg
            
            market_data_raw = {
                'currentPrice': info.get('currentPrice', info.get('regularMarketPrice')),
                'dayHigh': info.get('dayHigh'),
                'dayLow': info.get('dayLow'),
                'marketCap': info.get('marketCap'),
                'volume': info.get('volume'),
                'previousClose': info.get('previousClose'),
                'fiftyTwoWeekHigh': info.get('fiftyTwoWeekHigh'),
                'fiftyTwoWeekLow': info.get('fiftyTwoWeekLow'),
            }
            market_data = {k: v for k, v in market_data_raw.items() if v is not None}
            return MarketData(**market_data), None
        except Exception as e:
            error_msg = f"An unexpected error occurred while fetching market data for {symbol}: {e}"
            print(error_msg)
            return None, error_msg

    def _get_llm_evaluation(self, prompt: str) -> Dict:
        try:
            completion = self.client.chat.completions.create(
                model="anthropic/claude-3.5-sonnet",
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"},
            )
            response_content = completion.choices[0].message.content
            # Strip markdown ```json ... ```
            match = re.search(r'```json\s*([\s\S]*?)\s*```', response_content)
            if match:
                clean_json = match.group(1)
            else:
                clean_json = response_content
            
            return json.loads(clean_json)
        except Exception as e:
            print(f"Error getting evaluation from LLM: {e}")
            # Return a default structure on failure to prevent crashes
            return {}

    def evaluate_stock(self, company_name: str) -> StockEvaluation:
        prompt = f"""
        You are an ethical investment analyst. Your task is to evaluate a company based on its public information and provide a structured JSON response.
        The company to evaluate is: **{company_name}**.
        
        Please return a single JSON object with the following structure:
        {{
            "symbol": "string (The stock's ticker symbol)",
            "name": "string (The full company name)",
            "type": "Company",
            "overall_score": "integer (0-100, based on all factors)",
            "scores": {{
                "military": {{ "score": "integer (0-100)", "notes": ["string (1-2 brief notes explaining the score)", "..."] }},
                "israel": {{ "score": "integer (0-100)", "notes": ["string (1-2 brief notes explaining the score)", "..."] }},
                "environment": {{ "score": "integer (0-100)", "notes": ["string (1-2 brief notes explaining the score)", "..."] }},
                "social": {{ "score": "integer (0-100)", "notes": ["string (1-2 brief notes explaining the score)", "..."] }},
                "governance": {{ "score": "integer (0-100)", "notes": ["string (1-2 brief notes explaining the score)", "..."] }},
                "sharia_compliance": {{ "score": "integer (0-100)", "notes": ["string (1-2 brief notes explaining the score)", "..."] }},
                "ethical_business": {{ "score": "integer (0-100)", "notes": ["string (1-2 brief notes explaining the score)", "..."] }}
            }},
            "details": {{
                "strengths": ["string", "..."],
                "concerns": ["string", "..."],
                "halal_status": "string ('Permissible', 'Questionable', or 'Not Permissible')",
                "recommendation": "string (A brief summary of the investment thesis)"
            }}
        }}
        For each item in "scores", provide 1-2 brief bullet points in the "notes" field explaining the reasoning for the numerical score.
        """
        
        evaluation_data = self._get_llm_evaluation(prompt)
        if not evaluation_data:
             raise ValueError("Failed to get a valid response from the AI model.")

        evaluation = StockEvaluation(**evaluation_data)

        if evaluation.symbol:
            market_data, error = self._get_market_data(evaluation.symbol)
            evaluation.market_data = market_data
            evaluation.market_data_error = error
        
        return evaluation

    def suggest_basket(self, risk_tolerance: str, investment_horizon: str, ethical_priorities: List[str], number_of_stocks: int) -> List[StockEvaluation]:
        # This function now returns full evaluations, not just suggestions
        prompt = f"""
        Act as an expert portfolio manager. A user has provided their investment preferences.
        Based on their answers below, suggest a basket of stocks.

        **User Preferences:**
        - **Risk Tolerance:** {risk_tolerance}
        - **Investment Horizon:** {investment_horizon} years
        - **Key Ethical Priorities:** {', '.join(ethical_priorities) if ethical_priorities else 'None specified, use a balanced approach.'}

        **Your Task:**
        1.  Analyze the user's preferences.
        2.  Suggest a diversified basket of {number_of_stocks} stocks that aligns with their goals.
        3.  For each stock, provide a brief reasoning for its inclusion.

        Return your response as a JSON array of objects, where each object has the following exact structure:
        [
            {{
                "symbol": "string (The stock's ticker symbol)",
                "name": "string (The full company name)",
                "reasoning": "string (A brief explanation for why this stock was chosen)"
            }}
        ]
        """
        
        suggestions_data = self._get_llm_evaluation(prompt)
        if not suggestions_data:
            return []

        # Now, evaluate each suggestion to get the full data
        evaluated_stocks = []
        for suggestion in suggestions_data:
            try:
                # We have the name, now we can run the full evaluation
                company_name = suggestion.get("name")
                if company_name:
                    evaluation = self.evaluate_stock(company_name=company_name)
                    evaluated_stocks.append(evaluation)
            except Exception as e:
                print(f"Could not evaluate {suggestion.get('name')}: {e}")
                continue
        
        return evaluated_stocks[:number_of_stocks]


# Example usage
if __name__ == "__main__":
    scorer = StockScorer()
    # Example evaluation for a single company name
    evaluation = scorer.evaluate_stock(company_name="Microsoft")
    print("\n--- Single Stock Evaluation ---")
    # Pydantic automatically serializes the model to a dict for printing
    print(json.dumps(evaluation.dict(), indent=2))

    # Example basket suggestion
    basket = scorer.suggest_basket(
        risk_tolerance="medium",
        investment_horizon="5-10",
        ethical_priorities=["environment", "halal"],
        number_of_stocks=4
    )
    print("\n--- Suggested Stock Basket ---")
    print(json.dumps([s.dict() for s in basket], indent=2)) 