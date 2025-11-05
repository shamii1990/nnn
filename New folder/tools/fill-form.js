// placeholder that returns JSON indicating the endpoint exists
module.exports = async function (req, res) {
  res.json({ ok: true, implemented: false, message: 'Tool endpoint active — implementation pending.' });
};