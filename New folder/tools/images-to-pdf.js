// tools/images-to-pdf.js
const { PDFDocument } = require('pdf-lib');
const sharp = require('sharp');

module.exports = async function imagesToPdf(req, res) {
  try {
    if (!req.files) return res.status(400).json({ error: "Upload images with field 'images' or 'files'." });
    let imgs = [];
    if (req.files.images) imgs = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
    else if (req.files.files) imgs = Array.isArray(req.files.files) ? req.files.files : [req.files.files];

    if (imgs.length === 0) return res.status(400).json({ error: 'No images found in upload.' });

    const pdfDoc = await PDFDocument.create();

    for (const im of imgs) {
      const png = await sharp(im.data).png().toBuffer();
      const imgObj = await pdfDoc.embedPng(png);
      const { width, height } = imgObj.scale(1);
      const page = pdfDoc.addPage([width, height]);
      page.drawImage(imgObj, { x: 0, y: 0, width, height });
    }

    const out = await pdfDoc.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="images.pdf"');
    res.send(Buffer.from(out));
  } catch (err) {
    console.error('images-to-pdf err:', err);
    res.status(500).json({ error: err.message });
  }
};