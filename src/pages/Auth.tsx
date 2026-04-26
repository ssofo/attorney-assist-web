import { useEffect, useState } from "react";
import { Scale, ArrowLeft, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const loginSchema = z.object({
  email: z.string().trim().min(1).email("Email inválido"),
  password: z.string().min(1, "Ingresa tu contraseña"),
});

const bootstrapSchema = z.object({
  full_name: z.string().trim().min(2, "Nombre muy corto").max(100),
  email: z.string().trim().email("Email inválido").max(255),
  password: z.string().min(8, "Mínimo 8 caracteres").max(72),
  phone: z.string().trim().max(20).optional(),
  cedula: z.string().trim().max(20).optional(),
});

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, role, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);

  // Bootstrap (only when no jefe exists yet)
  const [needsBootstrap, setNeedsBootstrap] = useState(false);
  const [showBootstrap, setShowBootstrap] = useState(false);
  const [checkingBootstrap, setCheckingBootstrap] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { count } = await supabase
          .from("user_roles")
          .select("*", { count: "exact", head: true })
          .eq("role", "jefe");
        if (active) setNeedsBootstrap((count ?? 0) === 0);
      } catch {
        if (active) setNeedsBootstrap(false);
      } finally {
        if (active) setCheckingBootstrap(false);
      }
    })();
    return () => { active = false; };
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user && role) {
      if (role === "jefe") navigate("/dashboard-jefe", { replace: true });
      else if (role === "abogado") navigate("/dashboard", { replace: true });
      else navigate("/mi-caso", { replace: true });
    }
  }, [user, role, authLoading, navigate]);

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [bootstrapData, setBootstrapData] = useState({
    full_name: "",
    email: "",
    password: "",
    phone: "",
    cedula: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = loginSchema.safeParse(loginData);
    if (!parsed.success) {
      toast({ title: "Error", description: parsed.error.errors[0].message, variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });
    setLoading(false);
    if (error) {
      toast({
        title: "No se pudo iniciar sesión",
        description: error.message === "Invalid login credentials"
          ? "Correo o contraseña incorrectos"
          : error.message,
        variant: "destructive",
      });
      return;
    }
    toast({ title: "Bienvenido", description: "Acceso concedido" });
  };

  const handleBootstrap = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = bootstrapSchema.safeParse(bootstrapData);
    if (!parsed.success) {
      toast({ title: "Error", description: parsed.error.errors[0].message, variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("bootstrap-jefe", {
        body: parsed.data,
      });
      if (error || (data && (data as { error?: string }).error)) {
        const msg = (data as { error?: string })?.error ?? error?.message ?? "Error";
        toast({ title: "No se pudo crear el director", description: msg, variant: "destructive" });
        setLoading(false);
        return;
      }
      // Auto sign-in
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: parsed.data.email,
        password: parsed.data.password,
      });
      setLoading(false);
      if (signInErr) {
        toast({
          title: "Director creado",
          description: "Inicia sesión con tus nuevas credenciales.",
        });
        setShowBootstrap(false);
        setNeedsBootstrap(false);
        return;
      }
      toast({ title: "Director creado", description: "Bienvenido al panel del bufete." });
    } catch (err) {
      setLoading(false);
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    }
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
            {showBootstrap
              ? "Configuración inicial: crea la cuenta del Director"
              : "Acceso restringido al personal autorizado"}
          </p>

          {!showBootstrap && (
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
                type="submit" disabled={loading}
                className="w-full gradient-gold text-primary font-body font-semibold h-11 rounded-lg shadow-gold hover:opacity-90 border-0"
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
                {!checkingBootstrap && needsBootstrap && (
                  <button
                    type="button"
                    onClick={() => setShowBootstrap(true)}
                    className="mt-3 w-full flex items-center justify-center gap-2 text-xs font-body text-accent hover:underline"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Configurar primer Director del bufete
                  </button>
                )}
              </div>
            </form>
          )}

          {showBootstrap && (
            <form onSubmit={handleBootstrap} className="space-y-3">
              <div className="rounded-lg border border-accent/30 bg-accent/5 p-3 text-[11px] font-body text-foreground/80 leading-relaxed">
                Esta opción solo está disponible una vez. Crea la cuenta principal del Director del bufete.
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bs-name">Nombre completo</Label>
                <Input
                  id="bs-name" required maxLength={100}
                  value={bootstrapData.full_name}
                  onChange={(e) => setBootstrapData({ ...bootstrapData, full_name: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bs-email">Correo electrónico</Label>
                <Input
                  id="bs-email" type="email" required maxLength={255}
                  value={bootstrapData.email}
                  onChange={(e) => setBootstrapData({ ...bootstrapData, email: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="bs-phone">Teléfono</Label>
                  <Input
                    id="bs-phone" maxLength={20}
                    value={bootstrapData.phone}
                    onChange={(e) => setBootstrapData({ ...bootstrapData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="bs-cedula">Cédula</Label>
                  <Input
                    id="bs-cedula" maxLength={20}
                    value={bootstrapData.cedula}
                    onChange={(e) => setBootstrapData({ ...bootstrapData, cedula: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bs-password">Contraseña</Label>
                <Input
                  id="bs-password" type="password" required minLength={8} maxLength={72}
                  value={bootstrapData.password}
                  onChange={(e) => setBootstrapData({ ...bootstrapData, password: e.target.value })}
                />
                <p className="text-[11px] text-muted-foreground">Mínimo 8 caracteres</p>
              </div>
              <Button
                type="submit" disabled={loading}
                className="w-full gradient-gold text-primary font-body font-semibold h-11 rounded-lg shadow-gold hover:opacity-90 border-0 mt-2"
              >
                {loading ? "Creando…" : "Crear Director"}
              </Button>
              <button
                type="button"
                onClick={() => setShowBootstrap(false)}
                className="w-full text-[11px] text-muted-foreground hover:text-foreground mt-1"
              >
                Cancelar
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
