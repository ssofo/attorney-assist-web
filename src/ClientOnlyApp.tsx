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
        }}
      />
    );
  }

  return <App />;
}
