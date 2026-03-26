import { useState } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { SignalsTable } from "@/components/dashboard/SignalsTable";
import { StockChart } from "@/components/dashboard/StockChart";
import { RiskMetricsPanel } from "@/components/dashboard/RiskMetricsPanel";
import { PortfolioChart } from "@/components/dashboard/PortfolioChart";
import { MacroEventsPanel } from "@/components/dashboard/MacroEventsPanel";
import { SentimentPanel } from "@/components/dashboard/SentimentPanel";
import { TickerBar } from "@/components/landing/TickerBar";
import { useDashboardData } from "@/hooks/useDashboardData";
import { Activity, Clock, Loader2, AlertCircle } from "lucide-react";

export default function DashboardPage() {
  const [selectedSymbol, setSelectedSymbol] = useState("SCOM");
  const { signals, macroEvents, sentiment, portfolioPerformance, riskMetrics, priceHistory, isLoading, error } = useDashboardData();

  const selectedStock = signals.find((s) => s.symbol === selectedSymbol) || signals[0];

  const buyCount = signals.filter((s) => s.signal === "BUY").length;
  const holdCount = signals.filter((s) => s.signal === "HOLD").length;
  const sellCount = signals.filter((s) => s.signal === "SELL").length;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            <p className="text-sm text-muted-foreground">Loading dashboard data…</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <AlertCircle className="h-8 w-8 text-destructive mx-auto" />
            <p className="text-sm text-muted-foreground">Failed to load data. Please sign in or try again.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedStock) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">No active trading signals found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <TickerBar />

      <main className="flex-1 px-4 py-6">
        <div className="max-w-[1400px] mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Trading Dashboard
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                ML-powered signals across {signals.length} NSE stocks · Live data
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
              <Clock className="h-3.5 w-3.5" />
              Last updated: {new Date().toLocaleString()}
            </div>
          </div>

          {/* Signal summary cards */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "BUY", count: buyCount, color: "text-signal-buy", border: "border-signal-buy/20" },
              { label: "HOLD", count: holdCount, color: "text-signal-hold", border: "border-signal-hold/20" },
              { label: "SELL", count: sellCount, color: "text-signal-sell", border: "border-signal-sell/20" },
            ].map((card) => (
              <div key={card.label} className={`rounded-lg border ${card.border} bg-card p-4 text-center`}>
                <p className={`text-3xl font-bold font-mono ${card.color}`}>{card.count}</p>
                <p className="text-xs text-muted-foreground mt-1">{card.label} Signals</p>
              </div>
            ))}
          </div>

          {/* Main content grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left column */}
            <div className="lg:col-span-2 space-y-6">
              <SignalsTable
                signals={signals}
                selectedSymbol={selectedSymbol}
                onSelect={setSelectedSymbol}
              />
              <StockChart data={priceHistory} symbol={selectedSymbol} />
              {portfolioPerformance.length > 1 && (
                <PortfolioChart data={portfolioPerformance} />
              )}
            </div>

            {/* Right sidebar */}
            <div className="space-y-6">
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-bold font-mono text-lg">{selectedStock.symbol}</p>
                    <p className="text-xs text-muted-foreground">{selectedStock.name}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded text-xs font-bold font-mono ${
                    selectedStock.signal === "BUY" ? "text-signal-buy bg-signal-buy/10 border border-signal-buy/30" :
                    selectedStock.signal === "SELL" ? "text-signal-sell bg-signal-sell/10 border border-signal-sell/30" :
                    "text-signal-hold bg-signal-hold/10 border border-signal-hold/30"
                  }`}>
                    {selectedStock.signal}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-muted/30 rounded p-2">
                    <span className="text-muted-foreground">Price</span>
                    <p className="font-mono font-semibold mt-0.5">KES {selectedStock.price.toFixed(2)}</p>
                  </div>
                  <div className="bg-muted/30 rounded p-2">
                    <span className="text-muted-foreground">Change</span>
                    <p className={`font-mono font-semibold mt-0.5 ${selectedStock.change >= 0 ? "text-signal-buy" : "text-signal-sell"}`}>
                      {selectedStock.change >= 0 ? "+" : ""}{selectedStock.change}%
                    </p>
                  </div>
                  <div className="bg-muted/30 rounded p-2">
                    <span className="text-muted-foreground">Volume</span>
                    <p className="font-mono font-semibold mt-0.5">{(selectedStock.volume / 1e6).toFixed(1)}M</p>
                  </div>
                  <div className="bg-muted/30 rounded p-2">
                    <span className="text-muted-foreground">Confidence</span>
                    <p className="font-mono font-semibold mt-0.5">{selectedStock.confidence}%</p>
                  </div>
                  <div className="bg-muted/30 rounded p-2">
                    <span className="text-muted-foreground">RSI</span>
                    <p className={`font-mono font-semibold mt-0.5 ${selectedStock.rsi > 70 ? "text-signal-sell" : selectedStock.rsi < 30 ? "text-signal-buy" : ""}`}>
                      {selectedStock.rsi}
                    </p>
                  </div>
                  <div className="bg-muted/30 rounded p-2">
                    <span className="text-muted-foreground">MACD</span>
                    <p className={`font-mono font-semibold mt-0.5 ${selectedStock.macd >= 0 ? "text-signal-buy" : "text-signal-sell"}`}>
                      {selectedStock.macd >= 0 ? "+" : ""}{selectedStock.macd.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {sentiment.length > 0 && <SentimentPanel data={sentiment} />}
              {macroEvents.length > 0 && <MacroEventsPanel events={macroEvents} />}
            </div>
          </div>

          {/* Risk metrics full width */}
          <RiskMetricsPanel metrics={riskMetrics} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
