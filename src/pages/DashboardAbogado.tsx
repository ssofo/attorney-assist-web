import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { KeyRound } from "lucide-react";
import {
  Scale,
  Briefcase,
  CalendarDays,
  BarChart3,
  Upload,
  Bell,
  Users,
  Clock,
  LogOut,
  Menu,
  X,
  ChevronRight,
  FileText,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

const menuItems = [
  { id: "casos", icon: Briefcase, label: "Gestión de Casos" },
  { id: "calendario", icon: CalendarDays, label: "Calendario de Audiencias" },
  { id: "terminos", icon: Clock, label: "Control de Términos" },
  { id: "documentos", icon: Upload, label: "Gestión Documental" },
  { id: "analitica", icon: BarChart3, label: "Analítica y KPIs" },
  { id: "notificaciones", icon: Bell, label: "Notificaciones" },
  { id: "clientes", icon: Users, label: "Clientes" },
];

const DashboardAbogado = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("casos");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { signOut } = useAuth();
  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 gradient-navy flex-col border-r border-accent/10 fixed inset-y-0 left-0 z-30">
        <div className="p-5 border-b border-accent/10">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-accent" />
            <span className="font-display text-lg font-bold text-primary-foreground">Jurova</span>
          </div>
          <p className="font-body text-[10px] text-primary-foreground/40 mt-1">Panel del Abogado</p>
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
        <div className="p-3 border-t border-accent/10 space-y-1">
          <button
            onClick={() => navigate("/cambiar-password")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-body text-sm text-primary-foreground/60 hover:text-primary-foreground hover:bg-accent/5 transition-colors"
          >
            <KeyRound className="w-4 h-4" />
            Cambiar contraseña
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-body text-sm text-primary-foreground/40 hover:text-primary-foreground hover:bg-accent/5 transition-colors"
          >
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

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-30">
          <div className="absolute inset-0 bg-foreground/50" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-14 bottom-0 w-64 gradient-navy border-r border-accent/10 flex flex-col">
            <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    setSidebarOpen(false);
                  }}
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
            <div className="p-3 border-t border-accent/10 space-y-1">
              <button
                onClick={() => { navigate("/cambiar-password"); setSidebarOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-body text-sm text-primary-foreground/60 hover:text-primary-foreground hover:bg-accent/5 transition-colors"
              >
                <KeyRound className="w-4 h-4" />
                Cambiar contraseña
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-body text-sm text-primary-foreground/40 hover:text-primary-foreground hover:bg-accent/5 transition-colors"
              >
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
          {activeSection === "casos" && <SeccionCasos />}
          {activeSection === "calendario" && <SeccionCalendario />}
          {activeSection === "terminos" && <SeccionTerminos />}
          {activeSection === "documentos" && <SeccionDocumentos />}
          {activeSection === "analitica" && <SeccionAnalitica />}
          {activeSection === "notificaciones" && <SeccionNotificaciones />}
          {activeSection === "clientes" && <SeccionClientes />}
        </div>
      </main>
    </div>
  );
};

/* ── Section Components ── */

const SectionHeader = ({ title, description }: { title: string; description: string }) => (
  <div className="mb-8">
    <h1 className="font-display text-3xl font-bold text-foreground">{title}</h1>
    <p className="font-body text-sm text-muted-foreground mt-2">{description}</p>
  </div>
);

const SeccionCasos = () => {
  const casos = [
    { id: "2024-0847", cliente: "María Fernández", etapa: "Proyección", tipo: "Civil", urgente: false },
    { id: "2024-0912", cliente: "Carlos Ruiz", etapa: "Recaudo Probatorio", tipo: "Laboral", urgente: true },
    { id: "2024-0935", cliente: "Ana Gómez", etapa: "Revisión", tipo: "Familiar", urgente: false },
    { id: "2024-0950", cliente: "José Martínez", etapa: "Creación", tipo: "Penal", urgente: true },
  ];

  return (
    <>
      <SectionHeader title="Gestión de Casos" description="Administra todos los casos asignados y su flujo de trabajo" />
      <div className="grid gap-4">
        {casos.map((caso) => (
          <div key={caso.id} className="bg-card rounded-xl border border-border p-5 hover:border-accent/30 hover:shadow-luxury transition-all cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg gradient-navy flex items-center justify-center">
                  <FileText className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-display text-base font-semibold text-foreground">Caso #{caso.id}</p>
                    {caso.urgente && (
                      <span className="text-[10px] font-body px-2 py-0.5 rounded-full bg-destructive/10 text-destructive font-medium">Urgente</span>
                    )}
                  </div>
                  <p className="font-body text-xs text-muted-foreground">{caso.cliente} · {caso.tipo}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-body px-3 py-1 rounded-full bg-accent/10 text-accent font-medium">{caso.etapa}</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

const SeccionCalendario = () => {
  const eventos = [
    { fecha: "15 Abr 2026", caso: "#2024-0847", tipo: "Audiencia", hora: "9:00 AM", link: true },
    { fecha: "18 Abr 2026", caso: "#2024-0912", tipo: "Entrega de documentos", hora: "5:00 PM", link: false },
    { fecha: "22 Abr 2026", caso: "#2024-0935", tipo: "Audiencia virtual", hora: "10:30 AM", link: true },
  ];

  return (
    <>
      <SectionHeader title="Calendario de Audiencias" description="Fechas de audiencias, links de videoconferencia y plazos de entrega" />
      <div className="grid gap-4">
        {eventos.map((ev, i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <CalendarDays className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <p className="font-display text-base font-semibold text-foreground">{ev.tipo}</p>
                  <p className="font-body text-xs text-muted-foreground">Caso {ev.caso} · {ev.hora}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-body text-sm font-medium text-foreground">{ev.fecha}</p>
                {ev.link && <p className="font-body text-[10px] text-accent underline cursor-pointer mt-1">Abrir link de videoconferencia</p>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

const SeccionTerminos = () => {
  const terminos = [
    { caso: "#2024-0847", etapa: "Proyección", diasRestantes: 3, total: 10 },
    { caso: "#2024-0912", etapa: "Recaudo Probatorio", diasRestantes: 1, total: 15 },
    { caso: "#2024-0935", etapa: "Revisión", diasRestantes: 7, total: 8 },
  ];

  return (
    <>
      <SectionHeader title="Control de Términos" description="Monitorea los plazos procesales de cada caso y área" />
      <div className="grid gap-4">
        {terminos.map((t, i) => {
          const pct = ((t.total - t.diasRestantes) / t.total) * 100;
          const urgente = t.diasRestantes <= 2;
          return (
            <div key={i} className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {urgente && <AlertTriangle className="w-4 h-4 text-destructive" />}
                  <div>
                    <p className="font-display text-base font-semibold text-foreground">Caso {t.caso}</p>
                    <p className="font-body text-xs text-muted-foreground">{t.etapa}</p>
                  </div>
                </div>
                <span className={`font-body text-sm font-semibold ${urgente ? "text-destructive" : "text-foreground"}`}>
                  {t.diasRestantes} días restantes
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-muted">
                <div
                  className={`h-2 rounded-full transition-all ${urgente ? "bg-destructive" : "bg-accent"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

import { GestionDocumentos } from "@/components/GestionDocumentos";

const SeccionDocumentos = () => (
  <>
    <SectionHeader title="Gestión Documental" description="Sube y descarga documentos vinculados a tus casos. Acceso controlado por rol." />
    <GestionDocumentos mode="abogado" />
  </>
);

const SeccionAnalitica = () => (
  <>
    <SectionHeader title="Analítica y KPIs" description="Indicadores de rendimiento del bufete y carga laboral" />
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {[
        { label: "Casos Activos", value: "124", trend: "+12%" },
        { label: "Tiempo Promedio Resolución", value: "45 días", trend: "-8%" },
        { label: "Tasa de Éxito", value: "94%", trend: "+2%" },
        { label: "Carga Promedio", value: "8 casos", trend: "0%" },
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
  </>
);

const SeccionNotificaciones = () => {
  const notifs = [
    { msg: "Audiencia del caso #2024-0847 en 2 días", tipo: "audiencia", tiempo: "Hace 1 hora" },
    { msg: "Documento pendiente de revisión - Caso #2024-0912", tipo: "documento", tiempo: "Hace 3 horas" },
    { msg: "Término procesal próximo a vencer - Caso #2024-0912", tipo: "alerta", tiempo: "Hace 5 horas" },
    { msg: "Nuevo caso asignado: #2024-0950", tipo: "caso", tiempo: "Ayer" },
  ];

  return (
    <>
      <SectionHeader title="Notificaciones" description="Alertas de casos, términos y documentos pendientes" />
      <div className="grid gap-3">
        {notifs.map((n, i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-4 flex items-center gap-4">
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${n.tipo === "alerta" ? "bg-destructive" : "bg-accent"}`} />
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

const SeccionClientes = () => {
  const clientes = [
    { nombre: "María Fernández", cedula: "1.023.456.789", casosActivos: 1 },
    { nombre: "Carlos Ruiz", cedula: "1.098.765.432", casosActivos: 2 },
    { nombre: "Ana Gómez", cedula: "1.045.678.901", casosActivos: 1 },
  ];

  return (
    <>
      <SectionHeader title="Clientes" description="Directorio de clientes y sus casos asociados" />
      <div className="grid gap-4">
        {clientes.map((c) => (
          <div key={c.cedula} className="bg-card rounded-xl border border-border p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                <Users className="w-4 h-4 text-accent" />
              </div>
              <div>
                <p className="font-display text-base font-semibold text-foreground">{c.nombre}</p>
                <p className="font-body text-xs text-muted-foreground">CC {c.cedula}</p>
              </div>
            </div>
            <span className="font-body text-xs px-3 py-1 rounded-full bg-accent/10 text-accent">{c.casosActivos} caso(s)</span>
          </div>
        ))}
      </div>
    </>
  );
};

export default DashboardAbogado;
