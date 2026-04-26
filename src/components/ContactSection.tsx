import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const ContactSection = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({ nombre: "", email: "", motivo: "", telefono: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Solicitud enviada", description: "Nos pondremos en contacto contigo pronto." });
    setForm({ nombre: "", email: "", motivo: "", telefono: "" });
  };

  return (
    <section className="gradient-navy py-20">
      <div className="container mx-auto px-6">
        <div className="max-w-xl mx-auto text-center mb-10">
          <p className="font-body text-sm uppercase tracking-widest text-accent mb-3">¡Déjanos ayudarte!</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground">
            Solicitar una llamada para cualquier tipo de ayuda
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-4">
          <input
            type="text"
            placeholder="Nombre Completo"
            required
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            className="w-full px-4 py-3 rounded-lg bg-primary-foreground/10 border border-accent/20 text-primary-foreground placeholder:text-primary-foreground/40 font-body focus:outline-none focus:border-accent/50"
          />
          <input
            type="email"
            placeholder="Ingresa tu email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-4 py-3 rounded-lg bg-primary-foreground/10 border border-accent/20 text-primary-foreground placeholder:text-primary-foreground/40 font-body focus:outline-none focus:border-accent/50"
          />
          <select
            required
            value={form.motivo}
            onChange={(e) => setForm({ ...form, motivo: e.target.value })}
            className="w-full px-4 py-3 rounded-lg bg-primary-foreground/10 border border-accent/20 text-primary-foreground font-body focus:outline-none focus:border-accent/50"
          >
            <option value="" className="text-foreground">Motivo de consulta</option>
            <option value="consulta" className="text-foreground">Consulta</option>
            <option value="seguimiento" className="text-foreground">Seguimiento de caso</option>
            <option value="informacion" className="text-foreground">Solicitar información</option>
          </select>
          <input
            type="tel"
            placeholder="Tu teléfono"
            required
            value={form.telefono}
            onChange={(e) => setForm({ ...form, telefono: e.target.value })}
            className="w-full px-4 py-3 rounded-lg bg-primary-foreground/10 border border-accent/20 text-primary-foreground placeholder:text-primary-foreground/40 font-body focus:outline-none focus:border-accent/50"
          />
          <button
            type="submit"
            className="w-full gradient-gold text-primary font-body font-semibold px-8 py-4 rounded-lg shadow-gold hover:opacity-90 transition-opacity"
          >
            Enviar
          </button>
        </form>
      </div>
    </section>
  );
};

export default ContactSection;
