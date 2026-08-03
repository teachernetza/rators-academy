// "Constancia de Nivel" (level certificate) PDF generator.
// jsPDF vector primitives, landscape A4. Client-only.
import {
  CEFR_SCALE,
  CEFR_DESCRIPTION,
  CEFR_VALUE,
  type ExamResult,
} from "./diagnostic-bank";

type Payload = {
  studentName: string;
  result: ExamResult;
};

const TEAL: [number, number, number] = [15, 59, 75];
const TEAL_LIGHT: [number, number, number] = [30, 92, 112];
const MINT: [number, number, number] = [86, 214, 178];
const SLATE: [number, number, number] = [100, 116, 139];
const CREAM: [number, number, number] = [248, 251, 250];

async function loadLogo(): Promise<string | null> {
  try {
    const res = await fetch("/logo_teacher_netza.png");
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise<string>((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve(String(fr.result));
      fr.onerror = reject;
      fr.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function folio(name: string) {
  const base = `${name}-${Date.now()}`;
  let h = 0;
  for (let i = 0; i < base.length; i++) h = (h * 31 + base.charCodeAt(i)) >>> 0;
  return `TN-${h.toString(36).toUpperCase().padStart(7, "0").slice(0, 7)}`;
}

export async function generateDiagnosticPdf({ studentName, result }: Payload) {
  const { default: JsPDF } = await import("jspdf");
  const doc = new JsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  const W = 297;
  const H = 210;

  // Background
  doc.setFillColor(...CREAM);
  doc.rect(0, 0, W, H, "F");

  // Top band
  doc.setFillColor(...TEAL);
  doc.rect(0, 0, W, 34, "F");
  doc.setFillColor(...MINT);
  doc.rect(0, 34, W, 1.6, "F");

  // Corner ornament (bottom-left, away from the text blocks)
  doc.setFillColor(...MINT);
  doc.circle(2, H - 2, 22, "F");
  doc.setFillColor(...CREAM);
  doc.circle(2, H - 2, 18, "F");


  // Double frame
  doc.setDrawColor(...TEAL);
  doc.setLineWidth(0.9);
  doc.rect(8, 8, W - 16, H - 16);
  doc.setDrawColor(...MINT);
  doc.setLineWidth(0.35);
  doc.rect(11, 11, W - 22, H - 22);

  // Logo / branding
  const logo = await loadLogo();
  if (logo) {
    try {
      doc.addImage(logo, "PNG", 16, 6, 22, 22);
    } catch {
      /* ignore */
    }
  }
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text("Teacher Netza Varo", logo ? 42 : 18, 17);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Rators Academy · English Coaching", logo ? 42 : 18, 23.5);
  doc.setFontSize(8);
  doc.text(
    new Date().toLocaleDateString("es-MX", { dateStyle: "long" }),
    W - 18,
    23.5,
    { align: "right" },
  );
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("CONSTANCIA", W - 18, 17, { align: "right" });

  // Title
  doc.setTextColor(...TEAL);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text("Constancia de Nivel de Inglés", W / 2, 52, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...SLATE);
  doc.text("Se otorga la presente constancia a", W / 2, 61, { align: "center" });

  // Student name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(30);
  doc.setTextColor(...TEAL_LIGHT);
  doc.text(studentName || "Alumno", W / 2, 76, { align: "center" });
  doc.setDrawColor(...MINT);
  doc.setLineWidth(0.7);
  doc.line(W / 2 - 55, 80.5, W / 2 + 55, 80.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...SLATE);
  doc.text(
    "por haber completado el Examen Diagnóstico de Inglés, obteniendo el siguiente resultado:",
    W / 2,
    88,
    { align: "center" },
  );

  // Overall seal (left)
  const sealX = 58;
  const sealY = 130;
  doc.setFillColor(...TEAL);
  doc.circle(sealX, sealY, 30, "F");
  doc.setDrawColor(...MINT);
  doc.setLineWidth(1);
  doc.circle(sealX, sealY, 33);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("NIVEL GENERAL", sealX, sealY - 12, { align: "center" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(38);
  doc.text(result.overall, sealX, sealY + 6, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Marco Común Europeo", sealX, sealY + 17, { align: "center" });

  // Description under seal
  doc.setTextColor(...SLATE);
  doc.setFontSize(8.5);
  const desc = doc.splitTextToSize(CEFR_DESCRIPTION[result.overall], 74) as string[];
  desc.forEach((line, i) => doc.text(line, sealX, sealY + 40 + i * 4.2, { align: "center" }));

  // Section breakdown (right)
  const boxX = 108;
  const boxW = W - boxX - 22;
  let y = 100;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...TEAL);
  doc.text("Desglose por habilidad", boxX, y);
  y += 6;

  result.sections.forEach((s) => {
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(boxX, y, boxW, 22, 2.5, 2.5, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...TEAL);
    doc.text(s.label, boxX + 6, y + 8);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...TEAL_LIGHT);
    doc.text(s.level, boxX + boxW - 6, y + 9.5, { align: "right" });

    // Scale bar A1..C1
    const barX = boxX + 6;
    const barW = boxW - 12;
    const barY = y + 14;
    doc.setFillColor(233, 240, 240);
    doc.roundedRect(barX, barY, barW, 3.4, 1.7, 1.7, "F");
    const pos = Math.max(0.08, CEFR_VALUE[s.level] / 5);
    doc.setFillColor(...MINT);
    doc.roundedRect(barX, barY, barW * pos, 3.4, 1.7, 1.7, "F");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(...SLATE);
    CEFR_SCALE.forEach((lvl, i) => {
      doc.text(lvl, barX + (barW / 5) * (i + 0.5), barY + 7, { align: "center" });
    });

    y += 26;
  });

  // Footer: signature + folio
  doc.setDrawColor(...TEAL);
  doc.setLineWidth(0.4);
  doc.line(boxX + 6, H - 26, boxX + 70, H - 26);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...TEAL);
  doc.text("Teacher Netza Varo", boxX + 6, H - 21);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...SLATE);
  doc.text("Instructor certificado · Rators Academy", boxX + 6, H - 17);

  const serial = folio(studentName);
  doc.setFontSize(7.5);
  doc.text(`Folio: ${serial}`, W - 22, H - 21, { align: "right" });
  doc.text("Válido como diagnóstico orientativo", W - 22, H - 17, { align: "right" });

  const safe = (studentName || "alumno").replace(/[^a-z0-9]/gi, "_").toLowerCase();
  doc.save(`constancia_nivel_ingles_${safe}.pdf`);
}
