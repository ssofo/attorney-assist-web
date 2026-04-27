import { useEffect, useState } from "react";
import { Scale, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const signupSchema = z.object({
  full_name: z.string().trim().min(2, "Nombre muy corto").max(100),
  email: z.string().trim().email("Email inválido").max(255),
  password: z.string().min(8, "Mínimo 8 caracteres").max(72),
  phone: z.string().trim().min(7, "Teléfono inválido").max(20),
  cedula: z.string().trim().min(5, "Cédula inválida").max(20),
});

const loginSchema = z.object({
  email: z.string().trim().min(1).email("Email inválido"),
  password: z.string().min(1, "Ingresa tu contraseña"),
});

type LoginInput = z.infer<typeof loginSchema>;

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, role, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user && role) {
      if (role === "jefe") navigate("/dashboard-jefe", { replace: true });
      else if (role === "abogado") navigate("/dashboard", { replace: true });
      else navigate("/mi-caso", { replace: true });
    }
  }, [user, role, authLoading, navigate]);

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({
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
    const creds: LoginInput = parsed.data;
    const { error } = await supabase.auth.signInWithPassword({
      email: creds.email,
      password: creds.password,
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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = signupSchema.safeParse(signupData);
    if (!parsed.success) {
      toast({ title: "Error", description: parsed.error.errors[0].message, variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          full_name: parsed.data.full_name,
          phone: parsed.data.phone,
          cedula: parsed.data.cedula,
        },
      },
    });
    setLoading(false);
    if (error) {
      toast({
        title: "No se pudo crear la cuenta",
        description: error.message.includes("already")
          ? "Este correo ya está registrado"
          : error.message,
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Cuenta creada",
      description: "Ya puedes iniciar sesión con tus credenciales.",
    });
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
            Accede o crea tu cuenta de cliente
          </p>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Iniciar sesión</TabsTrigger>
              <TabsTrigger value="signup">Crear cuenta</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
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
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="su-name">Nombre completo</Label>
                  <Input
                    id="su-name" required maxLength={100}
                    value={signupData.full_name}
                    onChange={(e) => setSignupData({ ...signupData, full_name: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="su-email">Correo electrónico</Label>
                  <Input
                    id="su-email" type="email" required maxLength={255}
                    value={signupData.email}
                    onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="su-phone">Teléfono</Label>
                    <Input
                      id="su-phone" required maxLength={20}
                      value={signupData.phone}
                      onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="su-cedula">Cédula</Label>
                    <Input
                      id="su-cedula" required maxLength={20}
                      value={signupData.cedula}
                      onChange={(e) => setSignupData({ ...signupData, cedula: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="su-password">Contraseña</Label>
                  <Input
                    id="su-password" type="password" required minLength={8} maxLength={72}
                    value={signupData.password}
                    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                  />
                  <p className="text-[11px] text-muted-foreground">Mínimo 8 caracteres</p>
                </div>
                <Button
                  type="submit" disabled={loading}
                  className="w-full gradient-gold text-primary font-body font-semibold h-11 rounded-lg shadow-gold hover:opacity-90 border-0 mt-2"
                >
                  {loading ? "Creando…" : "Crear Cuenta"}
                </Button>
                <p className="text-[11px] text-muted-foreground text-center mt-2">
                  Al registrarte serás registrado como Cliente. Las cuentas de Abogado las crea el Director del bufete.
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Auth;
