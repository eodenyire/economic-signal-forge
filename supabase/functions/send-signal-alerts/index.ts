import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TWILIO_GATEWAY_URL = "https://connector-gateway.lovable.dev/twilio";
const TWILIO_FROM_NUMBER = "+14788004032";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;

    // Verify admin role
    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { signal } = await req.json();
    if (!signal || !signal.symbol || !signal.signal || !signal.price) {
      return new Response(JSON.stringify({ error: "Missing signal data" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get subscribers with phone numbers (active subscriptions)
    const serviceClient = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: subscribers } = await serviceClient
      .from("subscriptions")
      .select("user_id")
      .eq("status", "active");

    if (!subscribers || subscribers.length === 0) {
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: "No active subscribers" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userIds = subscribers.map((s: any) => s.user_id);
    const { data: profiles } = await serviceClient
      .from("profiles")
      .select("phone, full_name")
      .in("id", userIds)
      .not("phone", "is", null);

    if (!profiles || profiles.length === 0) {
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: "No subscribers with phone numbers" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build SMS message
    const direction = signal.signal === "BUY" ? "📈" : signal.signal === "SELL" ? "📉" : "⏸️";
    const message = [
      `${direction} NSE Alpha Signal: ${signal.signal} ${signal.symbol}`,
      `Price: KES ${Number(signal.price).toFixed(2)}`,
      signal.target_price ? `Target: KES ${Number(signal.target_price).toFixed(2)}` : null,
      signal.stop_loss ? `Stop Loss: KES ${Number(signal.stop_loss).toFixed(2)}` : null,
      `Confidence: ${signal.confidence}%`,
      signal.notes ? `Note: ${signal.notes}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    // Send SMS via Twilio gateway
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const TWILIO_API_KEY = Deno.env.get("TWILIO_API_KEY");
    if (!TWILIO_API_KEY) throw new Error("TWILIO_API_KEY is not configured");

    let sentCount = 0;
    const errors: string[] = [];

    for (const profile of profiles) {
      try {
        const response = await fetch(`${TWILIO_GATEWAY_URL}/Messages.json`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "X-Connection-Api-Key": TWILIO_API_KEY,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            To: profile.phone!,
            From: TWILIO_FROM_NUMBER,
            Body: message,
          }),
        });

        const data = await response.json();
        if (response.ok) {
          sentCount++;
        } else {
          errors.push(`Failed for ${profile.phone}: ${JSON.stringify(data)}`);
        }
      } catch (err) {
        errors.push(`Error for ${profile.phone}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    return new Response(
      JSON.stringify({ success: true, sent: sentCount, total: profiles.length, errors }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in send-signal-alerts:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
