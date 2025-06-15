"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, TrendingUp, Shield, Heart, Leaf, AlertTriangle, CheckCircle } from "lucide-react"

interface RankingResult {
  symbol: string
  name: string
  type: "Stock" | "ETF" | "Company"
  overall_score: number
  scores: {
    morality: number
    social_impact: number
    halal_compliance: number
    esg_score: number
    ethical_business: number
  }
  details: {
    strengths: string[]
    concerns: string[]
    halal_status: "Compliant" | "Non-Compliant" | "Questionable"
    recommendation: string
  }
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
      const response = await fetch("http://localhost:8000/evaluate", {
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

  const getHalalBadgeColor = (status: string) => {
    switch (status) {
      case "Compliant":
        return "bg-green-100 text-green-800"
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
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{searchResult.overall_score}/100</div>
                    <div className="text-sm text-gray-600">Overall Score</div>
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
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Heart className="w-5 h-5 text-red-500" />
                        Morality Score
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 mb-2">
                        {getScoreIcon(searchResult.scores.morality)}
                        <span className={`text-2xl font-bold ${getScoreColor(searchResult.scores.morality)}`}>
                          {searchResult.scores.morality}/100
                        </span>
                      </div>
                      <Progress value={searchResult.scores.morality} className="h-2" />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Leaf className="w-5 h-5 text-green-500" />
                        Social Impact
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 mb-2">
                        {getScoreIcon(searchResult.scores.social_impact)}
                        <span className={`text-2xl font-bold ${getScoreColor(searchResult.scores.social_impact)}`}>
                          {searchResult.scores.social_impact}/100
                        </span>
                      </div>
                      <Progress value={searchResult.scores.social_impact} className="h-2" />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Shield className="w-5 h-5 text-blue-500" />
                        Halal Compliance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 mb-2">
                        {getScoreIcon(searchResult.scores.halal_compliance)}
                        <span className={`text-2xl font-bold ${getScoreColor(searchResult.scores.halal_compliance)}`}>
                          {searchResult.scores.halal_compliance}/100
                        </span>
                      </div>
                      <Progress value={searchResult.scores.halal_compliance} className="h-2" />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <TrendingUp className="w-5 h-5 text-purple-500" />
                        ESG Score
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 mb-2">
                        {getScoreIcon(searchResult.scores.esg_score)}
                        <span className={`text-2xl font-bold ${getScoreColor(searchResult.scores.esg_score)}`}>
                          {searchResult.scores.esg_score}/100
                        </span>
                      </div>
                      <Progress value={searchResult.scores.esg_score} className="h-2" />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <CheckCircle className="w-5 h-5 text-indigo-500" />
                        Ethical Business
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 mb-2">
                        {getScoreIcon(searchResult.scores.ethical_business)}
                        <span className={`text-2xl font-bold ${getScoreColor(searchResult.scores.ethical_business)}`}>
                          {searchResult.scores.ethical_business}/100
                        </span>
                      </div>
                      <Progress value={searchResult.scores.ethical_business} className="h-2" />
                    </CardContent>
                  </Card>
                </div>
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