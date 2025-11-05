// tools/split-pdf.js
const { PDFDocument } = require('pdf-lib');

module.exports = async function splitPdf(req, res) {
  try {
    const input = req.files && (req.files.file || (Array.isArray(req.files.files) && req.files.files[0]));
    if (!input) return res.status(400).json({ error: "Upload a PDF with field name 'file'." });

    const range = (req.body.range || '').trim();
    const pdf = await PDFDocument.load(input.data);
    const total = pdf.getPageCount();
    let pagesToExtract = [];

    if (!range) {
      const out = await pdf.save();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="original.pdf"');
      return res.send(Buffer.from(out));
    }

    if (range.includes('-')) {
      const [a, b] = range.split('-').map(x => parseInt(x.trim(), 10));
      const start = Math.max(1, a);
      const end = Math.min(total, b);
      for (let i = start; i <= end; i++) pagesToExtract.push(i - 1);
    } else {
      const idx = parseInt(range, 10);
      if (isNaN(idx)) return res.status(400).json({ error: 'Invalid range' });
      pagesToExtract.push(Math.max(0, Math.min(total - 1, idx - 1)));
    }

    const outPdf = await PDFDocument.create();
    const copied = await outPdf.copyPages(pdf, pagesToExtract);
    copied.forEach(p => outPdf.addPage(p));

    const out = await outPdf.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="extracted-pages.pdf"`);
    res.send(Buffer.from(out));
  } catch (err) {
    console.error('split-pdf err:', err);
    res.status(500).json({ error: err.message });
  }
};