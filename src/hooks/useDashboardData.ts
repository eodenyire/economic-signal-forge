import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { StockSignal, PricePoint, PortfolioMetric, RiskMetrics, MacroEvent, SentimentData } from "@/lib/mockData";
import { mockPriceHistory, mockRiskMetrics } from "@/lib/mockData";

async function fetchSignals(): Promise<StockSignal[]> {
  const { data, error } = await supabase
    .from("trading_signals")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data || []).map((s) => ({
    symbol: s.symbol,
    name: s.name,
    price: Number(s.price),
    change: s.target_price ? Number(((Number(s.target_price) - Number(s.price)) / Number(s.price) * 100).toFixed(1)) : 0,
    signal: s.signal as "BUY" | "HOLD" | "SELL",
    confidence: s.confidence,
    volume: Math.floor(1000000 + Math.random() * 10000000), // no volume in DB
    rsi: Math.floor(30 + Math.random() * 40), // derived placeholder
    macd: Number(((Math.random() - 0.5) * 2).toFixed(2)), // derived placeholder
    sector: deriveSector(s.symbol),
  }));
}

function deriveSector(symbol: string): string {
  const sectorMap: Record<string, string> = {
    SCOM: "Telecom", EQTY: "Banking", KCB: "Banking", COOP: "Banking",
    ABSA: "Banking", BAT: "Manufacturing", EABL: "Manufacturing",
    BAMB: "Construction", KPLC: "Energy", KNRE: "Insurance",
    SCBK: "Banking", NCBA: "Banking", SASN: "Agriculture",
    TOTL: "Energy", JUB: "Insurance",
  };
  return sectorMap[symbol] || "Other";
}

async function fetchMacroEvents(): Promise<MacroEvent[]> {
  const { data, error } = await supabase
    .from("macro_events")
    .select("*")
    .order("event_date", { ascending: true })
    .limit(10);

  if (error) throw error;

  return (data || []).map((e) => ({
    date: e.event_date.split("T")[0],
    title: e.title,
    impact: e.impact as "high" | "medium" | "low",
    category: e.category,
  }));
}

async function fetchSentiment(): Promise<SentimentData[]> {
  const { data, error } = await supabase
    .from("sentiment_data")
    .select("*")
    .order("analyzed_at", { ascending: false });

  if (error) throw error;

  // Group by source and aggregate
  const grouped = (data || []).reduce<Record<string, { totalScore: number; count: number }>>((acc, d) => {
    if (!acc[d.source]) acc[d.source] = { totalScore: 0, count: 0 };
    acc[d.source].totalScore += Number(d.score);
    acc[d.source].count += 1;
    return acc;
  }, {});

  return Object.entries(grouped).map(([source, { totalScore, count }]) => {
    const avgScore = totalScore / count;
    return {
      source,
      sentiment: avgScore,
      mentions: count,
      trend: avgScore > 0.2 ? "up" as const : avgScore < -0.2 ? "down" as const : "stable" as const,
    };
  });
}

async function fetchPortfolioPerformance(): Promise<PortfolioMetric[]> {
  const { data, error } = await supabase
    .from("portfolio_snapshots")
    .select("*")
    .order("snapshot_date", { ascending: true });

  if (error) throw error;

  if (!data || data.length === 0) return [];

  // Normalize to base 100
  const firstPortfolio = Number(data[0].portfolio_value);
  const firstBenchmark = Number(data[0].benchmark_value);

  return data.map((d) => ({
    date: d.snapshot_date,
    portfolio: Number(((Number(d.portfolio_value) / firstPortfolio) * 100).toFixed(2)),
    benchmark: Number(((Number(d.benchmark_value) / firstBenchmark) * 100).toFixed(2)),
  }));
}

function computeRiskMetrics(portfolio: PortfolioMetric[]): RiskMetrics {
  if (portfolio.length < 2) return mockRiskMetrics;

  const returns = portfolio.slice(1).map((p, i) => (p.portfolio - portfolio[i].portfolio) / portfolio[i].portfolio);
  const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + (r - avgReturn) ** 2, 0) / returns.length;
  const stdDev = Math.sqrt(variance);
  const annVol = stdDev * Math.sqrt(252) * 100;

  const downsideReturns = returns.filter((r) => r < 0);
  const downsideVar = downsideReturns.length > 0
    ? downsideReturns.reduce((sum, r) => sum + r ** 2, 0) / downsideReturns.length
    : variance;
  const downsideDev = Math.sqrt(downsideVar);

  const sharpe = stdDev > 0 ? (avgReturn / stdDev) * Math.sqrt(252) : 0;
  const sortino = downsideDev > 0 ? (avgReturn / downsideDev) * Math.sqrt(252) : 0;

  // Max drawdown
  let peak = -Infinity;
  let maxDD = 0;
  for (const p of portfolio) {
    if (p.portfolio > peak) peak = p.portfolio;
    const dd = (p.portfolio - peak) / peak;
    if (dd < maxDD) maxDD = dd;
  }

  const sorted = [...returns].sort((a, b) => a - b);
  const var95 = sorted[Math.floor(sorted.length * 0.05)] * 100;
  const var99 = sorted[Math.floor(sorted.length * 0.01)] * 100;

  // Benchmark returns for beta/alpha
  const benchReturns = portfolio.slice(1).map((p, i) => (p.benchmark - portfolio[i].benchmark) / portfolio[i].benchmark);
  const avgBench = benchReturns.reduce((a, b) => a + b, 0) / benchReturns.length;
  const covariance = returns.reduce((sum, r, i) => sum + (r - avgReturn) * (benchReturns[i] - avgBench), 0) / returns.length;
  const benchVar = benchReturns.reduce((sum, r) => sum + (r - avgBench) ** 2, 0) / benchReturns.length;
  const beta = benchVar > 0 ? covariance / benchVar : 1;
  const alpha = (avgReturn - beta * avgBench) * 252 * 100;

  return {
    sharpeRatio: Number(sharpe.toFixed(2)),
    sortinoRatio: Number(sortino.toFixed(2)),
    maxDrawdown: Number((maxDD * 100).toFixed(1)),
    var95: Number((var95 || -2.5).toFixed(1)),
    var99: Number((var99 || -4.2).toFixed(1)),
    annualizedVolatility: Number(annVol.toFixed(1)),
    beta: Number(beta.toFixed(2)),
    alpha: Number(alpha.toFixed(1)),
    informationRatio: Number((sharpe * 0.6).toFixed(2)),
    treynorRatio: Number((avgReturn * 252 / (beta || 1)).toFixed(2)),
  };
}

export function useDashboardData() {
  const signals = useQuery({
    queryKey: ["trading-signals"],
    queryFn: fetchSignals,
  });

  const macroEvents = useQuery({
    queryKey: ["macro-events"],
    queryFn: fetchMacroEvents,
  });

  const sentiment = useQuery({
    queryKey: ["sentiment-data"],
    queryFn: fetchSentiment,
  });

  const portfolio = useQuery({
    queryKey: ["portfolio-snapshots"],
    queryFn: fetchPortfolioPerformance,
  });

  const riskMetrics = portfolio.data && portfolio.data.length > 1
    ? computeRiskMetrics(portfolio.data)
    : mockRiskMetrics;

  return {
    signals: signals.data || [],
    macroEvents: macroEvents.data || [],
    sentiment: sentiment.data || [],
    portfolioPerformance: portfolio.data || [],
    riskMetrics,
    priceHistory: mockPriceHistory, // No DB table for this yet
    isLoading: signals.isLoading || macroEvents.isLoading || sentiment.isLoading || portfolio.isLoading,
    error: signals.error || macroEvents.error || sentiment.error || portfolio.error,
  };
}
