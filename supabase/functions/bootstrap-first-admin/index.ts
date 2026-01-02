// Lovable Cloud backend function: bootstrap-first-admin
// Sets password + grants admin role ONLY if no admins exist yet.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, newPassword } = await req.json();

    if (!userId || typeof userId !== "string") {
      return new Response(JSON.stringify({ error: "missing_userId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
      return new Response(JSON.stringify({ error: "weak_password" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!url || !serviceKey) {
      return new Response(JSON.stringify({ error: "missing_backend_config" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(url, serviceKey);

    // Allow bootstrap only if there are no admins yet
    const { count: adminCount, error: adminCountError } = await admin
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");

    if (adminCountError) throw adminCountError;

    if ((adminCount ?? 0) > 0) {
      return new Response(JSON.stringify({ error: "bootstrap_closed" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Set password for the user
    const { error: updateUserError } = await admin.auth.admin.updateUserById(userId, {
      password: newPassword,
      email_confirm: true,
    });

    if (updateUserError) throw updateUserError;

    // Grant admin role
    const { error: roleError } = await admin
      .from("user_roles")
      .insert({ user_id: userId, role: "admin" });

    if (roleError && !String(roleError.message || "").includes("duplicate")) {
      throw roleError;
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "server_error", details: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
