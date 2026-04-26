import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Scale, ArrowLeft, CalendarDays, CheckCircle, Clock, LogOut, KeyRound } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const DashboardCliente = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const handleLogout = async () => { await signOut(); navigate("/"); };

  const caso = {
    id: "2024-0847",
    etapa: "Proyección",
    tipo: "Civil",
    abogado: "Dr. Andrés López",
    proximaAudiencia: "15 Abr 2026",
    horaAudiencia: "9:00 AM",
  };

  const historial = [
    { fecha: "12 Mar 2026", evento: "Recaudo probatorio completado", done: true },
    { fecha: "08 Mar 2026", evento: "Caso creado y asignado", done: true },
  ];

  const fechas = [
    { fecha: "15 Abr 2026", descripcion: "Audiencia programada", hora: "9:00 AM" },
    { fecha: "22 Abr 2026", descripcion: "Entrega de alegatos", hora: "5:00 PM" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-navy border-b border-accent/10 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-accent" />
            <span className="font-display text-lg font-bold text-primary-foreground">Jurova</span>
            <span className="font-body text-[10px] text-primary-foreground/40 ml-2">Portal del Cliente</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/cambiar-password")}
              className="flex items-center gap-2 font-body text-xs text-primary-foreground/50 hover:text-accent transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5" />
              Cambiar contraseña
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 font-body text-xs text-primary-foreground/50 hover:text-primary-foreground transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Salir
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {/* Greeting */}
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Hola, María</h1>
          <p className="font-body text-sm text-muted-foreground mt-1">Aquí puedes ver el estado de tu caso</p>
        </div>

        {/* Case Status */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold text-foreground">Caso #{caso.id}</h2>
            <span className="text-xs font-body px-3 py-1 rounded-full bg-accent/10 text-accent font-medium">En curso</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-body text-xs text-muted-foreground">Etapa actual</p>
              <p className="font-body text-sm font-medium text-foreground mt-1">{caso.etapa}</p>
            </div>
            <div>
              <p className="font-body text-xs text-muted-foreground">Tipo de proceso</p>
              <p className="font-body text-sm font-medium text-foreground mt-1">{caso.tipo}</p>
            </div>
            <div>
              <p className="font-body text-xs text-muted-foreground">Abogado asignado</p>
              <p className="font-body text-sm font-medium text-foreground mt-1">{caso.abogado}</p>
            </div>
            <div>
              <p className="font-body text-xs text-muted-foreground">Próxima audiencia</p>
              <p className="font-body text-sm font-medium text-foreground mt-1">{caso.proximaAudiencia}</p>
            </div>
          </div>
        </div>

        {/* Upcoming Dates */}
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground mb-4">Fechas Importantes</h2>
          <div className="grid gap-3">
            {fechas.map((f, i) => (
              <div key={i} className="bg-card rounded-xl border border-border p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <CalendarDays className="w-4 h-4 text-accent" />
                </div>
                <div className="flex-1">
                  <p className="font-body text-sm font-medium text-foreground">{f.descripcion}</p>
                  <p className="font-body text-xs text-muted-foreground">{f.hora}</p>
                </div>
                <p className="font-body text-sm text-foreground font-medium">{f.fecha}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground mb-4">Historial del Proceso</h2>
          <div className="grid gap-3">
            {historial.map((h, i) => (
              <div key={i} className="flex items-center gap-3 bg-card rounded-xl border border-border p-4">
                <CheckCircle className="w-4 h-4 text-accent flex-shrink-0" />
                <div>
                  <p className="font-body text-sm text-foreground">{h.evento}</p>
                  <p className="font-body text-[10px] text-muted-foreground">{h.fecha}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCliente;
