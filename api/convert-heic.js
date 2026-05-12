export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { res.status(405).end(); return; }

  try {
    // Leer body
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const buf = Buffer.concat(chunks);
    if (!buf.length) { res.status(400).json({error:'Empty'}); return; }

    // Subir a Cloudinary como data URI y pedir JPG de vuelta
    const b64 = buf.toString('base64');
    const mime = req.headers['content-type'] || 'image/heic';
    const dataUri = `data:${mime};base64,${b64}`;

    const CLOUD = 'dmzkitchen';
    const PRESET = 'heic_convert';

    const body = new URLSearchParams({
      file: dataUri,
      upload_preset: PRESET,
      format: 'jpg',
      quality: '88',
    });

    const upload = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`,
      { method: 'POST', body }
    );

    if (!upload.ok) {
      const err = await upload.text();
      throw new Error('Cloudinary: ' + err.slice(0,200));
    }

    const data = await upload.json();
    const jpgUrl = data.secure_url.replace(/\.[^.]+$/, '.jpg');

    // Descargar el JPG convertido
    const jpgResp = await fetch(jpgUrl);
    if (!jpgResp.ok) throw new Error('Download failed');
    const jpgBuf = Buffer.from(await jpgResp.arrayBuffer());

    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Content-Length', jpgBuf.length);
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).end(jpgBuf);

  } catch(e) {
    console.error('convert-heic:', e.message);
    res.status(500).json({error: e.message});
  }
}
