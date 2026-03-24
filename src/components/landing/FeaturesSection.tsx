import { TrendingUp, Shield, Zap, BarChart3, Bell, Brain } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "ML-Powered Predictions",
    description: "Random Forest, XGBoost, LSTM & GRU models trained on 13+ years of NSE data to forecast price movements.",
  },
  {
    icon: Shield,
    title: "Risk-Return Engine",
    description: "Integrated VaR, CAPM & ICAAP frameworks quantify downside risk alongside every trading signal.",
  },
  {
    icon: TrendingUp,
    title: "Actionable Signals",
    description: "Clear BUY, HOLD, SELL directives with conviction levels — bridging the forecasting-execution gap.",
  },
  {
    icon: BarChart3,
    title: "Real-Time Dashboard",
    description: "Live portfolio performance, Sharpe ratios, maximum drawdown tracking and sector analysis.",
  },
  {
    icon: Bell,
    title: "Instant Alerts",
    description: "Trading signals delivered via email and SMS the moment opportunities are detected.",
  },
  {
    icon: Zap,
    title: "Abnormal Risk Detection",
    description: "Captures political shocks, macroeconomic disruptions and global events invisible to standard analysis.",
  },
];

export function FeaturesSection() {
  return (
    <section className="relative py-24 px-4">
      <div className="absolute inset-0 terminal-grid opacity-30" />
      <div className="container relative max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm font-mono font-semibold tracking-widest text-primary uppercase mb-3">
            Dual-Engine Architecture
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Prediction Server{" "}
            <span className="text-muted-foreground">+</span>{" "}
            Risk Server
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            An end-to-end Alpha Generation System built on Modern Portfolio Theory
            and the Adaptive Markets Hypothesis for the Nairobi Securities Exchange.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className="group relative rounded-lg border border-border bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-lg"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
