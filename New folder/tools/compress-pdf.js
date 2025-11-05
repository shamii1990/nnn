// tools/compress-pdf.js
const { PDFDocument } = require('pdf-lib');

module.exports = async function compressPdf(req, res) {
  try {
    const input = req.files && (req.files.file || (Array.isArray(req.files.files) && req.files.files[0]));
    if (!input) return res.status(400).json({ error: "Upload a PDF using field 'file'." });

    const srcPdf = await PDFDocument.load(input.data);
    const dstPdf = await PDFDocument.create();
    const copied = await dstPdf.copyPages(srcPdf, srcPdf.getPageIndices());
    copied.forEach(p => dstPdf.addPage(p));

    const out = await dstPdf.save({ useObjectStreams: true });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="compressed.pdf"');
    res.send(Buffer.from(out));
  } catch (err) {
    console.error('compress-pdf err:', err);
    res.status(500).json({ error: err.message });
  }
};