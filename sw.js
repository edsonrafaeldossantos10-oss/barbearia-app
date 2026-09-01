/* ============================================================
   sw.js — Service Worker do app Barbearia
   ------------------------------------------------------------
   Estratégias:
     · App shell .............. cache-first (abre offline, na hora)
     · Supabase (/rest, /auth)  network-only (nunca cachear dado financeiro)
     · config.js .............. network-first (chave nova entra na próxima abertura)
     · demais arquivos ........ cache-first com revalidação em segundo plano

   IMPORTANTE: ao publicar uma atualização, mude CACHE para uma versão nova.
   Sem isso os celulares continuam abrindo a versão antiga do cache.
   ============================================================ */

const CACHE = 'barbearia-v2.3.4';

const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './config.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable-192.png',
  './icons/maskable-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png'
];

self.addEventListener('install', ev => {
  ev.waitUntil((async () => {
    const c = await caches.open(CACHE);
    // addAll falha inteiro se um arquivo falhar; por isso um a um
    await Promise.all(SHELL.map(u => c.add(new Request(u, { cache: 'reload' })).catch(() => {})));
    self.skipWaiting();
  })());
});

self.addEventListener('activate', ev => {
  ev.waitUntil((async () => {
    const nomes = await caches.keys();
    await Promise.all(nomes.filter(n => n !== CACHE).map(n => caches.delete(n)));
    await self.clients.claim();
  })());
});

function ehSupabase(url) {
  return /\.supabase\.(co|in)$/.test(url.hostname) ||
         url.pathname.startsWith('/rest/') ||
         url.pathname.startsWith('/auth/') ||
         url.pathname.startsWith('/storage/');
}

self.addEventListener('fetch', ev => {
  const req = ev.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // dado vivo: nunca do cache
  if (ehSupabase(url)) return;

  // config.js: rede primeiro, cache como reserva
  if (url.pathname.endsWith('/config.js')) {
    ev.respondWith((async () => {
      try {
        const r = await fetch(req, { cache: 'no-store' });
        const c = await caches.open(CACHE);
        c.put(req, r.clone());
        return r;
      } catch (e) {
        const c = await caches.match(req);
        if (c) return c;
        throw e;
      }
    })());
    return;
  }

  ev.respondWith((async () => {
    const cached = await caches.match(req, { ignoreSearch: true });
    if (cached) {
      // revalida em segundo plano, sem travar a resposta
      fetch(req).then(r => {
        if (r && r.ok) caches.open(CACHE).then(c => c.put(req, r));
      }).catch(() => {});
      return cached;
    }
    try {
      const r = await fetch(req);
      if (r && r.ok && url.origin === self.location.origin) {
        const c = await caches.open(CACHE);
        c.put(req, r.clone());
      }
      return r;
    } catch (e) {
      if (req.mode === 'navigate') {
        const shell = await caches.match('./index.html');
        if (shell) return shell;
        return new Response(
          '<meta charset="utf-8"><body style="background:#0d0d0d;color:#fff;font-family:system-ui;display:grid;place-items:center;height:100vh;margin:0"><p>Sem conexão. Abra o app novamente quando tiver internet.</p></body>',
          { headers: { 'Content-Type': 'text/html; charset=utf-8' }, status: 503 }
        );
      }
      throw e;
    }
  })());
});

self.addEventListener('message', ev => {
  if (ev.data === 'skipWaiting') self.skipWaiting();
});
