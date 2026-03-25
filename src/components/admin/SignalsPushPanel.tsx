import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Plus, Zap, Trash2 } from "lucide-react";

const NSE_STOCKS = [
  { symbol: "SCOM", name: "Safaricom PLC" },
  { symbol: "EQTY", name: "Equity Group" },
  { symbol: "KCB", name: "KCB Group" },
  { symbol: "COOP", name: "Co-op Bank" },
  { symbol: "ABSA", name: "ABSA Bank Kenya" },
  { symbol: "BAT", name: "BAT Kenya" },
  { symbol: "EABL", name: "EABL" },
  { symbol: "BAMB", name: "Bamburi Cement" },
  { symbol: "KPLC", name: "Kenya Power" },
  { symbol: "KNRE", name: "Kenya Re" },
  { symbol: "SCBK", name: "Standard Chartered" },
  { symbol: "NCBA", name: "NCBA Group" },
  { symbol: "SASN", name: "Sasini PLC" },
  { symbol: "TOTL", name: "Total Energies" },
  { symbol: "JUB", name: "Jubilee Holdings" },
];

interface TradingSignal {
  id: string;
  symbol: string;
  name: string;
  signal: string;
  confidence: number;
  price: number;
  target_price: number | null;
  stop_loss: number | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
}

export function SignalsPushPanel() {
  const { user } = useAuth();
  const [signals, setSignals] = useState<TradingSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    symbol: "SCOM",
    signal: "BUY" as "BUY" | "HOLD" | "SELL",
    confidence: 75,
    price: 0,
    target_price: "",
    stop_loss: "",
    notes: "",
  });

  const fetchSignals = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("trading_signals")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    setSignals(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchSignals(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const stock = NSE_STOCKS.find((s) => s.symbol === form.symbol)!;
    const { error } = await supabase.from("trading_signals").insert({
      symbol: form.symbol,
      name: stock.name,
      signal: form.signal,
      confidence: form.confidence,
      price: form.price,
      target_price: form.target_price ? Number(form.target_price) : null,
      stop_loss: form.stop_loss ? Number(form.stop_loss) : null,
      notes: form.notes || null,
      created_by: user?.id,
    });

    if (error) {
      toast({ title: "Error pushing signal", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `${form.signal} signal pushed for ${form.symbol}` });
      setOpen(false);
      setForm({ symbol: "SCOM", signal: "BUY", confidence: 75, price: 0, target_price: "", stop_loss: "", notes: "" });
      fetchSignals();
    }
  };

  const deactivateSignal = async (id: string) => {
    await supabase.from("trading_signals").update({ is_active: false }).eq("id", id);
    toast({ title: "Signal deactivated" });
    fetchSignals();
  };

  const signalColor = (s: string) =>
    s === "BUY" ? "text-signal-buy bg-signal-buy/10 border-signal-buy/30" :
    s === "SELL" ? "text-signal-sell bg-signal-sell/10 border-signal-sell/30" :
    "text-signal-hold bg-signal-hold/10 border-signal-hold/30";

  return (
    <Card className="border-border">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          Trading Signals
        </CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="text-xs">
              <Plus className="h-3.5 w-3.5 mr-1" /> Push Signal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Push New Trading Signal</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Stock</Label>
                  <Select value={form.symbol} onValueChange={(v) => setForm({ ...form, symbol: v })}>
                    <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {NSE_STOCKS.map((s) => (
                        <SelectItem key={s.symbol} value={s.symbol}>{s.symbol} — {s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Signal</Label>
                  <Select value={form.signal} onValueChange={(v) => setForm({ ...form, signal: v as any })}>
                    <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BUY">BUY</SelectItem>
                      <SelectItem value="HOLD">HOLD</SelectItem>
                      <SelectItem value="SELL">SELL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Price (KES)</Label>
                  <Input type="number" step="0.01" className="h-9 text-xs" value={form.price || ""} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} required />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Target</Label>
                  <Input type="number" step="0.01" className="h-9 text-xs" value={form.target_price} onChange={(e) => setForm({ ...form, target_price: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Stop Loss</Label>
                  <Input type="number" step="0.01" className="h-9 text-xs" value={form.stop_loss} onChange={(e) => setForm({ ...form, stop_loss: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Confidence (%)</Label>
                <Input type="number" min={0} max={100} className="h-9 text-xs" value={form.confidence} onChange={(e) => setForm({ ...form, confidence: Number(e.target.value) })} required />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Notes</Label>
                <Input className="h-9 text-xs" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Optional analysis notes…" />
              </div>
              <Button type="submit" className="w-full">Push Signal</Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground py-8 text-center">Loading signals…</p>
        ) : signals.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">No signals pushed yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Stock</TableHead>
                <TableHead>Signal</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>Target / SL</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {signals.map((s) => (
                <TableRow key={s.id} className={!s.is_active ? "opacity-40" : ""}>
                  <TableCell>
                    <p className="font-mono font-bold text-xs">{s.symbol}</p>
                    <p className="text-xs text-muted-foreground">{s.name}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`font-mono text-xs border ${signalColor(s.signal)}`}>
                      {s.signal}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">KES {Number(s.price).toFixed(2)}</TableCell>
                  <TableCell className="font-mono text-xs">{s.confidence}%</TableCell>
                  <TableCell className="font-mono text-xs">
                    {s.target_price ? `T: ${Number(s.target_price).toFixed(2)}` : "—"}
                    {s.stop_loss ? ` / SL: ${Number(s.stop_loss).toFixed(2)}` : ""}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground font-mono">
                    {new Date(s.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {s.is_active && (
                      <Button variant="ghost" size="sm" onClick={() => deactivateSignal(s.id)} className="text-xs text-signal-sell">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
