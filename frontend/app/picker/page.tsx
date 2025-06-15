"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { BarChart, Leaf, Shield, Globe, Scale, PiggyBank, Briefcase, TrendingUp } from "lucide-react"

interface ScoreSet {
  military_score: number;
  israel_score: number;
  environment_score: number;
  social_score: number;
  governance_score: number;
  sharia_compliance_score: number;
  ethical_business: number;
}

interface EvaluationDetails {
  strengths: string[];
  concerns: string[];
  halal_status: string;
  recommendation: string;
}

interface MarketData {
  current_price: number | null;
  day_high: number | null;
  day_low: number | null;
  market_cap: number | null;
  volume: number | null;
  previous_close: number | null;
  fifty_two_week_high: number | null;
  fifty_two_week_low: number | null;
}

interface RankingResult {
  symbol: string;
  name: string;
  type: string;
  overall_score: number;
  scores: ScoreSet;
  details: EvaluationDetails;
  market_data: MarketData | null;
}

type SurveyState = {
  risk_tolerance: string
  investment_horizon: string
  ethical_priorities: string[]
  number_of_stocks: number
}

function MarketDataDisplay({ data }: { data: MarketData | null }) {
  if (!data) return <p className="text-sm text-gray-500 mt-2">Market data not available.</p>;

  const formatCurrency = (value: number | null) => 
    value?.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) ?? 'N/A';
  
  const formatNumber = (value: number | null) =>
    value?.toLocaleString('en-US') ?? 'N/A';

  const marketStats = [
    { label: "Price", value: formatCurrency(data.current_price) },
    { label: "Market Cap", value: formatNumber(data.market_cap) },
    { label: "Volume", value: formatNumber(data.volume) },
  ];

  return (
    <div className="mt-4 grid grid-cols-3 gap-2 text-center">
      {marketStats.map((stat, index) => (
        <div key={index} className="bg-gray-50 p-2 rounded-md">
          <p className="text-xs text-gray-600">{stat.label}</p>
          <p className="font-semibold text-gray-900 text-sm">{stat.value}</p>
        </div>
      ))}
    </div>
  )
}

export default function StockPickerPage() {
  const [survey, setSurvey] = useState<SurveyState>({
    risk_tolerance: "medium",
    investment_horizon: "5-10",
    ethical_priorities: [],
    number_of_stocks: 5,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<RankingResult[]>([])
  const [error, setError] = useState<string | null>(null)

  const handlePriorityChange = (priority: string) => {
    setSurvey((prev) => {
      const newPriorities = prev.ethical_priorities.includes(priority)
        ? prev.ethical_priorities.filter((p) => p !== priority)
        : [...prev.ethical_priorities, priority]
      return { ...prev, ethical_priorities: newPriorities }
    })
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    setSuggestions([])
    setError(null)
    
    try {
      const response = await fetch("/api/suggest-basket", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(survey),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }
      
      const result: RankingResult[] = await response.json();
      setSuggestions(result);

    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown network error occurred.");
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Find Your Perfect Stock Basket</CardTitle>
            <CardDescription>
              Answer a few questions to get a personalized list of stock suggestions aligned with your values and goals.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Risk Tolerance */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold">1. What is your investment risk tolerance?</Label>
              <div className="flex gap-4">
                {["low", "medium", "high"].map((level) => (
                  <Button
                    key={level}
                    variant={survey.risk_tolerance === level ? "default" : "outline"}
                    onClick={() => setSurvey({ ...survey, risk_tolerance: level })}
                    className="capitalize"
                  >
                    {level}
                  </Button>
                ))}
              </div>
            </div>

            {/* Investment Horizon */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold">2. What is your investment horizon?</Label>
               <div className="flex gap-4">
                {["1-3", "3-5", "5-10", "10+"].map((level) => (
                  <Button
                    key={level}
                    variant={survey.investment_horizon === level ? "default" : "outline"}
                    onClick={() => setSurvey({ ...survey, investment_horizon: level })}
                  >
                    {level} years
                  </Button>
                ))}
              </div>
            </div>

            {/* Ethical Priorities */}
            <div className="space-y-4">
                <Label className="text-lg font-semibold">3. Which ethical areas are most important to you?</Label>
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                        <Checkbox id="env" checked={survey.ethical_priorities.includes("environment")} onCheckedChange={() => handlePriorityChange("environment")} />
                        <Label htmlFor="env" className="flex items-center gap-2"><Leaf className="w-4 h-4 text-green-500"/>Environmental Impact</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="social" checked={survey.ethical_priorities.includes("social")} onCheckedChange={() => handlePriorityChange("social")} />
                        <Label htmlFor="social" className="flex items-center gap-2"><Globe className="w-4 h-4 text-blue-500"/>Social Responsibility</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="halal" checked={survey.ethical_priorities.includes("halal")} onCheckedChange={() => handlePriorityChange("halal")} />
                        <Label htmlFor="halal" className="flex items-center gap-2"><Shield className="w-4 h-4 text-indigo-500"/>Strict Halal Compliance</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="governance" checked={survey.ethical_priorities.includes("governance")} onCheckedChange={() => handlePriorityChange("governance")} />
                        <Label htmlFor="governance" className="flex items-center gap-2"><Scale className="w-4 h-4 text-gray-500"/>Good Corporate Governance</Label>
                    </div>
                </div>
            </div>

            {/* Number of Stocks */}
            <div className="space-y-4">
                <Label htmlFor="num_stocks" className="text-lg font-semibold">4. How many stocks would you like in your basket?</Label>
                <div className="flex items-center gap-4">
                    <Slider
                        id="num_stocks"
                        min={3} max={15} step={1}
                        value={[survey.number_of_stocks]}
                        onValueChange={(value: number[]) => setSurvey({ ...survey, number_of_stocks: value[0] })}
                    />
                    <span className="font-bold text-lg w-12 text-center">{survey.number_of_stocks}</span>
                </div>
            </div>

            <Button onClick={handleSubmit} disabled={isLoading} size="lg" className="w-full">
              {isLoading ? "Generating Suggestions..." : "Get My Stock Suggestions"}
            </Button>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
             <Card className="max-w-3xl mx-auto mt-8 bg-red-50 border-red-200">
                <CardContent className="text-center py-8">
                <h3 className="text-lg font-semibold mb-2 text-red-800">Could Not Generate Suggestions</h3>
                <p className="text-red-700">{error}</p>
                </CardContent>
            </Card>
        )}

        {/* Results Section */}
        {suggestions.length > 0 && (
            <Card className="max-w-3xl mx-auto mt-8">
                <CardHeader>
                    <CardTitle>Your Personalized Stock Basket</CardTitle>
                    <CardDescription>Based on your survey answers, here are some stocks you might consider.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {suggestions.map(stock => (
                        <div key={stock.symbol} className="p-4 border rounded-lg">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-bold text-lg">{stock.name} ({stock.symbol})</h3>
                                <p className="text-sm text-gray-600">{stock.details.recommendation}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-gray-500">Overall Score</p>
                                <p className="text-2xl font-bold">{stock.overall_score}</p>
                              </div>
                            </div>
                            <MarketDataDisplay data={stock.market_data} />
                        </div>
                    ))}
                </CardContent>
            </Card>
        )}
      </div>
    </div>
  )
} 