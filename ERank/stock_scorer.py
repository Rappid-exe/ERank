import os
from typing import Dict, Optional, List
import json
import requests
from pydantic import BaseModel

class ScoreSet(BaseModel):
    morality: int
    social_impact: int
    halal_compliance: int
    esg_score: int
    ethical_business: int

class EvaluationDetails(BaseModel):
    strengths: List[str]
    concerns: List[str]
    halal_status: str
    recommendation: str

class StockEvaluation(BaseModel):
    symbol: str
    name: str
    type: str = "Company"
    overall_score: int
    scores: ScoreSet
    details: EvaluationDetails

class StockScorer:
    def __init__(self):
        self.api_key = os.getenv("OPENROUTER_API_KEY", "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")
        self.api_url = "https://openrouter.ai/api/v1/chat/completions"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:8000",
            "X-Title": "Islamic Stock Scorer"
        }
        
    def _get_llm_evaluation(self, prompt: str) -> dict:
        """Get evaluation from LLM"""
        payload = {
            "model": "deepseek/deepseek-chat",
            "messages": [
                {"role": "system", "content": "You are an expert in Islamic finance and ethical investment analysis. You must respond with a valid JSON object matching the requested structure precisely."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.3,
            "response_format": {"type": "json_object"}
        }
        
        try:
            print("\nSending request to OpenRouter API...")
            response = requests.post(self.api_url, headers=self.headers, json=payload)
            response.raise_for_status()
            result = response.json()
            
            print(f"Raw API Response Body: {json.dumps(result, indent=2)}")
            content = result['choices'][0]['message']['content']
            
            # --- Robust JSON Parsing ---
            print(f"Raw Content from LLM: {content}")
            
            if isinstance(content, str):
                # Clean the content string
                content = content.strip()
                if content.startswith('```json'):
                    content = content[7:]
                if content.endswith('```'):
                    content = content[:-3]
                content = content.strip()

                try:
                    return json.loads(content)
                except json.JSONDecodeError as e:
                    print(f"\nFailed to parse cleaned JSON: {str(e)}")
                    print(f"Cleaned content was: {content}")
                    return self._get_default_response() # Fallback to default
            
            # If content is already a dict (which it should be with response_format)
            return content
                
        except Exception as e:
            print(f"\nError calling OpenRouter API: {str(e)}")
            if hasattr(e, 'response'):
                print(f"Response status code: {e.response.status_code}")
                print(f"Response content: {e.response.text}")
            return self._get_default_response()

    def _get_default_response(self) -> dict:
        """Get a default error response"""
        return {
            "symbol": "ERROR",
            "name": "Error during analysis",
            "type": "Company",
            "overall_score": 0,
            "scores": {
                "morality": 0, "social_impact": 0, "halal_compliance": 0,
                "esg_score": 0, "ethical_business": 0
            },
            "details": {
                "strengths": [],
                "concerns": ["Failed to get a valid response from the AI model."],
                "halal_status": "Questionable",
                "recommendation": "Could not generate a recommendation due to an error."
            }
        }

    def evaluate_stock(self, company_name: str) -> StockEvaluation:
        """
        Evaluate a stock and return a comprehensive ethical and financial analysis.
        """
        prompt = f"""
        Analyze the company "{company_name}". I need a detailed ethical and financial ranking.
        Research the company and return a JSON object with the following exact structure:
        {{
            "symbol": "string (the company's stock ticker, e.g., AAPL)",
            "name": "string (the full company name, e.g., Apple Inc.)",
            "type": "string (either 'Stock', 'ETF', or 'Company')",
            "overall_score": "integer (a score from 0 to 100)",
            "scores": {{
                "morality": "integer (0-100)",
                "social_impact": "integer (0-100)",
                "halal_compliance": "integer (0-100, based on Islamic finance principles)",
                "esg_score": "integer (0-100, based on Environmental, Social, and Governance criteria)",
                "ethical_business": "integer (0-100, based on business practices and governance)"
            }},
            "details": {{
                "strengths": "array of strings (3-5 key positive points)",
                "concerns": "array of strings (3-5 key negative points or risks)",
                "halal_status": "string ('Compliant', 'Non-Compliant', or 'Questionable')",
                "recommendation": "string (a brief, concluding investment recommendation)"
            }}
        }}

        - For "halal_compliance", strictly evaluate based on factors like interest-based income, and involvement in prohibited sectors (alcohol, gambling, non-halal food).
        - For "morality", consider factors like connections to military/defense, or involvement in oppressive regimes.
        - Ensure all scores are integers between 0 and 100.
        - If you cannot find a stock symbol, use a suitable placeholder.
        """
        
        evaluation_data = self._get_llm_evaluation(prompt)

        # In case of API failure, the default response is already a dict.
        # We just need to parse it into our Pydantic model for validation.
        return StockEvaluation(**evaluation_data)


# Example usage
if __name__ == "__main__":
    scorer = StockScorer()
    # Example evaluation for a single company name
    evaluation = scorer.evaluate_stock(company_name="Microsoft")
    
    # Pydantic automatically serializes the model to a dict for printing
    print(json.dumps(evaluation.dict(), indent=2)) 