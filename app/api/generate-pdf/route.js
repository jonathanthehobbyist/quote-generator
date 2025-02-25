import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export async function POST(req) {
  const { items, total, clientEmail, logo } = await req.json();

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 400]);
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Embed Logo if provided
  if (logo) {
    const imgBytes = Buffer.from(logo.split(",")[1], "base64");
    const image = await pdfDoc.embedPng(imgBytes);
    const imgDims = image.scale(0.3);
    page.drawImage(image, {
      x: width - imgDims.width - 20,
      y: height - imgDims.height - 20,
      width: imgDims.width,
      height: imgDims.height,
    });
  }

  // Add Invoice Header
  page.drawText("Invoice", { x: 50, y: height - 50, size: 24, font, color: rgb(0, 0, 0) });

  // Add Line Items
  let yPosition = height - 100;
  items.forEach((item, index) => {
    page.drawText(
      `${item.description}  |  ${item.quantity} x $${item.price} = $${item.quantity * item.price}`,
      { x: 50, y: yPosition, size: 12, font }
    );
    yPosition -= 20;
  });

  // Add Total
  page.drawText(`Total: $${total}`, { x: 50, y: yPosition - 20, size: 14, font });

  // Serialize PDF
  const pdfBytes = await pdfDoc.save();
  return new Response(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="invoice.pdf"`,
    },
  });
}
