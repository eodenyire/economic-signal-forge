import { useEffect, useState } from "react";

interface TickerItem {
  symbol: string;
  price: number;
  change: number;
}

const mockTicker: TickerItem[] = [
  { symbol: "SCOM", price: 38.25, change: 2.4 },
  { symbol: "EQTY", price: 52.10, change: -1.2 },
  { symbol: "KCB", price: 44.80, change: 1.8 },
  { symbol: "COOP", price: 15.45, change: 0.6 },
  { symbol: "ABSA", price: 14.20, change: -0.3 },
  { symbol: "BAT", price: 310.00, change: 3.1 },
  { symbol: "EABL", price: 165.50, change: -2.1 },
  { symbol: "BAMB", price: 32.75, change: 0.9 },
  { symbol: "KPLC", price: 2.18, change: -4.5 },
  { symbol: "KNRE", price: 2.65, change: 1.5 },
];

export function TickerBar() {
  const [items] = useState([...mockTicker, ...mockTicker]);

  return (
    <div className="w-full overflow-hidden border-y border-border bg-muted/30 py-2">
      <div className="flex animate-ticker-scroll whitespace-nowrap">
        {items.map((item, i) => (
          <div key={i} className="inline-flex items-center gap-2 px-6 font-mono text-xs">
            <span className="font-semibold text-foreground">{item.symbol}</span>
            <span className="text-muted-foreground">{item.price.toFixed(2)}</span>
            <span className={item.change >= 0 ? "text-signal-buy" : "text-signal-sell"}>
              {item.change >= 0 ? "+" : ""}{item.change.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
