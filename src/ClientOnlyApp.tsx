import { useEffect, useState, type ComponentType } from "react";

let CachedApp: ComponentType | null = null;

export function ClientOnlyApp() {
  const [App, setApp] = useState<ComponentType | null>(CachedApp);

  useEffect(() => {
    if (CachedApp) {
      setApp(() => CachedApp!);
      return;
    }
    let active = true;
    import("@/App").then((m) => {
      CachedApp = m.default;
      if (active) setApp(() => m.default);
    });
    return () => {
      active = false;
    };
  }, []);

  if (!App) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg,#0e1730,#1E2E4F,#3a4974)",
          display: "grid",
          placeItems: "center",
          color: "#DED3BC",
          fontFamily: "Lato, sans-serif",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Jurova Legal Group</div>
          <div style={{ marginTop: 8, fontSize: 14, opacity: 0.8 }}>Cargando plataforma…</div>
        </div>
      </div>
    );
  }

  return <App />;
}
