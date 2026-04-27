import { useEffect, useRef, useState } from "react";
import * as tus from "tus-js-client";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, FileText, Download, Trash2, Send } from "lucide-react";

const MAX_FILE_SIZE = 250 * 1024 * 1024; // 250 MB
const RESUMABLE_THRESHOLD = 6 * 1024 * 1024; // > 6MB → usar TUS resumable

// Sube un archivo usando el protocolo TUS (resumable) — soporta archivos grandes.
async function uploadResumable(
  file: File,
  path: string,
  onProgress: (pct: number) => void,
): Promise<void> {
  const { data: sess } = await supabase.auth.getSession();
  const token = sess.session?.access_token;
  const url = import.meta.env.VITE_SUPABASE_URL as string;
  const anon = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
  if (!token) throw new Error("Sesión expirada, vuelve a iniciar sesión.");

  return new Promise((resolve, reject) => {
    const upload = new tus.Upload(file, {
      endpoint: `${url}/storage/v1/upload/resumable`,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      headers: {
        authorization: `Bearer ${token}`,
        "x-upsert": "false",
        apikey: anon,
      },
      uploadDataDuringCreation: true,
      removeFingerprintOnSuccess: true,
      metadata: {
        bucketName: "case-documents",
        objectName: path,
        contentType: file.type || "application/octet-stream",
        cacheControl: "3600",
      },
      chunkSize: 6 * 1024 * 1024, // 6 MB por chunk (recomendado por Supabase)
      onError: (err) => reject(err),
      onProgress: (sent, total) =>
        onProgress(Math.round((sent / total) * 100)),
      onSuccess: () => resolve(),
    });
    upload.start();
  });
}

interface AbogadoOpt {
  id: string;
  full_name: string;
  email: string;
}

interface CaseOpt {
  id: string;
  radicado: string;
  cliente_nombre: string;
}

interface DocRow {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  mime_type: string | null;
  description: string | null;
  shared_with_client: boolean;
  created_at: string;
  uploaded_by: string;
  recipient_id: string | null;
  case_id: string | null;
}

const formatBytes = (bytes: number | null) => {
  if (!bytes) return "—";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
};

export function GestionDocumentos({ mode }: { mode: "jefe" | "abogado" }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [abogados, setAbogados] = useState<AbogadoOpt[]>([]);
  const [casos, setCasos] = useState<CaseOpt[]>([]);
  const [docs, setDocs] = useState<DocRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const [recipient, setRecipient] = useState<string>("");
  const [caseId, setCaseId] = useState<string>("");
  const [description, setDescription] = useState("");
  const [sharedWithClient, setSharedWithClient] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const loadAll = async () => {
    setLoading(true);

    if (mode === "jefe") {
      // Load abogados list
      const { data: roleRows } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "abogado");
      const ids = (roleRows ?? []).map((r) => r.user_id);
      if (ids.length > 0) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .in("id", ids);
        setAbogados((profs ?? []) as AbogadoOpt[]);
      } else {
        setAbogados([]);
      }
    }

    // Load cases (RLS filters)
    const { data: casesData } = await supabase
      .from("cases")
      .select("id, radicado, cliente_nombre")
      .order("created_at", { ascending: false });
    setCasos((casesData ?? []) as CaseOpt[]);

    // Load documents (RLS filters)
    const { data: docsData } = await supabase
      .from("documents")
      .select(
        "id, file_name, file_path, file_size, mime_type, description, shared_with_client, created_at, uploaded_by, recipient_id, case_id",
      )
      .order("created_at", { ascending: false });
    setDocs((docsData ?? []) as DocRow[]);

    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, [mode]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast({
        title: "Selecciona un archivo",
        description: "Debes adjuntar un PDF o documento",
        variant: "destructive",
      });
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      toast({
        title: "Archivo muy grande",
        description: "Máximo 25 MB por archivo",
        variant: "destructive",
      });
      return;
    }
    if (!user) return;

    setUploading(true);

    const ext = file.name.split(".").pop() ?? "bin";
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${user.id}/${Date.now()}-${safeName}`;

    const { error: upErr } = await supabase.storage
      .from("case-documents")
      .upload(path, file, {
        cacheControl: "3600",
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    if (upErr) {
      setUploading(false);
      toast({
        title: "Error al subir",
        description: upErr.message,
        variant: "destructive",
      });
      return;
    }

    const insertPayload = {
      uploaded_by: user.id,
      recipient_id: recipient || null,
      case_id: caseId || null,
      file_name: file.name,
      file_path: path,
      file_size: file.size,
      mime_type: file.type || null,
      description: description || null,
      shared_with_client: sharedWithClient,
    };

    const { error: dbErr } = await supabase
      .from("documents")
      .insert(insertPayload);

    setUploading(false);

    if (dbErr) {
      toast({
        title: "Documento subido pero no registrado",
        description: dbErr.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Documento enviado",
      description: `${file.name} se cargó correctamente.`,
    });
    setFile(null);
    setDescription("");
    setRecipient("");
    setCaseId("");
    setSharedWithClient(false);
    if (fileRef.current) fileRef.current.value = "";
    loadAll();
  };

  const handleDownload = async (d: DocRow) => {
    const { data, error } = await supabase.storage
      .from("case-documents")
      .createSignedUrl(d.file_path, 60);
    if (error || !data?.signedUrl) {
      toast({
        title: "No se pudo descargar",
        description: error?.message ?? "Error desconocido",
        variant: "destructive",
      });
      return;
    }
    window.open(data.signedUrl, "_blank");
  };

  const handleDelete = async (d: DocRow) => {
    if (!confirm(`¿Eliminar "${d.file_name}"? Esta acción es definitiva.`))
      return;
    await supabase.storage.from("case-documents").remove([d.file_path]);
    const { error } = await supabase.from("documents").delete().eq("id", d.id);
    if (error) {
      toast({
        title: "Error al eliminar",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    toast({ title: "Documento eliminado" });
    loadAll();
  };

  const onPickFile = () => fileRef.current?.click();
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0] ?? null;
    if (f) setFile(f);
  };

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleUpload}
        className="bg-card rounded-xl border border-border p-6 space-y-4"
      >
        <div>
          <h3 className="font-display text-lg font-bold text-foreground">
            {mode === "jefe"
              ? "Enviar documento a un abogado"
              : "Subir documento al expediente"}
          </h3>
          <p className="font-body text-xs text-muted-foreground mt-1">
            Los archivos se almacenan de forma segura y solo son visibles para
            las personas autorizadas.
          </p>
        </div>

        <div
          onClick={onPickFile}
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-border hover:border-accent/50 rounded-xl p-8 text-center cursor-pointer transition-colors"
        >
          <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          {file ? (
            <>
              <p className="font-display text-base font-semibold text-foreground">
                {file.name}
              </p>
              <p className="font-body text-xs text-muted-foreground mt-1">
                {formatBytes(file.size)} · Click para cambiar
              </p>
            </>
          ) : (
            <>
              <p className="font-display text-base font-semibold text-foreground">
                Arrastra un archivo aquí
              </p>
              <p className="font-body text-xs text-muted-foreground mt-1">
                o haz clic para seleccionar (PDF, DOCX, JPG · máx 25 MB)
              </p>
            </>
          )}
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            onChange={onFileChange}
            className="hidden"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {mode === "jefe" && (
            <div className="space-y-1.5">
              <Label className="font-body text-sm">
                Abogado destinatario (opcional)
              </Label>
              <Select value={recipient} onValueChange={setRecipient}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar abogado" />
                </SelectTrigger>
                <SelectContent>
                  {abogados.length === 0 ? (
                    <div className="px-3 py-2 text-xs text-muted-foreground">
                      No hay abogados registrados aún
                    </div>
                  ) : (
                    abogados.map((ab) => (
                      <SelectItem key={ab.id} value={ab.id}>
                        {ab.full_name} — {ab.email}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="font-body text-sm">Caso asociado (opcional)</Label>
            <Select value={caseId} onValueChange={setCaseId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar caso" />
              </SelectTrigger>
              <SelectContent>
                {casos.length === 0 ? (
                  <div className="px-3 py-2 text-xs text-muted-foreground">
                    No hay casos disponibles
                  </div>
                ) : (
                  casos.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      #{c.radicado} — {c.cliente_nombre}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="font-body text-sm">Descripción (opcional)</Label>
          <Textarea
            rows={2}
            placeholder="Notas o instrucciones sobre el documento…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={sharedWithClient}
            onChange={(e) => setSharedWithClient(e.target.checked)}
            className="rounded border-border accent-[hsl(var(--accent))]"
          />
          <span className="font-body text-xs text-muted-foreground">
            Compartir también con el cliente del caso
          </span>
        </label>

        <Button
          type="submit"
          disabled={uploading}
          className="gradient-gold text-primary border-0 font-body font-semibold shadow-gold gap-2"
        >
          {mode === "jefe" ? <Send className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
          {uploading ? "Subiendo…" : mode === "jefe" ? "Enviar documento" : "Subir documento"}
        </Button>
      </form>

      <div>
        <h3 className="font-display text-lg font-bold text-foreground mb-4">
          Documentos {mode === "jefe" ? "del bufete" : "asignados a ti"}
        </h3>
        {loading ? (
          <p className="font-body text-sm text-muted-foreground">Cargando…</p>
        ) : docs.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-8 text-center">
            <FileText className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="font-body text-sm text-muted-foreground">
              Aún no hay documentos cargados.
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {docs.map((d) => {
              const isMine = user?.id === d.uploaded_by;
              return (
                <div
                  key={d.id}
                  className="bg-card rounded-xl border border-border p-4 flex items-center gap-4"
                >
                  <div className="w-11 h-11 rounded-lg gradient-navy flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-sm font-semibold text-foreground truncate">
                      {d.file_name}
                    </p>
                    <p className="font-body text-[11px] text-muted-foreground">
                      {formatBytes(d.file_size)} ·{" "}
                      {new Date(d.created_at).toLocaleString("es-CO")}
                      {d.shared_with_client && " · Compartido con cliente"}
                    </p>
                    {d.description && (
                      <p className="font-body text-xs text-foreground/70 mt-1 truncate">
                        {d.description}
                      </p>
                    )}
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownload(d)}
                    className="font-body text-xs gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Descargar
                  </Button>
                  {(isMine || mode === "jefe") && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(d)}
                      className="font-body text-xs border-destructive/30 text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
