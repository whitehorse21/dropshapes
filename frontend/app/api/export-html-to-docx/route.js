import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { html, filename } = await request.json();
    if (!html || typeof html !== "string") {
      return NextResponse.json(
        { error: "HTML content is required" },
        { status: 400 }
      );
    }
    const mod = await import("html-to-docx");
    const HTMLtoDOCX = mod.default ?? mod;
    const buffer = await HTMLtoDOCX(html, null, {
      table: { row: { cantSplit: true } },
      footer: false,
      pageNumber: false,
    });
    const name = (filename || "export").replace(/[^\w\s-]/g, "").trim() || "export";
    const docxFilename = name.endsWith(".docx") ? name : `${name}.docx`;
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${docxFilename}"`,
      },
    });
  } catch (err) {
    console.error("export-html-to-docx error:", err);
    return NextResponse.json(
      { error: "Failed to convert HTML to DOCX" },
      { status: 500 }
    );
  }
}
