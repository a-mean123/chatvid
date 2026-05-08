import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getPlanLimits } from '@/lib/plans';

export const runtime    = 'nodejs';
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  try {
    // ── Auth + plan limits ────────────────────────────────────────────────────
    const session = await auth();
    const limits  = getPlanLimits(session?.user?.plan);

    const body = await req.json();
    let { messages, ...rest } = body;

    if (Array.isArray(messages) && messages.length > limits.maxMessages) {
      messages = messages.slice(0, limits.maxMessages);
    }

    const inputProps = { messages, ...rest, watermark: limits.watermark };

    // ── Proxy to Railway render server if configured ──────────────────────────
    const renderUrl = process.env.RENDER_API_URL;
    if (renderUrl) {
      const upstream = await fetch(`${renderUrl}/render`, {
        method:  'POST',
        headers: {
          'Content-Type':    'application/json',
          'x-render-secret': process.env.RENDER_SECRET ?? '',
        },
        body: JSON.stringify(inputProps),
        signal: AbortSignal.timeout(280_000),
      });

      if (!upstream.ok) {
        const err = await upstream.json().catch(() => ({ error: 'Render failed' }));
        return NextResponse.json({ error: err.error ?? 'Render failed' }, { status: 500 });
      }

      const contentType = upstream.headers.get('Content-Type') ?? '';
      if (contentType.includes('application/json')) {
        const data = await upstream.json();
        return NextResponse.json(data);
      }

      const buffer = await upstream.arrayBuffer();
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type':        'video/mp4',
          'Content-Disposition': `attachment; filename="chat-video-${Date.now()}.mp4"`,
        },
      });
    }

    // ── Local render (dev only — requires Chromium on the machine) ────────────
    const path = await import('path');
    const fs   = await import('fs');
    const os   = await import('os');

    const { bundle }                         = await import('@remotion/bundler');
    const { renderMedia, selectComposition } = await import('@remotion/renderer');

    const entryPoint = path.join(process.cwd(), 'src', 'remotion', 'index.ts');
    if (!fs.existsSync(entryPoint)) {
      return NextResponse.json({ error: 'Remotion entry point not found' }, { status: 500 });
    }

    const bundleLocation = await bundle({
      entryPoint,
      webpackOverride: (config) => ({
        ...config,
        resolve: {
          ...config.resolve,
          alias: {
            ...(config.resolve?.alias as Record<string, string> | undefined),
            '@': path.join(process.cwd(), 'src'),
          },
        },
      }),
    });

    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: 'ChatVideo',
      inputProps,
    });

    const tmpDir = path.join(os.tmpdir(), 'chat-video-render');
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
      return NextResponse.json({ url: result.secure_url, watermark: limits.watermark });
    }

    const fileBuffer = fs.readFileSync(outputPath);
    try { fs.unlinkSync(outputPath); } catch {}
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type':        'video/mp4',
        'Content-Disposition': `attachment; filename="chat-video-${Date.now()}.mp4"`,
        'Content-Length':      String(fileBuffer.length),
      },
    });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Render failed';
    console.error('[render]', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
