import { ArrowRight, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function HeroSection() {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center px-4 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0" style={{ background: "var(--gradient-glow)" }} />
      <div className="absolute inset-0 terminal-grid opacity-20" />

      {/* Floating signal badges */}
      <div className="absolute top-1/4 left-[10%] hidden lg:block animate-glow-pulse">
        <div className="rounded-md border border-signal-buy/30 bg-signal-buy/10 px-3 py-1.5 font-mono text-xs text-signal-buy">
          BUY SCOM @ 38.25
        </div>
      </div>
      <div className="absolute top-1/3 right-[12%] hidden lg:block animate-glow-pulse" style={{ animationDelay: "1s" }}>
        <div className="rounded-md border border-signal-sell/30 bg-signal-sell/10 px-3 py-1.5 font-mono text-xs text-signal-sell">
          SELL KPLC @ 2.18
        </div>
      </div>
      <div className="absolute bottom-1/3 left-[15%] hidden lg:block animate-glow-pulse" style={{ animationDelay: "0.5s" }}>
        <div className="rounded-md border border-signal-hold/30 bg-signal-hold/10 px-3 py-1.5 font-mono text-xs text-signal-hold">
          HOLD EQTY @ 52.10
        </div>
      </div>

      <div className="container relative max-w-4xl text-center z-10">
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-mono text-primary">
          <Activity className="h-3 w-3" />
          ML-Driven Alpha Generation for NSE
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
          Trading Signals{" "}
          <br className="hidden sm:block" />
          <span className="text-gradient">Powered by AI</span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          Risk-adjusted <span className="text-signal-buy font-semibold">BUY</span>,{" "}
          <span className="text-signal-hold font-semibold">HOLD</span> &{" "}
          <span className="text-signal-sell font-semibold">SELL</span> signals
          for the Nairobi Securities Exchange — driven by Random Forest, XGBoost,
          LSTM & GRU models with VaR and CAPM risk overlays.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button variant="hero" size="lg" asChild>
            <Link to="/auth">
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="hero-outline" size="lg" asChild>
            <a href="#features">
              How It Works
            </a>
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {[
            { value: "300K+", label: "Data Points" },
            { value: "13 Yrs", label: "Historical Data" },
            { value: "4", label: "ML Models" },
            { value: "15", label: "Active Stocks" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-2xl md:text-3xl font-bold font-mono text-primary">
                {stat.value}
              </div>
              <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
