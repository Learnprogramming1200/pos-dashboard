
import type { Browser } from 'puppeteer';
import React from 'react';
import { mapInvoiceDataForTemplate } from './invoice-mapper';
import { Constants } from '@/constant';

// Import Templates
import { Template1, Template2, Template3, Template4, Template5 } from '@/components/admin/system-settings/invoice-setting/templates';

// Browser instance pool
let browserInstance: Browser | null = null;
let browserLaunchPromise: Promise<Browser> | null = null;

// Performance Caches
const fontCache: Record<string, string> = {};
const logoCache: Record<string, string> = {};

async function getBrowser(): Promise<Browser> {
  // Dynamically import puppeteer
  const puppeteer = (await import('puppeteer')).default;

  if (browserInstance && browserInstance.isConnected()) return browserInstance;
  if (browserLaunchPromise) return browserLaunchPromise;

  browserLaunchPromise = puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
    ],
    timeout: 30000,
  }).then((browser) => {
    browserInstance = browser;
    browserLaunchPromise = null;
    browser.on('disconnected', () => {
      browserInstance = null;
      browserLaunchPromise = null;
    });
    return browser;
  }).catch((error) => {
    browserLaunchPromise = null;
    browserInstance = null;
    throw error;
  });

  return browserLaunchPromise;
}

export async function generateInvoicePDF(body: any, designConfig: any = {}, host: string = ''): Promise<Buffer> {
  const ReactDOMServer = (await import('react-dom/server')).default;
  let resolvedLogo = (body.business as any)?.businessLogo || designConfig.logo || Constants.assetsIcon.assets.logo.src;
  let fontCss = '';

  try {
    // 1. Map Data
    const templateData = mapInvoiceDataForTemplate(body);

    // 2. Resolve Logo to Base64 (Robust method for Puppeteer)
    let logoPath = resolvedLogo;

    // Check Cache first
    if (logoCache[logoPath]) {
      resolvedLogo = logoCache[logoPath];
    } else {
      try {
        const fs = await import('fs');
        const path = await import('path');
        const { env } = await import('./env');

        const fetchBase64 = async (url: string) => {
          const response = await fetch(url);
          if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
          const arrayBuffer = await response.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const contentType = response.headers.get('content-type') || 'image/png';
          return `data:${contentType};base64,${buffer.toString('base64')}`;
        };

        if (logoPath.startsWith('http')) {
          resolvedLogo = await fetchBase64(logoPath);
        } else {
          const cleanPath = logoPath.startsWith('/') ? logoPath.slice(1) : logoPath;
          const localFilePath = path.join(process.cwd(), 'public', cleanPath);

          if (fs.existsSync(localFilePath)) {
            const fileData = fs.readFileSync(localFilePath);
            const ext = path.extname(localFilePath).toLowerCase();
            const mimeType = ext === '.svg' ? 'image/svg+xml' : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 'image/png';
            resolvedLogo = `data:${mimeType};base64,${fileData.toString('base64')}`;
          } else {
            const backendBase = env.BACKEND_URL || 'http://localhost:8080';
            const backendUrl = new URL(logoPath, backendBase).href;
            try {
              resolvedLogo = await fetchBase64(backendUrl);
            } catch (backendErr) {
              if (host) {
                const isLocal = host.includes('localhost') || host.includes('127.0.0.1') || host.startsWith('192.168.');
                const protocol = isLocal ? 'http' : 'https';
                const cleanHost = host.replace(/^https?:\/\//, '');
                resolvedLogo = `${protocol}://${cleanHost}${logoPath.startsWith('/') ? '' : '/'}${logoPath}`;
              }
            }
          }
        }

        if (resolvedLogo && resolvedLogo.startsWith('data:')) {
          logoCache[logoPath] = resolvedLogo;
        }
      } catch (error) {
        console.error('[Invoice Generator] Error resolving logo:', error);
      }
    }

    // 3. Resolve Template Component
    let templateId = designConfig.templateId || 'template1';
    if (typeof templateId === 'number' || (typeof templateId === 'string' && !templateId.startsWith('template'))) {
      templateId = `template${templateId}`;
    }
    let TemplateComponent;

    switch (templateId) {
      case 'template2': TemplateComponent = Template2; break;
      case 'template3': TemplateComponent = Template3; break;
      case 'template4': TemplateComponent = Template4; break;
      case 'template5': TemplateComponent = Template5; break;
      case 'template1':
      default: TemplateComponent = Template1; break;
    }

    // 4. Render React Component to HTML
    const componentHtml = ReactDOMServer.renderToStaticMarkup(
      // @ts-ignore
      <TemplateComponent
        data={templateData}
        design={designConfig}
        styles={{ logo: resolvedLogo }}
      />
    );

    // 5. Build Font CSS
    const targetFont = designConfig.fontFamily || 'Roboto';

    if (fontCache[targetFont]) {
      fontCss = fontCache[targetFont];
    } else {
      try {
        const fs = await import('fs');
        const path = await import('path');
        const fontDir = path.join(process.cwd(), 'public', 'fonts');
        const fontCssPath = path.join(fontDir, 'fonts.css');

        if (fs.existsSync(fontCssPath)) {
          const rawCss = fs.readFileSync(fontCssPath, 'utf-8');
          const blocks = rawCss.split('}');

          let relevantBlocks = blocks.filter(block => {
            const normalizedBlock = block.replace(/\s+/g, '');
            const normalizedTarget = targetFont.replace(/\s+/g, '');
            return normalizedBlock.includes(`font-family:'${normalizedTarget}'`) ||
              normalizedBlock.includes(`font-family:"${normalizedTarget}"`);
          });

          for (let block of relevantBlocks) {
            const urlMatch = /url\((['"])?(\.\/[^)'"]+)(['"])?\)/.exec(block);
            if (urlMatch) {
              const fileName = urlMatch[2].replace('./', '');
              const filePath = path.join(fontDir, fileName);
              if (fs.existsSync(filePath)) {
                const fontBuffer = fs.readFileSync(filePath);
                const base64Font = fontBuffer.toString('base64');
                const newUrl = `url(data:font/woff2;base64,${base64Font})`;
                fontCss += block.replace(/url\((['"])?(\.\/[^)'"]+)(['"])?\)/, newUrl) + '}\n';
              }
            }
          }
          if (fontCss) fontCache[targetFont] = fontCss;
        }
      } catch (fontErr) {
        console.error('[Invoice Gen] Failed to embed local fonts:', fontErr);
      }
    }

    const finalFontFamily = targetFont;

    const fullHtml = `<!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice ${templateData.invoiceNumber}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <script>
          tailwind.config = {
            theme: {  
              extend: {
                colors: { primary: '${designConfig.primaryColor || '#2563eb'}' }
              }
            }
          }
        </script>
        <style>
          ${fontCss}
          body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          * { font-family: "${finalFontFamily}", sans-serif !important; }
          html, body, #root { height: 100%; margin: 0; padding: 0; }
          .page-break { page-break-after: always; }
        </style>
      </head>
      <body>
        <div id="root">${componentHtml}</div>
      </body>
    </html>`;

    // 6. Generate PDF via Puppeteer
    const browser = await getBrowser();
    const page = await browser.newPage();

    try {
      await page.setContent(fullHtml, { waitUntil: 'load', timeout: 30000 });
      await page.evaluate(async () => {
        try {
          await Promise.race([
            document.fonts.ready,
            new Promise(resolve => setTimeout(resolve, 3000))
          ]);
        } catch (e) { }
      });

      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '0', right: '0', bottom: '0', left: '0' },
        timeout: 30000
      });

      return Buffer.from(pdf);
    } finally {
      await page.close().catch(console.error);
    }
  } catch (err) {
    console.error('Invoice generation failed', err);
    throw err;
  }
}
