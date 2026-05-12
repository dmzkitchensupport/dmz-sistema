import sharp from 'sharp';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  try {
    // Leer el body como buffer
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const buf = Buffer.concat(chunks);

    if (!buf.length) { res.status(400).json({ error: 'Empty file' }); return; }

    // Convertir HEIC/HEIF a JPEG usando sharp
    const jpeg = await sharp(buf)
      .rotate()           // Aplicar EXIF rotation
      .jpeg({ quality: 88, mozjpeg: true })
      .toBuffer();

    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Content-Length', jpeg.length);
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).end(jpeg);
  } catch (e) {
    console.error('convert-heic error:', e.message);
    res.status(500).json({ error: e.message });
  }
}
