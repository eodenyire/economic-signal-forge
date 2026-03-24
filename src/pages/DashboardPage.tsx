import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container max-w-6xl mx-auto px-4 py-12">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Trading Dashboard</h1>
          <p className="text-muted-foreground">
            Coming in Phase 2 — real-time signals, portfolio metrics, and risk analysis.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            {[
              { label: "BUY Signals", value: "—", color: "text-signal-buy" },
              { label: "HOLD Signals", value: "—", color: "text-signal-hold" },
              { label: "SELL Signals", value: "—", color: "text-signal-sell" },
            ].map((card) => (
              <div key={card.label} className="rounded-lg border border-border bg-card p-6">
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <p className={`text-3xl font-bold font-mono mt-2 ${card.color}`}>{card.value}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
