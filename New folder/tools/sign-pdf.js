// placeholder that returns a tiny blank PDF for download
const { PDFDocument } = require('pdf-lib');
module.exports = async function (req, res) {
  try {
    const pdf = await PDFDocument.create();
    pdf.addPage();
    const bytes = await pdf.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=placeholder.pdf');
    res.send(Buffer.from(bytes));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};