// Standalone render server — deployed to Railway.
// Receives render jobs from the Next.js app (which handles auth & plan limits).
'use strict';

const http    = require('http');
const path    = require('path');
const fs      = require('fs');
const os      = require('os');

const PORT   = process.env.PORT || 3001;
const SECRET = process.env.RENDER_SECRET ?? '';

// ── Minimal HTTP server (no express dep needed) ────────────────────────────
const server = http.createServer(async (req, res) => {
  const url = req.url ?? '/';

  // Health check
  if (req.method === 'GET' && url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  // Render endpoint
  if (req.method === 'POST' && url === '/render') {
    // ── Auth via shared secret ─────────────────────────────────────────────
    const auth = req.headers['x-render-secret'];
    if (SECRET && auth !== SECRET) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Unauthorized' }));
      return;
    }

    // ── Parse body ────────────────────────────────────────────────────────
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    await new Promise((resolve) => req.on('end', resolve));

    let inputProps;
    try {
      inputProps = JSON.parse(body);
    } catch {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid JSON' }));
      return;
    }

    // ── Render ────────────────────────────────────────────────────────────
    try {
      const { bundle }                        = await import('@remotion/bundler');
      const { renderMedia, selectComposition } = await import('@remotion/renderer');

      const entryPoint = path.join(__dirname, 'src', 'remotion', 'index.ts');

      const bundleLocation = await bundle({
        entryPoint,
        webpackOverride: (config) => ({
          ...config,
          resolve: {
            ...config.resolve,
            alias: {
              ...(config.resolve?.alias ?? {}),
              '@': path.join(__dirname, 'src'),
            },
          },
        }),
      });

      const composition = await selectComposition({
        serveUrl: bundleLocation,
        id: 'ChatVideo',
        inputProps,
      });

      const tmpDir    = path.join(os.tmpdir(), 'chat-video-render');
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
      const outputPath = path.join(tmpDir, `render-${Date.now()}.mp4`);

      await renderMedia({
        composition,
        serveUrl: bundleLocation,
        codec: 'h264',
        outputLocation: outputPath,
        inputProps,
        chromiumOptions: { disableWebSecurity: true, ignoreCertificateErrors: true },
        timeoutInMilliseconds: 240000,
      });

      // ── Upload to Cloudinary ────────────────────────────────────────────
      const hasCloudinary =
        process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY    &&
        process.env.CLOUDINARY_API_SECRET;

      if (hasCloudinary) {
        const { v2: cloudinary } = await import('cloudinary');
        cloudinary.config({
          cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
          api_key:    process.env.CLOUDINARY_API_KEY,
          api_secret: process.env.CLOUDINARY_API_SECRET,
        });
        const result = await cloudinary.uploader.upload(outputPath, {
          resource_type: 'video',
          folder:        'chat-videos',
          public_id:     `chat-video-${Date.now()}`,
        });
        try { fs.unlinkSync(outputPath); } catch {}
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ url: result.secure_url, watermark: inputProps.watermark }));
        return;
      }

      // ── Fallback: send binary ──────────────────────────────────────────
      const fileBuffer = fs.readFileSync(outputPath);
      try { fs.unlinkSync(outputPath); } catch {}
      res.writeHead(200, {
        'Content-Type':        'video/mp4',
        'Content-Disposition': `attachment; filename="chat-video-${Date.now()}.mp4"`,
        'Content-Length':      String(fileBuffer.length),
      });
      res.end(fileBuffer);

    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Render failed';
      console.error('[render-server]', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: msg }));
    }
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log(`[render-server] Listening on port ${PORT}`);
});
