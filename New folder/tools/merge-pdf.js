// tools/merge-pdf.js
const { PDFDocument } = require('pdf-lib');

module.exports = async function mergePdf(req, res) {
  try {
    if (!req.files || !req.files.files) {
      return res.status(400).json({ error: "No files uploaded. Use field name 'files'." });
    }
    const files = Array.isArray(req.files.files) ? req.files.files : [req.files.files];
    const mergedPdf = await PDFDocument.create();
    for (const f of files) {
      const buffer = f.data;
      const pdf = await PDFDocument.load(buffer);
      const copied = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copied.forEach(p => mergedPdf.addPage(p));
    }
    const out = await mergedPdf.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="merged.pdf"');
    res.send(Buffer.from(out));
  } catch (err) {
    console.error('merge-pdf error:', err);
    res.status(500).json({ error: err.message });
  }
};