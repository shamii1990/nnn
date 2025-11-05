// tools/rotate-pdf.js
const { PDFDocument } = require('pdf-lib');

module.exports = async function rotatePdf(req, res) {
  try {
    const input = req.files && (req.files.file || (Array.isArray(req.files.files) && req.files.files[0]));
    if (!input) return res.status(400).json({ error: "Upload a PDF using field 'file'." });

    const angle = parseInt(req.body.angle || req.query.angle || '90', 10);
    if (![90, 180, 270].includes(angle)) return res.status(400).json({ error: 'Angle must be 90,180,270' });

    const pdf = await PDFDocument.load(input.data);
    const pages = pdf.getPages();

    pages.forEach(page => {
      const current = page.getRotation().angle || 0;
      page.setRotation((current + angle) % 360);
    });

    const out = await pdf.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="rotated.pdf"');
    res.send(Buffer.from(out));
  } catch (err) {
    console.error('rotate-pdf err:', err);
    res.status(500).json({ error: err.message });
  }
};