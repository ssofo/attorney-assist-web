// Edge function: bootstrap-jefe
// Creates the FIRST "jefe" account. Only works while there is no jefe in the system.
// Once any jefe exists, this endpoint becomes inaccessible.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface Payload {
  full_name: string;
  email: string;
  password: string;
  phone?: string;
  cedula?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    // Block if any jefe already exists
    const { count, error: countErr } = await admin
      .from("user_roles")
      .select("*", { count: "exact", head: true })
      .eq("role", "jefe");

    if (countErr) {
      return new Response(
        JSON.stringify({ error: countErr.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if ((count ?? 0) > 0) {
      return new Response(
        JSON.stringify({ error: "Ya existe un director. Solicita acceso al jefe del bufete." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body = (await req.json()) as Payload;
    if (!body.email || !body.password || !body.full_name) {
      return new Response(JSON.stringify({ error: "Faltan campos obligatorios" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (body.password.length < 8) {
      return new Response(JSON.stringify({ error: "La contraseña debe tener al menos 8 caracteres" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: true,
      user_metadata: {
        full_name: body.full_name,
        phone: body.phone ?? null,
        cedula: body.cedula ?? null,
        role: "jefe",
      },
    });

    if (createErr || !created.user) {
      return new Response(
        JSON.stringify({ error: createErr?.message ?? "No se pudo crear el director" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const newUserId = created.user.id;

    await admin.from("profiles").upsert(
      {
        id: newUserId,
        email: body.email,
        full_name: body.full_name,
        phone: body.phone ?? null,
        cedula: body.cedula ?? null,
      },
      { onConflict: "id" },
    );

    await admin
      .from("user_roles")
      .upsert(
        { user_id: newUserId, role: "jefe" },
        { onConflict: "user_id,role" },
      );

    return new Response(
      JSON.stringify({ success: true, user_id: newUserId }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message ?? "Error inesperado" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
