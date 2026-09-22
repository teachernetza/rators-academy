// "Constancia de Nivel" (level certificate) PDF generator.
// Page 1: certificate. Page 2: detailed analysis.
// jsPDF vector primitives, landscape A4. Client-only.
import {
  CEFR_SCALE,
  CEFR_DESCRIPTION,
  CEFR_VALUE,
  type Cefr,
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
const LINE: [number, number, number] = [222, 232, 234];

const W = 297;
const H = 210;

/** What the learner can do, per skill and level. */
const CAPABILITY: Record<string, Record<Cefr, string>> = {
  listening: {
    A1: "Reconoces palabras y frases muy sencillas cuando se habla despacio.",
    A2: "Entiendes lo esencial de conversaciones cotidianas y avisos cortos.",
    B1: "Sigues conversaciones claras sobre trabajo, estudio y vida diaria.",
    B2: "Comprendes discusiones extensas y argumentos con vocabulario técnico.",
    C1: "Captas matices, ironía e implicaciones en audio rápido y espontáneo.",
  },
  reading: {
    A1: "Identificas nombres, palabras y frases básicas en textos muy cortos.",
    A2: "Comprendes textos breves con vocabulario frecuente y directo.",
    B1: "Entiendes textos claros sobre temas conocidos y descripciones.",
    B2: "Interpretas artículos complejos y distingues postura del autor.",
    C1: "Lees textos largos y especializados detectando implicaciones sutiles.",
  },
  vocabulary: {
    A1: "Usas vocabulario básico y estructuras memorizadas.",
    A2: "Manejas estructuras simples y conectores frecuentes.",
    B1: "Aplicas tiempos verbales y colocaciones comunes con seguridad.",
    B2: "Empleas gramática avanzada, modismos y registro apropiado.",
    C1: "Usas el idioma con precisión idiomática y control estilístico.",
  },
};

const RECOMMENDATION: Record<Cefr, string> = {
  A1: "Recomendación: base sólida de vocabulario y presente simple, con práctica oral guiada.",
  A2: "Recomendación: ampliar tiempos verbales y fluidez en situaciones cotidianas.",
  B1: "Recomendación: trabajar precisión gramatical, escucha extensiva y expresión de opiniones.",
  B2: "Recomendación: pulir matices, modismos y discurso argumentativo en contextos profesionales.",
  C1: "Recomendación: mantenimiento avanzado con contenido auténtico y registro especializado.",
};

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

  const name = studentName || "Alumno";
  const serial = folio(name);
  const logo = await loadLogo();
  const dateStr = new Date().toLocaleDateString("es-MX", { dateStyle: "long" });
  const modeName = result.mode === "quick" ? "Examen rápido" : "Examen completo";
  const modeTime = result.mode === "quick" ? "~7 min" : "15–20 min";

  /** Brand mark in the top-left corner of a page. */
  const brandCorner = (light: boolean) => {
    if (logo) {
      try {
        doc.addImage(logo, "PNG", 14, 12, 16, 16);
      } catch {
        /* ignore */
      }
    }
    const x = logo ? 33 : 14;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...(light ? ([255, 255, 255] as [number, number, number]) : TEAL));
    doc.text("Teacher Netza Varo", x, 19);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...(light ? ([214, 236, 232] as [number, number, number]) : SLATE));
    doc.text("Rators Academy · English Coaching", x, 24);
  };

  /* ============================ PAGE 1 ============================ */
  doc.setFillColor(...CREAM);
  doc.rect(0, 0, W, H, "F");

  // Frames
  doc.setDrawColor(...TEAL);
  doc.setLineWidth(0.9);
  doc.rect(8, 8, W - 16, H - 16);
  doc.setDrawColor(...MINT);
  doc.setLineWidth(0.35);
  doc.rect(11, 11, W - 22, H - 22);

  brandCorner(false);

  // Top-right meta (own column, no overlap with brand)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...TEAL);
  doc.text("INFORME DIAGNÓSTICO", W - 16, 19, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...SLATE);
  doc.text(dateStr, W - 16, 24, { align: "right" });

  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.3);
  doc.line(14, 30, W - 14, 30);

  // Title block
  doc.setFont("helvetica", "bold");
  doc.setFontSize(23);
  doc.setTextColor(...TEAL);
  doc.text("Informe de Nivel de Inglés", W / 2, 45, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...SLATE);
  doc.text("Se otorga la presente constancia a", W / 2, 53, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(...TEAL_LIGHT);
  doc.text(name, W / 2, 66, { align: "center" });
  doc.setDrawColor(...MINT);
  doc.setLineWidth(0.7);
  doc.line(W / 2 - 52, 70.5, W / 2 + 52, 70.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...SLATE);
  doc.text(
    "por haber presentado el Examen Diagnóstico de Inglés de Rators Academy",
    W / 2,
    78,
    { align: "center" },
  );

  // Modality chips: two separate pills, centered, never overlapping
  const chips = [
    modeName,
    `Duración ${modeTime}`,
    `${result.totalQuestions} reactivos`,
  ];
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  const widths = chips.map((c) => doc.getTextWidth(c) + 10);
  const gap = 4;
  const totalW = widths.reduce((a, b) => a + b, 0) + gap * (chips.length - 1);
  let cx = W / 2 - totalW / 2;
  chips.forEach((c, i) => {
    doc.setFillColor(...MINT);
    doc.roundedRect(cx, 83, widths[i], 7.5, 3.75, 3.75, "F");
    doc.setTextColor(...TEAL);
    doc.text(c, cx + widths[i] / 2, 87.9, { align: "center" });
    cx += widths[i] + gap;
  });

  // Overall seal (left)
  const sealX = 62;
  const sealY = 133;
  doc.setFillColor(...TEAL);
  doc.circle(sealX, sealY, 28, "F");
  doc.setDrawColor(...MINT);
  doc.setLineWidth(1);
  doc.circle(sealX, sealY, 31);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.text("NIVEL GENERAL", sealX, sealY - 11, { align: "center" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(34);
  doc.text(result.overall, sealX, sealY + 5, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.text(`${result.overallScore}/100 · MCER`, sealX, sealY + 14, { align: "center" });

  doc.setTextColor(...SLATE);
  doc.setFontSize(8.5);
  const desc = doc.splitTextToSize(CEFR_DESCRIPTION[result.overall], 78) as string[];
  desc.forEach((line, i) =>
    doc.text(line, sealX, sealY + 40 + i * 4.4, { align: "center" }),
  );

  // Section summary (right)
  const boxX = 112;
  const boxW = W - boxX - 20;
  let y = 100;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...TEAL);
  doc.text("Resumen por habilidad", boxX, y);
  y += 6;

  result.sections.forEach((s) => {
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.3);
    doc.roundedRect(boxX, y, boxW, 22, 2.5, 2.5, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...TEAL);
    doc.text(s.label, boxX + 6, y + 7.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...SLATE);
    doc.text(
      `${s.correct}/${s.total} aciertos · ${s.score}/100`,
      boxX + boxW - 26,
      y + 7.5,
      { align: "right" },
    );

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...TEAL_LIGHT);
    doc.text(s.level, boxX + boxW - 6, y + 8, { align: "right" });

    const barX = boxX + 6;
    const barW = boxW - 12;
    const barY = y + 13;
    doc.setFillColor(233, 240, 240);
    doc.roundedRect(barX, barY, barW, 3.2, 1.6, 1.6, "F");
    const pos = Math.max(0.06, CEFR_VALUE[s.level] / 5);
    doc.setFillColor(...MINT);
    doc.roundedRect(barX, barY, barW * pos, 3.2, 1.6, 1.6, "F");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.2);
    doc.setTextColor(...SLATE);
    CEFR_SCALE.forEach((lvl, i) => {
      doc.text(lvl, barX + (barW / 5) * (i + 0.5), barY + 6, { align: "center" });
    });

    y += 26;
  });

  // Footer
  doc.setDrawColor(...TEAL);
  doc.setLineWidth(0.4);
  doc.line(boxX + 6, H - 26, boxX + 66, H - 26);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...TEAL);
  doc.text("Teacher Netza Varo", boxX + 6, H - 21);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...SLATE);
  doc.text("Instructor certificado · Rators Academy", boxX + 6, H - 17);
  doc.text(`Folio: ${serial}`, W - 20, H - 21, { align: "right" });
  doc.text("Diagnóstico orientativo — página 1 de 2", W - 20, H - 17, { align: "right" });

  /* ============================ PAGE 2 ============================ */
  doc.addPage("a4", "landscape");
  doc.setFillColor(...CREAM);
  doc.rect(0, 0, W, H, "F");
  doc.setFillColor(...TEAL);
  doc.rect(0, 0, W, 34, "F");
  doc.setFillColor(...MINT);
  doc.rect(0, 34, W, 1.4, "F");

  brandCorner(true);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text("ANÁLISIS DETALLADO", W - 16, 19, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(214, 236, 232);
  doc.text(`${name} · ${dateStr}`, W - 16, 24, { align: "right" });

  // KPI row
  const kpis: [string, string][] = [
    ["Rango estimado", result.band],
    ["Puntaje global", `${result.overallScore}/100`],
    ["Aciertos", `${result.totalCorrect}/${result.totalQuestions}`],
    ["Confianza", result.confidence],
  ];
  const kW = (W - 32 - 3 * 5) / 4;
  kpis.forEach(([label, value], i) => {
    const x = 16 + i * (kW + 5);
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, 44, kW, 22, 2.5, 2.5, "FD");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...SLATE);
    doc.text(label.toUpperCase(), x + 6, 52);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(value.length > 16 ? 10 : 15);
    doc.setTextColor(...TEAL);
    doc.text(value, x + 6, 61);
  });

  // Detailed table
  let ty = 76;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...TEAL);
  doc.text("Puntajes por sección", 16, ty);
  ty += 6;

  const colX = { skill: 20, hits: 96, pct: 124, level: 150, cap: 172 };
  doc.setFillColor(...TEAL);
  doc.rect(16, ty, W - 32, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text("HABILIDAD", colX.skill, ty + 5.3);
  doc.text("ACIERTOS", colX.hits, ty + 5.3);
  doc.text("PUNTAJE", colX.pct, ty + 5.3);
  doc.text("NIVEL", colX.level, ty + 5.3);
  doc.text("QUÉ PUEDES HACER", colX.cap, ty + 5.3);
  ty += 8;

  result.sections.forEach((s, i) => {
    const rowH = 18;
    doc.setFillColor(...(i % 2 === 0 ? ([255, 255, 255] as [number, number, number]) : CREAM));
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.2);
    doc.rect(16, ty, W - 32, rowH, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...TEAL);
    doc.text(s.label, colX.skill, ty + 8);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...SLATE);
    doc.text(`${s.correct} / ${s.total}`, colX.hits, ty + 8);
    doc.text(`${s.score}/100`, colX.pct, ty + 8);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...TEAL_LIGHT);
    doc.text(s.level, colX.level, ty + 8.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.8);
    doc.setTextColor(...SLATE);
    const cap = doc.splitTextToSize(
      CAPABILITY[s.key]?.[s.level] ?? CEFR_DESCRIPTION[s.level],
      W - 32 - (colX.cap - 16) - 6,
    ) as string[];
    cap.slice(0, 2).forEach((line, li) => doc.text(line, colX.cap, ty + 7 + li * 4.2));

    // progress bar under skill name
    const bX = colX.skill;
    const bW = 62;
    doc.setFillColor(233, 240, 240);
    doc.roundedRect(bX, ty + 11.5, bW, 3, 1.5, 1.5, "F");
    doc.setFillColor(...MINT);
    doc.roundedRect(bX, ty + 11.5, (bW * Math.max(4, s.score)) / 100, 3, 1.5, 1.5, "F");

    ty += rowH;
  });

  // Summary block
  ty += 8;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.3);
  doc.roundedRect(16, ty, W - 32, 34, 3, 3, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...TEAL);
  doc.text("Resumen y siguiente paso", 22, ty + 9);

  const best = [...result.sections].sort((a, b) => b.score - a.score)[0];
  const worst = [...result.sections].sort((a, b) => a.score - b.score)[0];
  const summary =
    `Con ${result.totalCorrect} de ${result.totalQuestions} reactivos correctos (${result.overallScore}/100, puntaje ajustado por azar), tu rango estimado es ${result.band}. ` +
    `Tu habilidad más fuerte es ${best.label} (${best.level}) y la que más conviene reforzar es ${worst.label} (${worst.level}). ` +
    "El nivel solo se otorga cuando hay dominio comprobado del nivel y de los anteriores. " +
    RECOMMENDATION[result.overall] +
    " Este resultado cubre Listening, Reading y Use of English; Speaking y Writing requieren evaluación adicional.";
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...SLATE);
  (doc.splitTextToSize(summary, W - 44) as string[])
    .slice(0, 4)
    .forEach((line, i) => doc.text(line, 22, ty + 16 + i * 4.6));

  doc.setFontSize(7.5);
  doc.text(`Folio: ${serial}`, W - 20, H - 12, { align: "right" });
  doc.text("Teacher Netza Varo · Rators Academy — página 2 de 2", 16, H - 12);

  const safe = name.replace(/[^a-z0-9]/gi, "_").toLowerCase();
  doc.save(`constancia_nivel_ingles_${safe}.pdf`);
}
