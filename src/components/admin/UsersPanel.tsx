import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Users, Shield, ShieldOff } from "lucide-react";

interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
}

interface UserRole {
  user_id: string;
  role: "admin" | "user";
}

interface Subscription {
  user_id: string;
  plan: string;
  status: string;
}

export function UsersPanel() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const [profilesRes, rolesRes, subsRes] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id, role"),
      supabase.from("subscriptions").select("user_id, plan, status"),
    ]);
    setProfiles(profilesRes.data || []);
    setRoles(rolesRes.data || []);
    setSubscriptions(subsRes.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const getUserRole = (userId: string) => roles.find((r) => r.user_id === userId);
  const getUserSub = (userId: string) => subscriptions.find((s) => s.user_id === userId);

  const toggleAdmin = async (userId: string) => {
    const existing = getUserRole(userId);
    if (existing?.role === "admin") {
      await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", "admin");
      toast({ title: "Admin role removed" });
    } else {
      await supabase.from("user_roles").upsert({ user_id: userId, role: "admin" as any });
      toast({ title: "Admin role granted" });
    }
    fetchData();
  };

  const updateSubscription = async (userId: string, plan: string) => {
    const existing = getUserSub(userId);
    if (existing) {
      await supabase.from("subscriptions").update({ plan }).eq("user_id", userId);
    } else {
      await supabase.from("subscriptions").insert({ user_id: userId, plan });
    }
    toast({ title: `Subscription updated to ${plan}` });
    fetchData();
  };

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          User Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground py-8 text-center">Loading users…</p>
        ) : profiles.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">No users registered yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Subscription</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles.map((p) => {
                const role = getUserRole(p.id);
                const sub = getUserSub(p.id);
                return (
                  <TableRow key={p.id}>
                    <TableCell>
                      <p className="font-medium">{p.full_name || "—"}</p>
                      <p className="text-xs text-muted-foreground font-mono">{p.id.slice(0, 8)}…</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant={role?.role === "admin" ? "default" : "secondary"} className="font-mono text-xs">
                        {role?.role || "user"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={sub?.plan || "free"}
                        onValueChange={(val) => updateSubscription(p.id, val)}
                      >
                        <SelectTrigger className="w-28 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="free">Free</SelectItem>
                          <SelectItem value="basic">Basic</SelectItem>
                          <SelectItem value="premium">Premium</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">
                      {new Date(p.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleAdmin(p.id)}
                        className="text-xs"
                      >
                        {role?.role === "admin" ? (
                          <><ShieldOff className="h-3.5 w-3.5 mr-1" />Revoke</>
                        ) : (
                          <><Shield className="h-3.5 w-3.5 mr-1" />Make Admin</>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
