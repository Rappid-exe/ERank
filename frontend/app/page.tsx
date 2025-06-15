"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, TrendingUp, Shield, Heart, Leaf, AlertTriangle, CheckCircle, BarChart, Globe, Scale, PiggyBank, Briefcase } from "lucide-react"

interface ScoreItem {
  score: number;
  notes: string[];
}

interface ScoreSet {
  military: ScoreItem;
  israel: ScoreItem;
  environment: ScoreItem;
  social: ScoreItem;
  governance: ScoreItem;
  sharia_compliance: ScoreItem;
  ethical_business: ScoreItem;
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
  market_data_error: string | null;
}

const getScoreColor = (score: number) => {
  if (score >= 80) return "text-green-600"
  if (score >= 60) return "text-yellow-600"
  return "text-red-600"
}

const getScoreIcon = (score: number) => {
  if (score >= 80) return <CheckCircle className="w-4 h-4 text-green-600" />
  if (score >= 60) return <AlertTriangle className="w-4 h-4 text-yellow-600" />
  return <AlertTriangle className="w-4 h-4 text-red-600" />
}

export default function FinancialRankingPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResult, setSearchResult] = useState<RankingResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsLoading(true)
    setSearchResult(null)
    setError(null)
    
    try {
      const response = await fetch("/api/evaluate", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ company_name: searchQuery }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }
      
      const result: RankingResult = await response.json();

      if (result.symbol === "ERROR") {
        setError(result.details.concerns[0] || "An unknown error occurred during analysis.");
        setSearchResult(null);
      } else {
        setSearchResult(result);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown network error occurred.");
      setSearchResult(null);
    } finally {
      setIsLoading(false)
    }
  }

  const getHalalBadgeColor = (status: string) => {
    switch (status) {
      case "Permissible":
      case "Compliant":
        return "bg-green-100 text-green-800"
      case "Not Permissible":
      case "Non-Compliant":
        return "bg-red-100 text-red-800"
      case "Questionable":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Ethical Financial Instrument Ranking</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Evaluate stocks, ETFs, and companies based on morality, social impact, and halal compliance. Make informed
            investment decisions aligned with your values.
          </p>

          {/* Search Section */}
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Search Financial Instrument
              </CardTitle>
              <CardDescription>
                Enter a stock symbol, ETF ticker, or company name to get detailed ethical rankings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., Apple, TSLA, Microsoft"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="flex-1"
                />
                <Button onClick={handleSearch} disabled={isLoading}>
                  {isLoading ? "Analyzing..." : "Analyze"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Error Display */}
        {error && (
            <Card className="max-w-2xl mx-auto bg-red-50 border-red-200">
                <CardContent className="text-center py-8">
                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-red-800">Analysis Failed</h3>
                <p className="text-red-700">
                    {error}
                </p>
                </CardContent>
            </Card>
        )}

        {/* Results Section */}
        {searchResult && (
          <div className="max-w-6xl mx-auto">
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">
                      {searchResult.name} ({searchResult.symbol})
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">{searchResult.type}</Badge>
                      <Badge className={getHalalBadgeColor(searchResult.details.halal_status)}>
                        {searchResult.details.halal_status}
                      </Badge>
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-6">
                    {searchResult.market_data?.current_price && (
                       <div className="text-center">
                          <div className="text-3xl font-bold text-gray-800">
                            {searchResult.market_data.current_price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                          </div>
                          <div className="text-sm text-gray-600">Current Price</div>
                        </div>
                    )}
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">{searchResult.overall_score}/100</div>
                      <div className="text-sm text-gray-600">Overall Score</div>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Tabs defaultValue="scores" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="scores">Detailed Scores</TabsTrigger>
                <TabsTrigger value="analysis">Analysis</TabsTrigger>
                <TabsTrigger value="recommendation">Recommendation</TabsTrigger>
              </TabsList>

              <TabsContent value="scores" className="space-y-6">
                <ScoreCardGrid scores={searchResult.scores} />
                <MarketDataDisplay data={searchResult.market_data} error={searchResult.market_data_error} />
              </TabsContent>

              <TabsContent value="analysis" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-green-600">Strengths</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {searchResult.details.strengths.map((strength, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-red-600">Areas of Concern</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {searchResult.details.concerns.map((concern, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{concern}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="recommendation">
                <Card>
                  <CardHeader>
                    <CardTitle>Investment Recommendation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-gray-800">{searchResult.details.recommendation}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <strong>Halal Status:</strong>
                        <Badge className={getHalalBadgeColor(searchResult.details.halal_status)}>
                          {searchResult.details.halal_status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {searchQuery && !searchResult && !isLoading && !error && (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="text-center py-8">
              <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Results Found</h3>
              <p className="text-gray-600">
                We couldn't find information for "{searchQuery}". Please try a different symbol or company name.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Features Section */}
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-500" />
                Halal Compliance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Comprehensive analysis of Islamic finance principles including riba, gharar, and haram business
                activities.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                Ethical Standards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Evaluation of corporate governance, labor practices, and social responsibility initiatives.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="w-5 h-5 text-green-500" />
                Environmental Impact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Assessment of environmental sustainability, carbon footprint, and green business practices.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function ScoreCardGrid({ scores }: { scores: ScoreSet }) {
  const scoreItems = [
    { title: "Military", data: scores.military, Icon: Shield },
    { title: "Israel/Geopolitics", data: scores.israel, Icon: Globe },
    { title: "Environment", data: scores.environment, Icon: Leaf },
    { title: "Social", data: scores.social, Icon: Heart },
    { title: "Governance", data: scores.governance, Icon: Scale },
    { title: "Business Ethics", data: scores.ethical_business, Icon: Briefcase },
    { title: "Sharia Compliance", data: scores.sharia_compliance, Icon: PiggyBank },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
      {scoreItems.map(({ title, data, Icon }) => (
        <Card key={title}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-gray-600">
              <Icon className="w-4 h-4" /> {title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-2xl font-bold ${getScoreColor(data.score)}`}>
                {data.score}/100
              </span>
            </div>
            <Progress value={data.score} className="h-2" />
            <ul className="mt-4 space-y-2 text-sm text-gray-600">
              {data.notes.map((note, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="mt-1.5 flex-shrink-0 h-1.5 w-1.5 rounded-full bg-gray-400"></span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function MarketDataDisplay({ data, error }: { data: MarketData | null, error: string | null }) {
  if (error) {
    return (
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" /> Market Data
        </h3>
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-lg text-center">
          <p className="font-semibold">Could not load market data.</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    )
  }
  
  if (!data) return null;

  const formatCurrency = (value: number | null) => 
    value?.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) ?? 'N/A';
  
  const formatNumber = (value: number | null) =>
    value?.toLocaleString('en-US') ?? 'N/A';

  const marketStats = [
    { label: "Current Price", value: formatCurrency(data.current_price) },
    { label: "Day High", value: formatCurrency(data.day_high) },
    { label: "Day Low", value: formatCurrency(data.day_low) },
    { label: "Market Cap", value: formatNumber(data.market_cap) },
    { label: "Volume", value: formatNumber(data.volume) },
    { label: "Previous Close", value: formatCurrency(data.previous_close) },
    { label: "52-Week High", value: formatCurrency(data.fifty_two_week_high) },
    { label: "52-Week Low", value: formatCurrency(data.fifty_two_week_low) },
  ];

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <TrendingUp className="w-5 h-5" /> Market Data
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        {marketStats.map((stat, index) => (
          <div key={index} className="bg-gray-50 p-3 rounded-lg">
            <p className="text-gray-600">{stat.label}</p>
            <p className="font-semibold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
} 