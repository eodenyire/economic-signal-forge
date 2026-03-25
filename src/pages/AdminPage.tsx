import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { UsersPanel } from "@/components/admin/UsersPanel";
import { SignalsPushPanel } from "@/components/admin/SignalsPushPanel";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldCheck, Loader2 } from "lucide-react";

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
    if (!authLoading && !adminLoading && user && !isAdmin) navigate("/dashboard");
  }, [user, isAdmin, authLoading, adminLoading, navigate]);

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 px-4 py-6">
        <div className="max-w-[1200px] mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Admin Panel
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage users, subscriptions, and push trading signals
            </p>
          </div>

          <Tabs defaultValue="signals" className="w-full">
            <TabsList>
              <TabsTrigger value="signals">Trading Signals</TabsTrigger>
              <TabsTrigger value="users">Users & Subscriptions</TabsTrigger>
            </TabsList>
            <TabsContent value="signals" className="mt-4">
              <SignalsPushPanel />
            </TabsContent>
            <TabsContent value="users" className="mt-4">
              <UsersPanel />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}
