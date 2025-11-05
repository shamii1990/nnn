// public/client.js - small helper used by custom tool pages if they include it.
async function postFormToApi(form, apiPath, onProgress) {
  const fd = new FormData(form);
  const resp = await fetch(apiPath, { method: 'POST', body: fd });
  const ct = resp.headers.get('content-type') || '';
  if (ct.includes('application/pdf')) {
    const blob = await resp.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const disp = resp.headers.get('content-disposition') || 'file.pdf';
    let filename = 'download.pdf';
    const m = /filename=\"?([^\";]+)\"?/.exec(disp);
    if (m) filename = m[1];
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    return { ok: true, downloaded: filename };
  }
  const json = await resp.json();
  return json;
}

document.addEventListener('submit', async (e) => {
  const f = e.target;
  if (f.matches('form') && f.dataset && f.dataset.api) {
    e.preventDefault();
    try {
      const r = await postFormToApi(f, f.dataset.api);
      console.log('Tool response', r);
      alert(JSON.stringify(r).slice(0, 200));
    } catch (err) {
      console.error(err);
      alert('Tool error: ' + err.message);
    }
  }
});