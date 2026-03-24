import { Activity } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border py-12 px-4">
      <div className="container max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <span className="font-semibold text-sm">
              NSE<span className="text-primary">Alpha</span>
            </span>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            ML-driven risk-return model for price predictions in Nairobi Securities Exchange.
            Research by Emmanuel Christopher Odenyire — Co-operative University of Kenya.
          </p>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} NSEAlpha
          </p>
        </div>
      </div>
    </footer>
  );
}
