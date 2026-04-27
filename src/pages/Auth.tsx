import { useEffect, useState } from "react";
import { Scale, ArrowLeft, Briefcase, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, AppRole } from "@/hooks/useAuth";

const loginSchema = z.object({
  email: z.string().trim().min(1).email("Email inválido"),
  password: z.string().min(1, "Ingresa tu contraseña"),
});

type RoleOption = {
  id: AppRole;
  icon: typeof Briefcase;
  label: string;
  desc: string;
};

const ROLE_OPTIONS: RoleOption[] = [
  { id: "jefe", icon: Shield, label: "Director", desc: "Control del bufete" },
  { id: "abogado", icon: Briefcase, label: "Abogado", desc: "Casos asignados" },
  { id: "cliente", icon: User, label: "Cliente", desc: "Mi caso" },
];

const ROLE_LABEL: Record<AppRole, string> = {
  jefe: "Director",
  abogado: "Abogado",
  cliente: "Cliente",
};

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, role, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<AppRole | null>(null);
  const [loginData, setLoginData] = useState({ email: "", password: "" });

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user && role) {
      if (role === "jefe") navigate("/dashboard-jefe", { replace: true });
      else if (role === "abogado") navigate("/dashboard", { replace: true });
      else navigate("/mi-caso", { replace: true });
    }
  }, [user, role, authLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) {
      toast({ title: "Selecciona un tipo de acceso", description: "Elige Director, Abogado o Cliente.", variant: "destructive" });
      return;
    }
    const parsed = loginSchema.safeParse(loginData);
    if (!parsed.success) {
      toast({ title: "Error", description: parsed.error.errors[0].message, variant: "destructive" });
      return;
    }
    setLoading(true);
    const { data: signInData, error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });
    if (error || !signInData.user) {
      setLoading(false);
      toast({
        title: "No se pudo iniciar sesión",
        description: error?.message === "Invalid login credentials"
          ? "Correo o contraseña incorrectos"
          : error?.message ?? "Error desconocido",
        variant: "destructive",
      });
      return;
    }

    // Verify role matches
    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", signInData.user.id)
      .eq("role", selectedRole)
      .maybeSingle();

    if (!roleRow) {
      // Wrong role for this account — sign out and warn
      await supabase.auth.signOut();
      setLoading(false);
      toast({
        title: "Acceso incorrecto",
        description: `Esta cuenta no tiene permisos de ${ROLE_LABEL[selectedRole]}. Selecciona el tipo de acceso correcto.`,
        variant: "destructive",
      });
      return;
    }

    setLoading(false);
    toast({ title: "Bienvenido", description: `Acceso como ${ROLE_LABEL[selectedRole]}` });
  };

  return (
    <div className="min-h-screen gradient-navy flex items-center justify-center relative overflow-hidden py-10">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 rounded-full bg-accent blur-[120px]" />
      </div>

      <div className="w-full max-w-md mx-auto px-6 relative z-10">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 font-body text-sm text-accent mb-6 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </button>

        <div className="bg-card rounded-2xl shadow-luxury border border-border p-8">
          <div className="flex items-center gap-3 mb-2">
            <Scale className="w-6 h-6 text-accent" />
            <span className="font-display text-xl font-bold text-foreground">Jurova Legal Group</span>
          </div>
          <p className="font-body text-sm text-muted-foreground mb-6">
            Acceso restringido al personal autorizado
          </p>

          {/* Role selection */}
          <div className="mb-5">
            <Label className="font-body text-sm text-foreground mb-3 block">Tipo de acceso</Label>
            <div className="grid grid-cols-3 gap-2">
              {ROLE_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedRole(opt.id)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                    selectedRole === opt.id
                      ? "border-accent bg-accent/10"
                      : "border-border hover:border-accent/30"
                  }`}
                >
                  <opt.icon
                    className={`w-5 h-5 ${
                      selectedRole === opt.id ? "text-accent" : "text-muted-foreground"
                    }`}
                  />
                  <span className="font-display text-xs font-semibold text-foreground">
                    {opt.label}
                  </span>
                  <span className="font-body text-[10px] text-muted-foreground text-center leading-tight">
                    {opt.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-email">Correo electrónico</Label>
              <Input
                id="login-email" type="email" required autoComplete="email"
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password">Contraseña</Label>
              <Input
                id="login-password" type="password" required autoComplete="current-password"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              />
            </div>
            <Button
              type="submit" disabled={loading || !selectedRole}
              className="w-full gradient-gold text-primary font-body font-semibold h-11 rounded-lg shadow-gold hover:opacity-90 border-0 disabled:opacity-50"
            >
              {loading ? "Ingresando…" : "Iniciar Sesión"}
            </Button>
            <p className="font-body text-xs text-center mt-2">
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-accent hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </p>

            <div className="mt-6 pt-4 border-t border-border">
              <p className="font-body text-[11px] text-muted-foreground text-center leading-relaxed">
                El registro está restringido. Las cuentas de <strong>abogados</strong> y{" "}
                <strong>clientes</strong> son creadas exclusivamente por el Director del bufete.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;
