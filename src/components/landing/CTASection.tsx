import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function CTASection() {
  return (
    <section className="relative py-24 px-4">
      <div className="absolute inset-0" style={{ background: "var(--gradient-glow)" }} />
      <div className="container relative max-w-3xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
          Start Receiving Trading Signals
        </h2>
        <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
          Join investors using machine learning to navigate the Nairobi Securities Exchange
          with risk-managed, actionable intelligence.
        </p>
        <Button variant="hero" size="lg" asChild>
          <Link to="/auth">
            Create Your Account
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
