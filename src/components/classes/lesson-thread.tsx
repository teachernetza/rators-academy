import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, MessageSquare, Send, Trash2, Megaphone } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import {
  type ClassLesson, listLessonMessages, addLessonMessage, deleteLessonMessage, staffNames, latestAnnouncement,
} from "@/lib/classes";

/** Conversación corta de una lección entre teacher/admin y el alumno. */
export function LessonThread({ lesson }: { lesson: ClassLesson }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const msgsQ = useQuery({ queryKey: ["classes", "msgs", lesson.student_id], queryFn: () => listLessonMessages(lesson.student_id) });
  const namesQ = useQuery({ queryKey: ["classes", "staffnames"], queryFn: staffNames });
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const msgs = (msgsQ.data ?? []).filter((m) => m.lesson_id === lesson.id);

  const send = async () => {
    if (!user || !text.trim()) return;
    setBusy(true);
    try {
      await addLessonMessage(lesson, user.id, text.trim());
      setText("");
      qc.invalidateQueries({ queryKey: ["classes", "msgs", lesson.student_id] });
    } catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
  };
  const who = (id: string) => (id === user?.id ? "Tú" : id === lesson.student_id ? "Alumno" : namesQ.data?.[id] ?? "Teacher");

  return (
    <div className="space-y-2 rounded-lg border border-border p-3">
      <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"><MessageSquare className="h-3.5 w-3.5" />Mensajes de la lección</p>
      {msgs.length === 0 && <p className="text-xs text-muted-foreground">Sin mensajes. Escribe dudas, notas o material.</p>}
      {msgs.map((m) => (
        <div key={m.id} className={`group rounded-md px-2.5 py-1.5 text-sm ${m.author_id === user?.id ? "bg-primary/10" : "bg-muted"}`}>
          <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
            <span className="font-medium">{who(m.author_id)} · {new Date(m.created_at).toLocaleString("es-MX", { dateStyle: "short", timeStyle: "short" })}</span>
            {m.author_id === user?.id && (
              <button aria-label="Borrar mensaje" className="opacity-60 hover:text-destructive hover:opacity-100" onClick={async () => {
                try { await deleteLessonMessage(m.id); qc.invalidateQueries({ queryKey: ["classes", "msgs", lesson.student_id] }); } catch (e: any) { toast.error(e.message); }
              }}><Trash2 className="h-3 w-3" /></button>
            )}
          </div>
          <p className="whitespace-pre-wrap">{m.body}</p>
        </div>
      ))}
      <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); send(); }}>
        <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Escribe un mensaje…" maxLength={2000} />
        <Button type="submit" size="icon" disabled={busy || !text.trim()} aria-label="Enviar">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </form>
    </div>
  );
}

/** Aviso general más reciente, en una línea arriba del Inicio. */
export function AnnouncementBanner() {
  const q = useQuery({ queryKey: ["classes", "announcement"], queryFn: latestAnnouncement });
  if (!q.data) return null;
  return (
    <div className="flex items-start gap-3 rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm">
      <Megaphone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <div className="min-w-0">
        <p className="font-semibold">{q.data.title}</p>
        {q.data.body && <p className="line-clamp-2 text-muted-foreground">{q.data.body}</p>}
      </div>
    </div>
  );
}
