import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import {
  Scale,
  Shield,
  Briefcase,
  CalendarDays,
  BarChart3,
  Bell,
  Users,
  Clock,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Check,
  XCircle,
  MessageSquare,
  FileText,
  TrendingUp,
  AlertTriangle,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GestionDocumentos } from "@/components/GestionDocumentos";
import { Upload } from "lucide-react";

const menuItems = [
  { id: "revision", icon: FileText, label: "Revisión de Casos" },
  { id: "asignacion", icon: Briefcase, label: "Asignación de Casos" },
  { id: "documentos", icon: Upload, label: "Gestión Documental" },
  { id: "terminos", icon: Clock, label: "Control de Términos" },
  { id: "vencimientos", icon: AlertTriangle, label: "Próximos Vencimientos" },
  { id: "abogados", icon: Users, label: "Gestión de Usuarios" },
  { id: "comentarios", icon: MessageSquare, label: "Comentarios Internos" },
  { id: "calendario", icon: CalendarDays, label: "Calendario General" },
  { id: "analitica", icon: BarChart3, label: "Analítica y KPIs" },
  { id: "notificaciones", icon: Bell, label: "Notificaciones" },
  { id: "configuracion", icon: Settings, label: "Configuración" },
];

const DashboardJefe = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("revision");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { signOut } = useAuth();
  const handleLogout = async () => { await signOut(); navigate("/"); };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex w-64 gradient-navy flex-col border-r border-accent/10 fixed inset-y-0 left-0 z-30">
        <div className="p-5 border-b border-accent/10">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-accent" />
            <span className="font-display text-lg font-bold text-primary-foreground">Jurova</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <Shield className="w-3 h-3 text-accent/70" />
            <p className="font-body text-[10px] text-primary-foreground/40">Panel del Director</p>
          </div>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-body text-sm transition-colors ${
                activeSection === item.id
                  ? "bg-accent/15 text-accent"
                  : "text-primary-foreground/60 hover:text-primary-foreground hover:bg-accent/5"
              }`}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-accent/10">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-body text-sm text-primary-foreground/40 hover:text-primary-foreground hover:bg-accent/5 transition-colors">
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 gradient-navy border-b border-accent/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-accent" />
          <span className="font-display text-lg font-bold text-primary-foreground">Jurova</span>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-primary-foreground/70">
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-30">
          <div className="absolute inset-0 bg-foreground/50" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-14 bottom-0 w-64 gradient-navy border-r border-accent/10 flex flex-col">
            <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setActiveSection(item.id); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-body text-sm transition-colors ${
                    activeSection === item.id
                      ? "bg-accent/15 text-accent"
                      : "text-primary-foreground/60 hover:text-primary-foreground hover:bg-accent/5"
                  }`}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  {item.label}
                </button>
              ))}
            </nav>
            <div className="p-3 border-t border-accent/10">
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-body text-sm text-primary-foreground/40 hover:text-primary-foreground hover:bg-accent/5 transition-colors">
                <LogOut className="w-4 h-4" />
                Cerrar Sesión
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 md:ml-64 pt-14 md:pt-0">
        <div className="p-6 md:p-8">
          {activeSection === "revision" && <SeccionRevision />}
          {activeSection === "asignacion" && <SeccionAsignacion />}
          {activeSection === "documentos" && (
            <>
              <SectionHeader
                title="Gestión Documental"
                description="Envía documentos a los abogados y administra los archivos del bufete"
              />
              <GestionDocumentos mode="jefe" />
            </>
          )}
          {activeSection === "terminos" && <SeccionTerminosJefe />}
          {activeSection === "vencimientos" && <SeccionVencimientos />}
          {activeSection === "abogados" && <SeccionAbogados />}
          {activeSection === "comentarios" && <SeccionComentarios />}
          {activeSection === "calendario" && <SeccionCalendarioJefe />}
          {activeSection === "analitica" && <SeccionAnaliticaJefe />}
          {activeSection === "notificaciones" && <SeccionNotificacionesJefe setActiveSection={setActiveSection} />}
          {activeSection === "configuracion" && <SeccionConfiguracion />}
        </div>
      </main>
    </div>
  );
};

/* ── Helpers ── */
const SectionHeader = ({ title, description }: { title: string; description: string }) => (
  <div className="mb-8">
    <h1 className="font-display text-3xl font-bold text-foreground">{title}</h1>
    <p className="font-body text-sm text-muted-foreground mt-2">{description}</p>
  </div>
);

const etapas = ["Creación", "Recaudo Probatorio", "Proyección", "Revisión", "Proyección de Recursos", "Recabar Pruebas", "Audiencia"];

/* ── Revisión de Casos (accept / request corrections) ── */
const SeccionRevision = () => {
  const [expandedCase, setExpandedCase] = useState<string | null>(null);
  const [observacion, setObservacion] = useState("");

  const pendientes = [
    { id: "2024-0912", abogado: "Dr. López", cliente: "Carlos Ruiz", etapa: "Proyección", tipo: "Laboral", etapaIndex: 2 },
    { id: "2024-0950", abogado: "Dra. Torres", cliente: "José Martínez", etapa: "Recaudo Probatorio", tipo: "Penal", etapaIndex: 1 },
    { id: "2024-0847", abogado: "Dr. López", cliente: "María Fernández", etapa: "Revisión", tipo: "Civil", etapaIndex: 3 },
  ];

  return (
    <>
      <SectionHeader title="Revisión de Casos" description="Revisa, aprueba o devuelve los casos enviados por los abogados" />
      <div className="grid gap-4">
        {pendientes.map((caso) => (
          <div key={caso.id} className="bg-card rounded-xl border border-border overflow-hidden">
            <button
              onClick={() => setExpandedCase(expandedCase === caso.id ? null : caso.id)}
              className="w-full p-5 flex items-center justify-between hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg gradient-navy flex items-center justify-center">
                  <FileText className="w-4 h-4 text-accent" />
                </div>
                <div className="text-left">
                  <p className="font-display text-base font-semibold text-foreground">Caso #{caso.id}</p>
                  <p className="font-body text-xs text-muted-foreground">{caso.abogado} · {caso.cliente} · {caso.tipo}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-body px-3 py-1 rounded-full bg-accent/10 text-accent font-medium">{caso.etapa}</span>
                <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${expandedCase === caso.id ? "rotate-90" : ""}`} />
              </div>
            </button>

            {expandedCase === caso.id && (
              <div className="px-5 pb-5 border-t border-border pt-4 space-y-4">
                {/* Workflow steps */}
                <div>
                  <p className="font-body text-xs text-muted-foreground mb-3 uppercase tracking-wider">Progreso del caso</p>
                  <div className="flex items-center gap-1 flex-wrap">
                    {etapas.map((et, i) => (
                      <div key={et} className="flex items-center gap-1">
                        <div className={`px-2.5 py-1 rounded-md text-[10px] font-body font-medium ${
                          i < caso.etapaIndex ? "bg-accent/20 text-accent" :
                          i === caso.etapaIndex ? "bg-accent text-primary-foreground" :
                          "bg-muted text-muted-foreground"
                        }`}>
                          {et}
                        </div>
                        {i < etapas.length - 1 && <ChevronRight className="w-3 h-3 text-muted-foreground" />}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Observations */}
                <div>
                  <Label className="font-body text-sm text-foreground">Observaciones</Label>
                  <Textarea
                    placeholder="Escribe observaciones o correcciones para el abogado..."
                    value={observacion}
                    onChange={(e) => setObservacion(e.target.value)}
                    className="mt-2"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button className="gradient-gold text-primary font-body font-semibold shadow-gold hover:opacity-90 border-0 gap-2">
                    <Check className="w-4 h-4" />
                    Aprobar Caso
                  </Button>
                  <Button variant="outline" className="font-body gap-2 border-destructive/30 text-destructive hover:bg-destructive/10">
                    <XCircle className="w-4 h-4" />
                    Devolver con Correcciones
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

/* ── Asignación de Casos ── */
const SeccionAsignacion = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [paso, setPaso] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [abogados, setAbogados] = useState<{ id: string; full_name: string; especialidad: string | null; area_id: string | null }[]>([]);
  const [areas, setAreas] = useState<{ id: string; nombre: string }[]>([]);
  const [tiposProceso, setTiposProceso] = useState<{ id: string; nombre: string; area_id: string | null }[]>([]);
  const [juzgados, setJuzgados] = useState<{ id: string; nombre: string; ciudad: string | null }[]>([]);
  const [form, setForm] = useState({
    radicado: "",
    tipo: "",
    area_id: "",
    tipo_proceso_id: "",
    cliente_nombre: "",
    juzgado: "",
    juzgado_id: "",
    abogado_id: "",
    observaciones: "",
    fecha_vencimiento: "",
    urgente: false,
  });

  useEffect(() => {
    (async () => {
      const { data: roleRows } = await supabase.from("user_roles").select("user_id").eq("role", "abogado");
      const ids = (roleRows ?? []).map((r) => r.user_id);
      if (ids.length > 0) {
        const { data } = await supabase.from("profiles").select("id, full_name, especialidad, area_id").in("id", ids);
        setAbogados((data ?? []) as any);
      }
      const [{ data: aData }, { data: tData }, { data: jData }] = await Promise.all([
        supabase.from("areas_derecho").select("id, nombre").order("nombre"),
        supabase.from("tipos_proceso").select("id, nombre, area_id").order("nombre"),
        supabase.from("juzgados").select("id, nombre, ciudad").order("nombre"),
      ]);
      setAreas(aData ?? []);
      setTiposProceso(tData ?? []);
      setJuzgados(jData ?? []);
    })();
  }, []);

  const tiposFiltrados = form.area_id
    ? tiposProceso.filter((t) => t.area_id === form.area_id)
    : tiposProceso;

  const pasos = [
    { label: "Datos del caso", desc: "Información básica del caso" },
    { label: "Asignar abogado", desc: "Seleccionar abogado responsable" },
    { label: "Definir términos", desc: "Establecer plazos por etapa" },
    { label: "Observaciones", desc: "Notas e instrucciones iniciales" },
    { label: "Confirmar", desc: "Revisar y enviar asignación" },
  ];

  const handleSubmit = async () => {
    if (!user) return;
    if (!form.radicado || !form.tipo || !form.cliente_nombre) {
      toast({ title: "Faltan datos", description: "Radicado, tipo y cliente son obligatorios", variant: "destructive" });
      setPaso(0);
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("cases").insert({
      radicado: form.radicado,
      tipo: form.tipo,
      area_id: form.area_id || null,
      tipo_proceso_id: form.tipo_proceso_id || null,
      cliente_nombre: form.cliente_nombre,
      juzgado_id: form.juzgado_id || null,
      abogado_id: form.abogado_id || null,
      observaciones: form.observaciones || null,
      fecha_vencimiento: form.fecha_vencimiento || null,
      urgente: form.urgente,
      created_by: user.id,
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "No se pudo crear el caso", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Caso asignado", description: `Radicado ${form.radicado} creado correctamente.` });
    setForm({ radicado: "", tipo: "", area_id: "", tipo_proceso_id: "", cliente_nombre: "", juzgado: "", juzgado_id: "", abogado_id: "", observaciones: "", fecha_vencimiento: "", urgente: false });
    setPaso(0);
  };

  return (
    <>
      <SectionHeader title="Asignación de Casos" description="Crea y asigna nuevos casos a los abogados paso a paso" />

      <div className="flex items-center gap-2 mb-8 flex-wrap">
        {pasos.map((p, i) => (
          <div key={i} className="flex items-center gap-2">
            <button
              onClick={() => setPaso(i)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                i === paso ? "bg-accent/15 border border-accent/30" :
                i < paso ? "bg-accent/5" : "bg-muted"
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-body font-bold ${
                i === paso ? "bg-accent text-primary-foreground" :
                i < paso ? "bg-accent/30 text-accent" : "bg-muted-foreground/20 text-muted-foreground"
              }`}>
                {i < paso ? <Check className="w-3 h-3" /> : i + 1}
              </div>
              <span className={`font-body text-xs hidden sm:inline ${i === paso ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                {p.label}
              </span>
            </button>
            {i < pasos.length - 1 && <ChevronRight className="w-3 h-3 text-muted-foreground hidden sm:block" />}
          </div>
        ))}
      </div>

      <div className="bg-card rounded-xl border border-border p-6">
        {paso === 0 && (
          <div className="space-y-4">
            <h3 className="font-display text-lg font-semibold text-foreground">Datos del Caso</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-body text-sm">Número de radicado *</Label>
                <Input value={form.radicado} onChange={(e) => setForm({ ...form, radicado: e.target.value })} placeholder="Ej: 2024-0960" />
              </div>
              <div className="space-y-2">
                <Label className="font-body text-sm">Cliente *</Label>
                <Input value={form.cliente_nombre} onChange={(e) => setForm({ ...form, cliente_nombre: e.target.value })} placeholder="Nombre del cliente" />
              </div>
              <div className="space-y-2">
                <Label className="font-body text-sm">Área de derecho</Label>
                <Select
                  value={form.area_id}
                  onValueChange={(v) => setForm({ ...form, area_id: v, tipo_proceso_id: "", tipo: areas.find((a) => a.id === v)?.nombre ?? form.tipo })}
                >
                  <SelectTrigger><SelectValue placeholder="Selecciona un área" /></SelectTrigger>
                  <SelectContent>
                    {areas.map((a) => (
                      <SelectItem key={a.id} value={a.id}>{a.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="font-body text-sm">Tipo de proceso *</Label>
                <Select
                  value={form.tipo_proceso_id}
                  onValueChange={(v) => {
                    const t = tiposProceso.find((tp) => tp.id === v);
                    setForm({ ...form, tipo_proceso_id: v, tipo: t?.nombre ?? form.tipo });
                  }}
                >
                  <SelectTrigger><SelectValue placeholder={form.area_id ? "Selecciona un tipo" : "Elige primero un área"} /></SelectTrigger>
                  <SelectContent>
                    {tiposFiltrados.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="font-body text-sm">Juzgado</Label>
                <Select
                  value={form.juzgado_id}
                  onValueChange={(v) => {
                    const j = juzgados.find((jz) => jz.id === v);
                    setForm({ ...form, juzgado_id: v, juzgado: j ? `${j.nombre}${j.ciudad ? ` (${j.ciudad})` : ""}` : "" });
                  }}
                >
                  <SelectTrigger><SelectValue placeholder="Selecciona un juzgado" /></SelectTrigger>
                  <SelectContent>
                    {juzgados.map((j) => (
                      <SelectItem key={j.id} value={j.id}>{j.nombre}{j.ciudad ? ` · ${j.ciudad}` : ""}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="font-body text-sm">Fecha de vencimiento</Label>
                <Input type="date" value={form.fecha_vencimiento} onChange={(e) => setForm({ ...form, fecha_vencimiento: e.target.value })} />
              </div>
              <div className="space-y-2 flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.urgente} onChange={(e) => setForm({ ...form, urgente: e.target.checked })} />
                  <span className="font-body text-sm">Marcar como urgente</span>
                </label>
              </div>
            </div>
          </div>
        )}
        {paso === 1 && (() => {
          const filtrados = form.area_id
            ? abogados.filter((a) => a.area_id === form.area_id)
            : abogados;
          const areaNombre = areas.find((a) => a.id === form.area_id)?.nombre;
          return (
          <div className="space-y-4">
            <h3 className="font-display text-lg font-semibold text-foreground">Asignar Abogado</h3>
            {form.area_id && (
              <p className="font-body text-xs text-muted-foreground">
                Mostrando abogados especializados en <b>{areaNombre}</b>.
                {filtrados.length === 0 && " Si ninguno coincide, asígnale el área desde Gestión de Usuarios."}
              </p>
            )}
            {abogados.length === 0 ? (
              <p className="font-body text-sm text-muted-foreground">No hay abogados registrados aún. Crea uno desde "Gestión de Usuarios".</p>
            ) : filtrados.length === 0 ? (
              <p className="font-body text-sm text-muted-foreground">Ningún abogado tiene esa área asignada todavía.</p>
            ) : (
              filtrados.map((ab) => (
                <button
                  key={ab.id}
                  type="button"
                  onClick={() => setForm({ ...form, abogado_id: ab.id })}
                  className={`w-full text-left p-4 rounded-xl border transition-colors flex items-center gap-3 ${
                    form.abogado_id === ab.id ? "border-accent bg-accent/5" : "border-border hover:border-accent/30"
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                    <Users className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <p className="font-display text-sm font-semibold text-foreground">{ab.full_name}</p>
                    <p className="font-body text-xs text-muted-foreground">Área: {ab.especialidad ?? "—"}</p>
                  </div>
                  {form.abogado_id === ab.id && <Check className="w-4 h-4 text-accent ml-auto" />}
                </button>
              ))
            )}
          </div>
          );
        })()}
        {paso === 2 && (
          <div className="space-y-4">
            <h3 className="font-display text-lg font-semibold text-foreground">Definir Términos Procesales</h3>
            <p className="font-body text-xs text-muted-foreground">Plazos sugeridos por etapa (referenciales para este caso)</p>
            {etapas.map((et) => (
              <div key={et} className="flex items-center justify-between p-3 rounded-lg border border-border">
                <span className="font-body text-sm text-foreground">{et}</span>
                <div className="flex items-center gap-2">
                  <Input type="number" placeholder="Días" className="w-20 h-8 text-center text-sm" />
                  <span className="font-body text-xs text-muted-foreground">días</span>
                </div>
              </div>
            ))}
          </div>
        )}
        {paso === 3 && (
          <div className="space-y-4">
            <h3 className="font-display text-lg font-semibold text-foreground">Observaciones Iniciales</h3>
            <Textarea value={form.observaciones} onChange={(e) => setForm({ ...form, observaciones: e.target.value })} placeholder="Instrucciones, notas importantes, documentos requeridos..." rows={6} />
          </div>
        )}
        {paso === 4 && (
          <div className="space-y-4 text-center">
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 text-accent" />
            </div>
            <h3 className="font-display text-lg font-semibold text-foreground">Confirmar Asignación</h3>
            <div className="text-left max-w-md mx-auto bg-muted/30 p-4 rounded-lg space-y-1">
              <p className="font-body text-xs"><b>Radicado:</b> {form.radicado || "—"}</p>
              <p className="font-body text-xs"><b>Tipo:</b> {form.tipo || "—"}</p>
              <p className="font-body text-xs"><b>Cliente:</b> {form.cliente_nombre || "—"}</p>
              <p className="font-body text-xs"><b>Juzgado:</b> {form.juzgado || "—"}</p>
              <p className="font-body text-xs"><b>Abogado:</b> {abogados.find(a => a.id === form.abogado_id)?.full_name || "Sin asignar"}</p>
              <p className="font-body text-xs"><b>Vencimiento:</b> {form.fecha_vencimiento || "—"}</p>
              <p className="font-body text-xs"><b>Urgente:</b> {form.urgente ? "Sí" : "No"}</p>
            </div>
            <Button onClick={handleSubmit} disabled={submitting} className="gradient-gold text-primary font-body font-semibold shadow-gold hover:opacity-90 border-0 mt-4">
              {submitting ? "Enviando…" : "Enviar Asignación"}
            </Button>
          </div>
        )}

        {paso < 4 && (
          <div className="flex justify-between mt-6 pt-4 border-t border-border">
            <Button variant="outline" onClick={() => setPaso(Math.max(0, paso - 1))} disabled={paso === 0} className="font-body">
              Anterior
            </Button>
            <Button onClick={() => setPaso(paso + 1)} className="gradient-gold text-primary font-body font-semibold shadow-gold hover:opacity-90 border-0">
              Siguiente
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

/* ── Control de Términos (Jefe sets limits) ── */
const SeccionTerminosJefe = () => {
  const areas = [
    { area: "Civil", terminos: { "Creación": 5, "Recaudo Probatorio": 15, "Proyección": 10, "Revisión": 5, "Recursos": 8, "Pruebas": 12, "Audiencia": 3 } },
    { area: "Laboral", terminos: { "Creación": 3, "Recaudo Probatorio": 10, "Proyección": 8, "Revisión": 4, "Recursos": 6, "Pruebas": 10, "Audiencia": 2 } },
    { area: "Penal", terminos: { "Creación": 2, "Recaudo Probatorio": 8, "Proyección": 6, "Revisión": 3, "Recursos": 5, "Pruebas": 8, "Audiencia": 1 } },
  ];

  return (
    <>
      <SectionHeader title="Control de Términos" description="Define y administra los plazos procesales por área y etapa" />
      <div className="grid gap-6">
        {areas.map((a) => (
          <div key={a.area} className="bg-card rounded-xl border border-border p-5">
            <h3 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-accent" />
              Área {a.area}
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(a.terminos).map(([etapa, dias]) => (
                <div key={etapa} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="font-body text-xs text-foreground">{etapa}</span>
                  <div className="flex items-center gap-1.5">
                    <Input type="number" defaultValue={dias} className="w-16 h-7 text-center text-xs" />
                    <span className="font-body text-[10px] text-muted-foreground">días</span>
                  </div>
                </div>
              ))}
            </div>
            <Button className="mt-4 gradient-gold text-primary font-body text-xs font-semibold shadow-gold hover:opacity-90 border-0 h-8 px-4">
              Guardar Cambios
            </Button>
          </div>
        ))}
      </div>
    </>
  );
};

/* ── Gestión de Abogados ── */
interface AbogadoRow {
  id: string;
  full_name: string;
  email: string;
  area_id: string | null;
  area_nombre?: string | null;
  phone: string | null;
  last_sign_in_at: string | null;
  sign_in_count: number | null;
}

const SeccionAbogados = () => {
  const { toast } = useToast();
  const [abogados, setAbogados] = useState<AbogadoRow[]>([]);
  const [clientes, setClientes] = useState<AbogadoRow[]>([]);
  const [areas, setAreas] = useState<{ id: string; nombre: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [createRole, setCreateRole] = useState<"abogado" | "cliente">("abogado");
  const [form, setForm] = useState({
    full_name: "", email: "", password: "", phone: "", cedula: "", area_id: "",
  });

  const load = async () => {
    setLoading(true);
    const [{ data: roleRows }, { data: aData }] = await Promise.all([
      supabase.from("user_roles").select("user_id, role").in("role", ["abogado", "cliente"]),
      supabase.from("areas_derecho").select("id, nombre").order("nombre"),
    ]);
    setAreas(aData ?? []);
    const ids = (roleRows ?? []).map((r) => r.user_id);
    if (ids.length === 0) { setAbogados([]); setClientes([]); setLoading(false); return; }
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, email, area_id, phone, last_sign_in_at, sign_in_count")
      .in("id", ids);
    const areaMap = new Map((aData ?? []).map((a) => [a.id, a.nombre]));
    const profMap = new Map(
      (data ?? []).map((p) => [p.id, { ...p, area_nombre: p.area_id ? areaMap.get(p.area_id) ?? null : null }]),
    );
    const abos: AbogadoRow[] = [];
    const clis: AbogadoRow[] = [];
    for (const r of roleRows ?? []) {
      const p = profMap.get(r.user_id);
      if (!p) continue;
      if (r.role === "abogado") abos.push(p as AbogadoRow);
      else if (r.role === "cliente") clis.push(p as AbogadoRow);
    }
    setAbogados(abos);
    setClientes(clis);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 8) {
      toast({ title: "Error", description: "Contraseña mínima de 8 caracteres", variant: "destructive" });
      return;
    }
    if (createRole === "abogado" && !form.area_id) {
      toast({ title: "Falta área", description: "Selecciona el área de derecho del abogado", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const payload = {
      full_name: form.full_name,
      email: form.email,
      password: form.password,
      phone: form.phone,
      cedula: form.cedula,
      area_id: createRole === "abogado" ? form.area_id : null,
      role: createRole,
    };
    const { data, error } = await supabase.functions.invoke("create-abogado", { body: payload });
    setSubmitting(false);
    if (error || (data as any)?.error) {
      toast({
        title: "No se pudo crear",
        description: (data as any)?.error ?? error?.message ?? "Error desconocido",
        variant: "destructive",
      });
      return;
    }
    const label = createRole === "cliente" ? "Cliente" : "Abogado";
    toast({ title: `${label} creado`, description: `${form.full_name} ya puede iniciar sesión.` });
    setForm({ full_name: "", email: "", password: "", phone: "", cedula: "", area_id: "" });
    setShowForm(false);
    load();
  };

  return (
    <>
      <SectionHeader title="Gestión de Usuarios" description="Crea cuentas de abogados y clientes, y supervisa el equipo" />

      <div className="mb-5 flex justify-end">
        <Button onClick={() => setShowForm(!showForm)} className="gradient-gold text-primary border-0">
          {showForm ? "Cancelar" : "+ Nueva cuenta"}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-card rounded-xl border border-border p-6 mb-6 space-y-4">
          <h3 className="font-display text-lg font-bold text-foreground">Crear nueva cuenta</h3>

          <div className="flex gap-2 p-1 bg-muted rounded-lg w-fit">
            <button
              type="button"
              onClick={() => setCreateRole("abogado")}
              className={`px-4 py-1.5 rounded-md text-sm font-body transition-colors ${
                createRole === "abogado" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              Abogado
            </button>
            <button
              type="button"
              onClick={() => setCreateRole("cliente")}
              className={`px-4 py-1.5 rounded-md text-sm font-body transition-colors ${
                createRole === "cliente" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              Cliente
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Nombre completo *</Label>
              <Input required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Email *</Label>
              <Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Contraseña inicial *</Label>
              <Input type="text" required minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Mín. 8 caracteres" />
            </div>
            {createRole === "abogado" && (
              <div className="space-y-1.5">
                <Label>Área de derecho *</Label>
                <Select value={form.area_id} onValueChange={(v) => setForm({ ...form, area_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecciona un área" /></SelectTrigger>
                  <SelectContent>
                    {areas.map((a) => (
                      <SelectItem key={a.id} value={a.id}>{a.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-1.5">
              <Label>Teléfono</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Cédula</Label>
              <Input value={form.cedula} onChange={(e) => setForm({ ...form, cedula: e.target.value })} />
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground">
            La persona podrá cambiar esta contraseña desde su panel después de iniciar sesión.
          </p>
          <Button type="submit" disabled={submitting} className="gradient-gold text-primary border-0">
            {submitting ? "Creando…" : `Crear ${createRole === "cliente" ? "Cliente" : "Abogado"}`}
          </Button>
        </form>
      )}

      {loading ? (
        <p className="font-body text-sm text-muted-foreground">Cargando…</p>
      ) : (
        <div className="space-y-8">
          <div>
            <h3 className="font-display text-base font-semibold text-foreground mb-3">Abogados ({abogados.length})</h3>
            {abogados.length === 0 ? (
              <div className="bg-card rounded-xl border border-border p-6 text-center">
                <p className="font-body text-sm text-muted-foreground">Aún no hay abogados registrados.</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {abogados.map((ab) => (
                  <div key={ab.id} className="bg-card rounded-xl border border-border p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                      <Users className="w-4 h-4 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-display text-sm font-semibold text-foreground">{ab.full_name}</p>
                      <p className="font-body text-xs text-muted-foreground">{ab.area_nombre ?? "Sin área"} · {ab.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-body text-[11px] text-muted-foreground">
                        {ab.last_sign_in_at
                          ? `Último acceso: ${new Date(ab.last_sign_in_at).toLocaleString("es-CO", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}`
                          : "Aún no ha iniciado sesión"}
                      </p>
                      <p className="font-body text-[10px] text-muted-foreground/70">
                        Inicios: {ab.sign_in_count ?? 0}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="font-display text-base font-semibold text-foreground mb-3">Clientes ({clientes.length})</h3>
            {clientes.length === 0 ? (
              <div className="bg-card rounded-xl border border-border p-6 text-center">
                <p className="font-body text-sm text-muted-foreground">Aún no hay clientes registrados.</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {clientes.map((c) => (
                  <div key={c.id} className="bg-card rounded-xl border border-border p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                      <Users className="w-4 h-4 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-display text-sm font-semibold text-foreground">{c.full_name}</p>
                      <p className="font-body text-xs text-muted-foreground">{c.email}{c.phone ? ` · ${c.phone}` : ""}</p>
                    </div>
                    <p className="font-body text-[11px] text-muted-foreground text-right">
                      {c.last_sign_in_at
                        ? `Último acceso: ${new Date(c.last_sign_in_at).toLocaleString("es-CO", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}`
                        : "Aún no ha iniciado sesión"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

/* ── Calendario General ── */
const SeccionCalendarioJefe = () => {
  const eventos = [
    { fecha: "15 Abr 2026", caso: "#2024-0847", abogado: "Dr. López", tipo: "Audiencia", hora: "9:00 AM" },
    { fecha: "18 Abr 2026", caso: "#2024-0912", abogado: "Dra. Torres", tipo: "Entrega de documentos", hora: "5:00 PM" },
    { fecha: "22 Abr 2026", caso: "#2024-0935", abogado: "Dr. López", tipo: "Audiencia virtual", hora: "10:30 AM" },
    { fecha: "25 Abr 2026", caso: "#2024-0950", abogado: "Dra. Torres", tipo: "Vencimiento de término", hora: "11:59 PM" },
  ];

  return (
    <>
      <SectionHeader title="Calendario General" description="Vista consolidada de audiencias, entregas y vencimientos de todo el bufete" />
      <div className="grid gap-4">
        {eventos.map((ev, i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <CalendarDays className="w-4 h-4 text-accent" />
              </div>
              <div>
                <p className="font-display text-base font-semibold text-foreground">{ev.tipo}</p>
                <p className="font-body text-xs text-muted-foreground">Caso {ev.caso} · {ev.abogado} · {ev.hora}</p>
              </div>
            </div>
            <p className="font-body text-sm font-medium text-foreground">{ev.fecha}</p>
          </div>
        ))}
      </div>
    </>
  );
};

/* ── Analítica ── */
const SeccionAnaliticaJefe = () => (
  <>
    <SectionHeader title="Analítica y KPIs" description="Indicadores de rendimiento del bufete completo" />
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {[
        { label: "Casos Activos", value: "124", trend: "+12%" },
        { label: "Tiempo Prom. Resolución", value: "45 días", trend: "-8%" },
        { label: "Tasa de Éxito", value: "94%", trend: "+2%" },
        { label: "Abogados Activos", value: "12", trend: "+1" },
      ].map((kpi) => (
        <div key={kpi.label} className="bg-card rounded-xl border border-border p-5">
          <p className="font-body text-xs text-muted-foreground uppercase tracking-wider">{kpi.label}</p>
          <p className="font-display text-2xl font-bold text-foreground mt-2">{kpi.value}</p>
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp className="w-3 h-3 text-accent" />
            <span className="font-body text-xs text-accent">{kpi.trend}</span>
          </div>
        </div>
      ))}
    </div>
    <div className="grid sm:grid-cols-2 gap-4">
      {[
        { label: "Casos por Especialidad", items: ["Civil: 42", "Laboral: 35", "Penal: 28", "Familiar: 19"] },
        { label: "Carga por Abogado", items: ["Dr. López: 8 casos", "Dra. Torres: 5 casos", "Dr. Ramírez: 3 casos"] },
      ].map((card) => (
        <div key={card.label} className="bg-card rounded-xl border border-border p-5">
          <p className="font-display text-base font-semibold text-foreground mb-3">{card.label}</p>
          <div className="space-y-2">
            {card.items.map((item) => (
              <div key={item} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <span className="font-body text-xs text-foreground">{item.split(":")[0]}</span>
                <span className="font-body text-xs font-medium text-accent">{item.split(":")[1]}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </>
);

/* ── Notificaciones ── */
const SeccionNotificacionesJefe = () => {
  const notifs = [
    { msg: "Dr. López envió caso #2024-0912 para revisión", tipo: "caso", tiempo: "Hace 30 min" },
    { msg: "Término próximo a vencer - Caso #2024-0950 (Dra. Torres)", tipo: "alerta", tiempo: "Hace 1 hora" },
    { msg: "Dra. Torres solicita reasignación del caso #2024-0935", tipo: "solicitud", tiempo: "Hace 2 horas" },
    { msg: "Nuevo documento cargado en caso #2024-0847", tipo: "documento", tiempo: "Hace 4 horas" },
  ];

  return (
    <>
      <SectionHeader title="Notificaciones" description="Alertas de casos, solicitudes de abogados y vencimientos" />
      <div className="grid gap-3">
        {notifs.map((n, i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-4 flex items-center gap-4">
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${n.tipo === "alerta" ? "bg-destructive" : n.tipo === "solicitud" ? "bg-yellow-500" : "bg-accent"}`} />
            <div className="flex-1">
              <p className="font-body text-sm text-foreground">{n.msg}</p>
              <p className="font-body text-[10px] text-muted-foreground mt-1">{n.tiempo}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

/* ── Configuración ── */
const SeccionConfiguracion = () => (
  <>
    <SectionHeader title="Configuración" description="Ajustes generales del sistema, roles y permisos" />
    <div className="grid gap-4">
      {[
        { label: "Notificaciones por correo", desc: "Enviar alertas de vencimientos y casos a abogados y clientes" },
        { label: "Registro de actividades", desc: "Historial de quién accedió o modificó información" },
        { label: "Políticas de confidencialidad", desc: "Gestión de acceso controlado por rol" },
      ].map((cfg) => (
        <div key={cfg.label} className="bg-card rounded-xl border border-border p-5 flex items-center justify-between">
          <div>
            <p className="font-display text-base font-semibold text-foreground">{cfg.label}</p>
            <p className="font-body text-xs text-muted-foreground mt-1">{cfg.desc}</p>
          </div>
          <Button variant="outline" size="sm" className="font-body text-xs">Configurar</Button>
        </div>
      ))}
    </div>
  </>
);

/* ── Próximos Vencimientos ── */
const SeccionVencimientos = () => {
  const vencimientos = [
    { caso: "#2024-0950", abogado: "Dra. Torres", cliente: "José Martínez", etapa: "Recaudo Probatorio", dias: 2, tipo: "Penal" },
    { caso: "#2024-0912", abogado: "Dr. López", cliente: "Carlos Ruiz", etapa: "Proyección", dias: 5, tipo: "Laboral" },
    { caso: "#2024-0847", abogado: "Dr. López", cliente: "María Fernández", etapa: "Revisión", dias: 9, tipo: "Civil" },
    { caso: "#2024-0935", abogado: "Dra. Torres", cliente: "Ana Pérez", etapa: "Audiencia", dias: 14, tipo: "Familiar" },
    { caso: "#2024-0901", abogado: "Dr. Ramírez", cliente: "Luis Gómez", etapa: "Pruebas", dias: 22, tipo: "Comercial" },
  ];

  const getColor = (d: number) =>
    d <= 3 ? "bg-destructive/10 text-destructive border-destructive/30" :
    d <= 7 ? "bg-warning/15 text-warning border-warning/30" :
    "bg-success/10 text-success border-success/30";

  return (
    <>
      <SectionHeader title="Próximos Vencimientos" description="Términos procesales que vencen en los próximos 30 días, ordenados por urgencia" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Vencen en ≤3 días", value: vencimientos.filter(v => v.dias <= 3).length, color: "text-destructive" },
          { label: "Vencen en ≤7 días", value: vencimientos.filter(v => v.dias <= 7).length, color: "text-warning" },
          { label: "Vencen en 8-30 días", value: vencimientos.filter(v => v.dias > 7).length, color: "text-success" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-card rounded-xl border border-border p-5">
            <p className="font-body text-xs text-muted-foreground uppercase tracking-wider">{kpi.label}</p>
            <p className={`font-display text-3xl font-bold mt-2 ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-3">
        {vencimientos.map((v) => (
          <div key={v.caso} className="bg-card rounded-xl border border-border p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center border ${getColor(v.dias)}`}>
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <p className="font-display text-base font-semibold text-foreground">Caso {v.caso} · {v.tipo}</p>
                <p className="font-body text-xs text-muted-foreground">{v.abogado} · {v.cliente} · Etapa: {v.etapa}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`font-display text-2xl font-bold ${v.dias <= 3 ? "text-destructive" : v.dias <= 7 ? "text-warning" : "text-success"}`}>
                {v.dias}
              </p>
              <p className="font-body text-[10px] text-muted-foreground uppercase tracking-wider">días restantes</p>
            </div>
            <Button variant="outline" size="sm" className="font-body text-xs">Ver caso</Button>
          </div>
        ))}
      </div>
    </>
  );
};

/* ── Comentarios Internos ── */
interface ComentarioRow {
  id: string;
  texto: string;
  case_id: string | null;
  abogado_id: string | null;
  author_id: string;
  created_at: string;
}

const SeccionComentarios = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [comentarios, setComentarios] = useState<ComentarioRow[]>([]);
  const [casos, setCasos] = useState<{ id: string; radicado: string; cliente_nombre: string; abogado_id: string | null }[]>([]);
  const [abogadosMap, setAbogadosMap] = useState<Record<string, string>>({});
  const [casoSel, setCasoSel] = useState("");
  const [nuevo, setNuevo] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data: casosData } = await supabase
      .from("cases").select("id, radicado, cliente_nombre, abogado_id").order("created_at", { ascending: false });
    setCasos((casosData ?? []) as any);

    const { data: profsData } = await supabase
      .from("profiles").select("id, full_name");
    const map: Record<string, string> = {};
    (profsData ?? []).forEach((p: any) => { map[p.id] = p.full_name; });
    setAbogadosMap(map);

    const { data } = await supabase
      .from("case_comments")
      .select("id, texto, case_id, abogado_id, author_id, created_at")
      .order("created_at", { ascending: false });
    setComentarios((data ?? []) as ComentarioRow[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const agregar = async () => {
    if (!user) return;
    if (!nuevo.trim() || !casoSel) {
      toast({ title: "Datos incompletos", description: "Selecciona un caso y escribe el comentario", variant: "destructive" });
      return;
    }
    const caso = casos.find((c) => c.id === casoSel);
    setSaving(true);
    const { error } = await supabase.from("case_comments").insert({
      texto: nuevo.trim(),
      author_id: user.id,
      case_id: casoSel,
      abogado_id: caso?.abogado_id ?? null,
    });
    setSaving(false);
    if (error) {
      toast({ title: "No se pudo guardar", description: error.message, variant: "destructive" });
      return;
    }
    setNuevo(""); setCasoSel("");
    load();
  };

  return (
    <>
      <SectionHeader title="Comentarios Internos" description="Notas privadas del director sobre casos y abogados. No visibles para clientes." />
      <div className="bg-card rounded-xl border border-border p-5 mb-6">
        <h3 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-accent" />
          Nuevo comentario
        </h3>
        <div className="grid gap-3">
          <Select value={casoSel} onValueChange={setCasoSel}>
            <SelectTrigger><SelectValue placeholder="Seleccionar caso" /></SelectTrigger>
            <SelectContent>
              {casos.length === 0 ? (
                <div className="px-3 py-2 text-xs text-muted-foreground">No hay casos creados aún</div>
              ) : (
                casos.map((c) => (
                  <SelectItem key={c.id} value={c.id}>#{c.radicado} — {c.cliente_nombre}</SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <Textarea placeholder="Escribe tu nota privada..." value={nuevo} onChange={(e) => setNuevo(e.target.value)} rows={3} />
          <Button onClick={agregar} disabled={saving} className="gradient-gold text-primary-foreground font-body font-semibold shadow-gold hover:opacity-90 border-0 self-start">
            {saving ? "Guardando…" : "Guardar comentario"}
          </Button>
        </div>
      </div>
      <div className="grid gap-3">
        {loading ? (
          <p className="font-body text-sm text-muted-foreground">Cargando…</p>
        ) : comentarios.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-8 text-center">
            <p className="font-body text-sm text-muted-foreground">Aún no hay comentarios.</p>
          </div>
        ) : (
          comentarios.map((c) => {
            const caso = casos.find((x) => x.id === c.case_id);
            const abogado = c.abogado_id ? abogadosMap[c.abogado_id] : "—";
            const autor = abogadosMap[c.author_id] ?? "Director";
            return (
              <div key={c.id} className="bg-card rounded-xl border border-border p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full gradient-navy flex items-center justify-center">
                      <Shield className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <p className="font-display text-sm font-semibold text-foreground">
                        {autor} · {caso ? `Caso #${caso.radicado}` : "Caso"}
                      </p>
                      <p className="font-body text-[10px] text-muted-foreground">
                        Sobre: {abogado} · {new Date(c.created_at).toLocaleString("es-CO")}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-body px-2 py-0.5 rounded-full bg-accent/10 text-accent font-medium">Privado</span>
                </div>
                <p className="font-body text-sm text-foreground leading-relaxed">{c.texto}</p>
              </div>
            );
          })
        )}
      </div>
    </>
  );
};

/* ── Dashboard Qlik (embed) ── */
const SeccionQlik = () => {
  const [qlikUrl, setQlikUrl] = useState("");
  const [embedded, setEmbedded] = useState("");

  return (
    <>
      <SectionHeader title="Dashboard Qlik" description="Integración con Qlik Sense para análisis avanzado y administración del bufete" />
      <div className="bg-card rounded-xl border border-border p-5 mb-6">
        <h3 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-accent" />
          Configuración del embed
        </h3>
        <p className="font-body text-xs text-muted-foreground mb-4">
          Pega la URL de tu app de Qlik Sense (Single Configurator o iframe URL). Asegúrate de que el dominio Jurova esté en la lista blanca de Qlik.
        </p>
        <div className="flex gap-3">
          <Input
            placeholder="https://tu-tenant.qlikcloud.com/single/?appid=..."
            value={qlikUrl}
            onChange={(e) => setQlikUrl(e.target.value)}
            className="flex-1"
          />
          <Button
            onClick={() => setEmbedded(qlikUrl)}
            className="gradient-gold text-primary-foreground font-body font-semibold shadow-gold hover:opacity-90 border-0"
          >
            Cargar
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-5 py-3 border-b border-border flex items-center justify-between bg-muted/30">
          <p className="font-body text-xs text-muted-foreground uppercase tracking-wider">Vista del dashboard</p>
          {embedded && <span className="font-body text-[10px] text-accent">● Conectado</span>}
        </div>
        {embedded ? (
          <iframe
            src={embedded}
            title="Qlik Dashboard"
            className="w-full h-[600px] border-0"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        ) : (
          <div className="h-[400px] flex flex-col items-center justify-center text-center p-8">
            <TrendingUp className="w-12 h-12 text-muted-foreground/40 mb-4" />
            <p className="font-display text-lg font-semibold text-foreground">Sin dashboard cargado</p>
            <p className="font-body text-sm text-muted-foreground mt-2 max-w-md">
              Pega la URL de tu app de Qlik Sense arriba y haz clic en "Cargar" para visualizar el dashboard de administración integral del bufete.
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default DashboardJefe;
