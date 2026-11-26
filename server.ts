import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { isPostgresConfigured } from './src/db/index.ts';
import {
  clearSiteVisitEvents,
  getAllAudioguidesWithMeta,
  getAllEventsWithMeta,
  getAllPlacesWithMeta,
  getAllSiteVisitEvents,
  getMediaUpload,
  getSiteConfigWithMeta,
  recordSiteVisitEvent,
  replaceAllAudioguides,
  replaceAllEvents,
  replaceAllPlaces,
  saveMediaUpload,
  saveSiteConfig,
  type SiteVisitRecord,
} from './src/db/repository.ts';
import {
  AUTHORIZED_ADMIN_EMAILS,
  createRequireAdminAuth,
  requireAuth,
  type AuthRequest,
} from './src/middleware/auth.ts';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Increase payload limit for high-res photo uploads
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Ensure upload & data directories exist
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Serve static uploads and images
  const imagesDir = path.join(process.cwd(), 'public', 'images');
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }
  const legacyImageAliases: Record<string, string> = {
    '/dique las pirquitas.jpg': '/images/dique-las-pirquitas.webp',
    '/images/dique-las-pirquitas.jpg': '/images/dique-las-pirquitas.webp',
    '/images/dique-las-pirquitas-hero.jpg': '/images/dique-las-pirquitas.webp',
    '/uploads/dique-las-pirquitas.jpg': '/images/dique-las-pirquitas.webp',
    '/uploads/dique-las-pirquitas-hero.jpg': '/images/dique-las-pirquitas.webp',
    '/uploads/dique-las-pirquitas-principal.jpg': '/images/dique-las-pirquitas.webp',
    '/uploads/dique-las-pirquitas-panoramica.jpg': '/images/dique-las-pirquitas.webp',
    '/images/casa-natal-esquiu.jpg': '/images/casa-natal-esquiu.webp',
    '/uploads/casa-natal-esquiu.jpg': '/images/casa-natal-esquiu.webp',
    '/images/monumento-beato-esquiu.jpg': '/images/monumento-beato-esquiu.webp',
    '/uploads/monumento-beato-esquiu.jpg': '/images/monumento-beato-esquiu.webp',
    '/uploads/monumento-esquiu.jpg': '/images/monumento-beato-esquiu.webp',
    '/Monumento Fray.jpg': '/images/monumento-beato-esquiu.webp',
    '/images/iglesia-san-jose.jpg': '/images/iglesia-san-jose.webp',
    '/images/templo-san-jose-piedra-blanca.jpg': '/images/iglesia-san-jose.webp',
    '/images/casona-piedra-blanca.jpg': '/images/casona-piedra-blanca.webp',
    '/uploads/casona-piedra-blanca.jpg': '/images/casona-piedra-blanca.webp',
    '/assets/aistudio/imagen_2026-11-17_190955385_d3f30181.png': '/assets/aistudio/imagen_2026-11-17_190955385_d3f30181.webp',
    '/assets/aistudio/imagen_2026-11-17_190955385_d3f30181.jpg': '/assets/aistudio/imagen_2026-11-17_190955385_d3f30181.webp',
    '/assets/aistudio/Santuario_en_la_ladera_monta_osa_50fa8eb0.png': '/assets/aistudio/Santuario_en_la_ladera_monta_osa_50fa8eb0.webp',
    '/assets/aistudio/Santuario_en_la_ladera_monta_osa_50fa8eb0.jpg': '/assets/aistudio/Santuario_en_la_ladera_monta_osa_50fa8eb0.webp',
    '/assets/aistudio/vertedero__camara_png_0f9de3fb.png': '/assets/aistudio/vertedero__camara_png_0f9de3fb.webp',
    '/assets/aistudio/vertedero__camara_png_0f9de3fb.jpg': '/assets/aistudio/vertedero__camara_png_0f9de3fb.webp',
    '/assets/aistudio/images__17__d2f32618.jpg': '/assets/aistudio/images__17__d2f32618.webp',
    '/assets/aistudio/238734_bab774f1.jpg': '/assets/aistudio/238734_bab774f1.webp',
    '/assets/aistudio/images__16__a85576a0.jpg': '/assets/aistudio/images__16__a85576a0.webp',
    '/assets/aistudio/iglesia_de_collagasta_35f92255.JPG': '/assets/aistudio/iglesia_de_collagasta_35f92255.webp',
    '/assets/aistudio/Pomancillo_catamarca_paisajes__21__c5936801.JPG': '/assets/aistudio/Pomancillo_catamarca_paisajes__21__c5936801.webp',
    '/assets/aistudio/images__18__f7fb378b.jpg': '/assets/aistudio/images__18__f7fb378b.webp',
    '/assets/aistudio/Paisajes_de_Catamarca._Las_Pirquitas__5__99e70619.JPG': '/assets/aistudio/Paisajes_de_Catamarca._Las_Pirquitas__5__99e70619.webp',
    '/assets/aistudio/calvario-030_e176e712.jpg': '/assets/aistudio/calvario-030_e176e712.webp',
    '/assets/aistudio/Collagasta_Catamarca__23__05c72993.JPG': '/assets/aistudio/Collagasta_Catamarca__23__05c72993.webp',
  };

  app.use((req, _res, next) => {
    try {
      const decodedPath = decodeURIComponent(req.path);
      if (legacyImageAliases[decodedPath]) {
        req.url = legacyImageAliases[decodedPath];
      }
    } catch {
      // Ignore malformed URI
    }
    next();
  });

  app.use(
    '/uploads',
    express.static(uploadsDir, {
      maxAge: '365d',
      immutable: true,
    })
  );
  app.get('/uploads/:filename', async (req, res) => {
    const safeFilename = path.basename(req.params.filename || '');
    if (!safeFilename) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }
    const diskPath = path.join(uploadsDir, safeFilename);
    if (fs.existsSync(diskPath)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      return res.sendFile(diskPath);
    }
    if (isPostgresConfigured()) {
      try {
        const media = await getMediaUpload(safeFilename);
        if (media) {
          const buffer = Buffer.from(media.dataBase64, 'base64');
          // Re-hydrate local cache on disk for fast subsequent reads
          try {
            fs.writeFileSync(diskPath, buffer);
          } catch {
            // Non-fatal
          }
          res.setHeader('Content-Type', media.mimeType);
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          return res.send(buffer);
        }
      } catch (pgErr) {
        console.warn('[STORAGE] PostgreSQL media lookup failed:', pgErr);
      }
    }
    return res.status(404).json({ error: 'Imagen no encontrada' });
  });
  app.use('/images', express.static(imagesDir, { maxAge: '7d' }));
  app.use('/audio', express.static(path.join(process.cwd(), 'public', 'audio'), { maxAge: '30d' }));
  app.use(express.static(path.join(process.cwd(), 'public')));

  const revisionsDir = path.join(dataDir, 'revisions');
  let revisionSeq = 0;

  type RevisionKind = 'places' | 'site_config' | 'events' | 'audioguides';

  const writeJsonAtomic = (filePath: string, payload: unknown) => {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const tmpPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
    fs.writeFileSync(tmpPath, JSON.stringify(payload, null, 2), 'utf-8');
    fs.renameSync(tmpPath, filePath);
  };

  const readJsonSafe = <T,>(filePath: string): T | null => {
    try {
      if (!fs.existsSync(filePath)) return null;
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content) as T;
    } catch {
      return null;
    }
  };

  /**
   * Append-only immutable revision writer.
   * Every save creates a brand-new timestamped file inside data/revisions/
   * so workspace syncs or concurrent reads can never overwrite saved user edits.
   */
  const persistRevisionDurable = (
    kind: RevisionKind,
    payload: unknown
  ): { timestamp: number; filename: string } => {
    const timestamp = Date.now();
    revisionSeq += 1;
    const filename = `${kind}_${timestamp}_${String(revisionSeq).padStart(4, '0')}.json`;
    const revPath = path.join(revisionsDir, filename);

    // 1. Primary immutable revision file (unique filename, immune to snapshot overwrites)
    writeJsonAtomic(revPath, { timestamp, data: payload });

    // 2. Mirror to baseline data/<kind>.json for exports and builds
    writeJsonAtomic(path.join(dataDir, `${kind}.json`), payload);

    return { timestamp, filename };
  };

  const readLatestRevision = <T,>(
    kind: RevisionKind
  ): { data: T; timestamp: number; filename: string } | null => {
    try {
      if (!fs.existsSync(revisionsDir)) return null;
      const pattern = new RegExp(`^${kind}_(\\d+)_(\\d+)\\.json$`);
      const candidates = fs
        .readdirSync(revisionsDir)
        .map((name) => {
          const match = name.match(pattern);
          if (!match) return null;
          return {
            name,
            ts: Number(match[1]),
            seq: Number(match[2]),
          };
        })
        .filter((item): item is { name: string; ts: number; seq: number } => item !== null)
        .sort((a, b) => (b.ts !== a.ts ? b.ts - a.ts : b.seq - a.seq));

      for (const candidate of candidates) {
        const parsed = readJsonSafe<any>(path.join(revisionsDir, candidate.name));
        if (!parsed) continue;
        const data = parsed && typeof parsed === 'object' && 'data' in parsed ? parsed.data : parsed;
        if (data !== null && data !== undefined) {
          const ts = typeof parsed.timestamp === 'number' ? parsed.timestamp : candidate.ts;
          return { data: data as T, timestamp: ts, filename: candidate.name };
        }
      }
      return null;
    } catch {
      return null;
    }
  };

  // Server-side admin session token helpers (used alongside Firebase Auth ID tokens)
  const ADMIN_SESSION_SECRET =
    process.env.ADMIN_SESSION_SECRET || crypto.randomBytes(32).toString('hex');
  const ADMIN_TOKEN_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours
  const adminAuthPath = path.join(revisionsDir, 'admin_auth.json');
  const visitsLogPath = path.join(revisionsDir, 'visits_log.ndjson');

  interface StoredAdminAuth {
    salt: string;
    hash: string;
    claimedBy: string;
    claimedAt: string;
  }

  const getEnvAdminPasscode = (): string => (process.env.ADMIN_PASSCODE || '').trim();

  const readStoredAdminAuth = (): StoredAdminAuth | null => {
    const parsed = readJsonSafe<StoredAdminAuth>(adminAuthPath);
    if (parsed && typeof parsed.salt === 'string' && typeof parsed.hash === 'string') {
      return parsed;
    }
    return null;
  };

  const hashPasscodeScrypt = (passcode: string, salt: string): string =>
    crypto.scryptSync(passcode, salt, 64).toString('hex');

  const verifyPasscodeAgainstServer = (passcode: string): boolean => {
    const candidate = passcode.trim();
    if (!candidate) return false;

    const envPasscode = getEnvAdminPasscode();
    if (envPasscode) {
      const a = Buffer.from(candidate, 'utf-8');
      const b = Buffer.from(envPasscode, 'utf-8');
      return a.length === b.length && crypto.timingSafeEqual(a, b);
    }

    const stored = readStoredAdminAuth();
    if (!stored) return false;
    const derived = Buffer.from(hashPasscodeScrypt(candidate, stored.salt), 'hex');
    const expected = Buffer.from(stored.hash, 'hex');
    return derived.length === expected.length && crypto.timingSafeEqual(derived, expected);
  };

  const signAdminToken = (email: string): string => {
    const payload = Buffer.from(
      JSON.stringify({ email, exp: Date.now() + ADMIN_TOKEN_TTL_MS }),
      'utf-8'
    ).toString('base64url');
    const sig = crypto
      .createHmac('sha256', ADMIN_SESSION_SECRET)
      .update(payload)
      .digest('base64url');
    return `${payload}.${sig}`;
  };

  const verifyAdminToken = (req: express.Request): { email: string } | null => {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) return null;
    const token = authHeader.slice(7).trim();
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [payloadB64, sigB64] = parts;
    const expectedSig = crypto
      .createHmac('sha256', ADMIN_SESSION_SECRET)
      .update(payloadB64)
      .digest('base64url');
    const a = Buffer.from(sigB64, 'utf-8');
    const b = Buffer.from(expectedSig, 'utf-8');
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

    try {
      const parsed = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf-8'));
      if (
        !parsed ||
        typeof parsed.email !== 'string' ||
        typeof parsed.exp !== 'number' ||
        parsed.exp < Date.now() ||
        !AUTHORIZED_ADMIN_EMAILS.has(parsed.email.toLowerCase())
      ) {
        return null;
      }
      return { email: parsed.email.toLowerCase() };
    } catch {
      return null;
    }
  };

  const requireAdminAuth = createRequireAdminAuth(verifyAdminToken);

  // Firebase Auth identity verification & Cloud SQL user sync
  app.get('/api/auth/me', requireAuth, (req: AuthRequest, res) => {
    const email = (req.user?.email || '').trim().toLowerCase();
    return res.json({
      uid: req.user?.uid,
      email,
      name: req.user?.name || null,
      isAdmin: AUTHORIZED_ADMIN_EMAILS.has(email),
    });
  });

  // Health check API
  app.get('/api/health', (_req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
    });
  });

  // Persistent Image Upload API (stored permanently in Cloud SQL + local cache)
  app.post('/api/upload', requireAdminAuth, async (req: AuthRequest, res) => {
    try {
      const { filename, dataUrl, base64 } = req.body;
      if (!dataUrl && !base64) {
        return res.status(400).json({ error: 'No se recibieron datos de imagen' });
      }

      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // Clean or generate file name
      let cleanName = (filename || `foto_${Date.now()}.webp`)
        .toLowerCase()
        .replace(/[^a-z0-9._-]/g, '_')
        .replace(/_{2,}/g, '_');

      // Ensure timestamp prefix to prevent collisions
      if (!cleanName.startsWith('fray_')) {
        cleanName = `fray_${Date.now()}_${cleanName}`;
      }

      const mimeMatch = typeof dataUrl === 'string' ? dataUrl.match(/^data:(image\/[\w.+-]+);base64,/) : null;
      const mimeType = mimeMatch?.[1] || 'image/webp';
      const rawBase64 = dataUrl ? dataUrl.replace(/^data:image\/[\w.+-]+;base64,/, '') : base64;
      const buffer = Buffer.from(rawBase64, 'base64');

      if (!buffer || buffer.length === 0) {
        return res.status(400).json({ error: 'El archivo de imagen está vacío o dañado' });
      }
      if (buffer.length > 15 * 1024 * 1024) {
        return res.status(413).json({ error: 'La imagen supera el tamaño máximo permitido (15 MB)' });
      }

      // Primary durable persistence in Cloud SQL PostgreSQL
      if (isPostgresConfigured()) {
        await saveMediaUpload(cleanName, mimeType, rawBase64, buffer.length);
      }

      // Fast local disk cache
      try {
        const targetPath = path.join(uploadsDir, cleanName);
        fs.writeFileSync(targetPath, buffer);
        const distUploads = path.join(process.cwd(), 'dist', 'uploads');
        if (fs.existsSync(distUploads)) {
          fs.writeFileSync(path.join(distUploads, cleanName), buffer);
        }
      } catch {
        // Non-fatal when persisted in Cloud SQL
      }

      const permanentUrl = `/uploads/${cleanName}`;
      console.log(`[STORAGE] Uploaded persistent image: ${permanentUrl} (${buffer.length} bytes)`);

      return res.json({
        success: true,
        url: permanentUrl,
        filename: cleanName,
        size: buffer.length,
      });
    } catch (err: any) {
      console.error('[STORAGE ERROR] Failed to save image:', err);
      return res.status(500).json({ error: 'Error al procesar y guardar la imagen' });
    }
  });

  // Baseline JSON file paths
  const placesFilePath = path.join(dataDir, 'places.json');
  const siteConfigFilePath = path.join(dataDir, 'site_config.json');
  const eventsFilePath = path.join(dataDir, 'events.json');
  const audioguidesFilePath = path.join(dataDir, 'audioguides.json');

  // Site Config API (CMS & Section Customization)
  app.get('/api/site-config', async (_req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    try {
      if (isPostgresConfigured()) {
        try {
          const { config, revisionTimestamp } = await getSiteConfigWithMeta();
          if (config) return res.json({ config, revisionTimestamp });
        } catch (pgErr) {
          console.warn('[DATABASE] PostgreSQL site-config read failed, falling back to JSON:', pgErr);
        }
      }
      const latestRev = readLatestRevision<Record<string, any>>('site_config');
      if (latestRev && typeof latestRev.data === 'object') {
        return res.json({ config: latestRev.data, revisionTimestamp: latestRev.timestamp });
      }
      const baselineData = readJsonSafe<Record<string, any>>(siteConfigFilePath);
      if (baselineData) return res.json({ config: baselineData, revisionTimestamp: 0 });

      return res.json({ config: null, revisionTimestamp: 0 });
    } catch (err: any) {
      console.error('[DATABASE] Error reading site config:', err);
      return res.status(500).json({ error: 'Error al leer la configuración del sitio' });
    }
  });

  app.post('/api/site-config', requireAdminAuth, async (req: AuthRequest, res) => {
    try {
      const { config } = req.body;
      if (!config || typeof config !== 'object') {
        return res.status(400).json({ error: 'Configuración inválida' });
      }
      if (isPostgresConfigured()) {
        await saveSiteConfig(config);
      }
      const rev = persistRevisionDurable('site_config', config);
      return res.json({ success: true, revisionTimestamp: rev.timestamp });
    } catch (err: any) {
      console.error('[DATABASE ERROR] Failed to save site config:', err);
      return res.status(500).json({ error: 'Error al guardar la configuración del sitio' });
    }
  });

  // Events API
  app.get('/api/events', async (_req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    try {
      if (isPostgresConfigured()) {
        try {
          const { events, revisionTimestamp } = await getAllEventsWithMeta();
          if (Array.isArray(events)) return res.json({ events, revisionTimestamp });
        } catch (pgErr) {
          console.warn('[DATABASE] PostgreSQL events read failed, falling back to JSON:', pgErr);
        }
      }
      const latestRev = readLatestRevision<any[]>('events');
      if (latestRev && Array.isArray(latestRev.data)) {
        return res.json({ events: latestRev.data, revisionTimestamp: latestRev.timestamp });
      }
      const baselineData = readJsonSafe<any[]>(eventsFilePath);
      if (Array.isArray(baselineData)) return res.json({ events: baselineData, revisionTimestamp: 0 });

      return res.json({ events: null, revisionTimestamp: 0 });
    } catch (err: any) {
      console.error('[DATABASE] Error reading events:', err);
      return res.status(500).json({ error: 'Error al leer los eventos' });
    }
  });

  app.post('/api/events', requireAdminAuth, async (req: AuthRequest, res) => {
    try {
      const { events } = req.body;
      if (!Array.isArray(events)) {
        return res.status(400).json({ error: 'Se esperaba una lista de eventos' });
      }
      if (isPostgresConfigured()) {
        await replaceAllEvents(events);
      }
      const rev = persistRevisionDurable('events', events);
      return res.json({ success: true, count: events.length, revisionTimestamp: rev.timestamp });
    } catch (err: any) {
      console.error('[DATABASE ERROR] Failed to save events:', err);
      return res.status(500).json({ error: 'Error al guardar los eventos' });
    }
  });

  // Audioguides API
  app.get('/api/audioguides', async (_req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    try {
      if (isPostgresConfigured()) {
        try {
          const { audioguides, revisionTimestamp } = await getAllAudioguidesWithMeta();
          if (Array.isArray(audioguides)) return res.json({ audioguides, revisionTimestamp });
        } catch (pgErr) {
          console.warn('[DATABASE] PostgreSQL audioguides read failed, falling back to JSON:', pgErr);
        }
      }
      const latestRev = readLatestRevision<any[]>('audioguides');
      if (latestRev && Array.isArray(latestRev.data)) {
        return res.json({ audioguides: latestRev.data, revisionTimestamp: latestRev.timestamp });
      }
      const baselineData = readJsonSafe<any[]>(audioguidesFilePath);
      if (Array.isArray(baselineData)) return res.json({ audioguides: baselineData, revisionTimestamp: 0 });

      return res.json({ audioguides: null, revisionTimestamp: 0 });
    } catch (err: any) {
      console.error('[DATABASE] Error reading audioguides:', err);
      return res.status(500).json({ error: 'Error al leer las audioguías' });
    }
  });

  app.post('/api/audioguides', requireAdminAuth, async (req: AuthRequest, res) => {
    try {
      const { audioguides } = req.body;
      if (!Array.isArray(audioguides)) {
        return res.status(400).json({ error: 'Se esperaba una lista de audioguías' });
      }
      if (isPostgresConfigured()) {
        await replaceAllAudioguides(audioguides);
      }
      const rev = persistRevisionDurable('audioguides', audioguides);
      return res.json({ success: true, count: audioguides.length, revisionTimestamp: rev.timestamp });
    } catch (err: any) {
      console.error('[DATABASE ERROR] Failed to save audioguides:', err);
      return res.status(500).json({ error: 'Error al guardar las audioguías' });
    }
  });

  const removedPlaceIds = new Set([
    'campanas-del-rosario',
    'casa-de-te-la-calera',
    'helados-plaza-sanjose',
    'casona-piedra-blanca',
    'parrilla-el-quincho',
    'astor-pizza-in-te-glia',
    'buena-vida-resto',
  ]);
  const filterRemovedPlaces = (list: any[]) =>
    list.filter((p) => p && !removedPlaceIds.has(p.id));

  const mergeRuntimeWithBaselinePlaces = (runtimeList: any[], baselineList: any[] | null): any[] => {
    if (!Array.isArray(baselineList) || baselineList.length === 0) {
      return filterRemovedPlaces(runtimeList);
    }
    const baselineById = new Map<string, any>(baselineList.filter((p) => p?.id).map((p) => [p.id, p]));
    const merged = runtimeList.map((item) => {
      if (!item?.id) return item;
      const base = baselineById.get(item.id);
      if (!base) return item;
      const runtimeHasImg = typeof item.image === 'string' && item.image.trim() !== '';
      const baseHasImg = typeof base.image === 'string' && base.image.trim() !== '';
      if (!runtimeHasImg && baseHasImg) {
        const mergedGallery =
          Array.isArray(item.gallery) && item.gallery.length > 0
            ? item.gallery
            : Array.isArray(base.gallery) && base.gallery.length > 0
              ? base.gallery
              : [base.image];
        const nextItem = { ...item, image: base.image, gallery: mergedGallery };
        delete nextItem.photoPendingNote;
        return nextItem;
      }
      return item;
    });
    return filterRemovedPlaces(merged);
  };

  app.get('/api/places', async (_req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    try {
      const baselinePlaces = readJsonSafe<any[]>(placesFilePath);

      if (isPostgresConfigured()) {
        try {
          const { places, revisionTimestamp } = await getAllPlacesWithMeta();
          if (Array.isArray(places) && places.length > 0) {
            return res.json({
              places: mergeRuntimeWithBaselinePlaces(places, baselinePlaces),
              revisionTimestamp,
            });
          }
        } catch (pgErr) {
          console.warn('[DATABASE] PostgreSQL places read failed, falling back to JSON:', pgErr);
        }
      }

      const latestRev = readLatestRevision<any[]>('places');
      if (latestRev && Array.isArray(latestRev.data) && latestRev.data.length > 0) {
        return res.json({
          places: mergeRuntimeWithBaselinePlaces(latestRev.data, baselinePlaces),
          revisionTimestamp: latestRev.timestamp,
        });
      }

      if (Array.isArray(baselinePlaces)) {
        return res.json({
          places: filterRemovedPlaces(baselinePlaces),
          revisionTimestamp: 0,
        });
      }
      return res.json({ places: null, revisionTimestamp: 0 });
    } catch (err: any) {
      console.error('[DATABASE] Error reading places:', err);
      return res.status(500).json({ error: 'Error al leer el catálogo de lugares' });
    }
  });

  app.post('/api/places', requireAdminAuth, async (req: AuthRequest, res) => {
    try {
      const { places } = req.body;
      if (!Array.isArray(places)) {
        return res.status(400).json({ error: 'Se esperaba una lista de lugares' });
      }
      const sanitizedPlaces = filterRemovedPlaces(places);

      if (isPostgresConfigured()) {
        await replaceAllPlaces(sanitizedPlaces);
      }
      const rev = persistRevisionDurable('places', sanitizedPlaces);

      return res.json({
        success: true,
        count: sanitizedPlaces.length,
        revisionTimestamp: rev.timestamp,
      });
    } catch (err: any) {
      console.error('[DATABASE ERROR] Failed to save places:', err);
      return res.status(500).json({ error: 'Error al guardar los cambios en el servidor' });
    }
  });

  // In-memory cache for Google Routes API requests
  const routesCache = new Map<string, { estimate: any; timestamp: number }>();
  const ROUTE_CACHE_TTL = 15 * 60 * 1000; // 15 minutes

  // Google Maps Routes API estimation endpoint
  app.post('/api/routes/estimate', async (req, res) => {
    try {
      const { origin, destination, accuracy } = req.body;
      if (
        !origin ||
        !destination ||
        typeof origin.lat !== 'number' ||
        typeof origin.lng !== 'number' ||
        typeof destination.lat !== 'number' ||
        typeof destination.lng !== 'number'
      ) {
        return res.status(400).json({ error: 'Coordenadas de origen y destino requeridas' });
      }

      // Check validity
      if (
        origin.lat < -90 || origin.lat > 90 || origin.lng < -180 || origin.lng > 180 ||
        destination.lat < -90 || destination.lat > 90 || destination.lng < -180 || destination.lng > 180 ||
        (destination.lat === 0 && destination.lng === 0)
      ) {
        return res.status(400).json({ error: 'Coordenadas inválidas' });
      }

      const cacheKey = `${origin.lat.toFixed(4)},${origin.lng.toFixed(4)}->${destination.lat.toFixed(4)},${destination.lng.toFixed(4)}`;
      const cached = routesCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < ROUTE_CACHE_TTL) {
        return res.json({ success: true, estimate: cached.estimate });
      }

      const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY;

      // Calculate Haversine baseline
      const R = 6371; // km
      const dLat = ((destination.lat - origin.lat) * Math.PI) / 180;
      const dLon = ((destination.lng - origin.lng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((origin.lat * Math.PI) / 180) *
          Math.cos((destination.lat * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const straightKm = R * c;

      let distanceMeters = Math.round(straightKm * (straightKm < 1 ? 1.2 : 1.28) * 1000);
      let walkingDurationMinutes = Math.round(((distanceMeters / 1000) / 4.5) * 60);
      let drivingDurationMinutes = Math.max(1, Math.round(((distanceMeters / 1000) / 38) * 60));
      let source: 'google_routes_api' | 'topographical_model' = 'topographical_model';

      if (apiKey) {
        try {
          // Compute drive route via Routes API
          const drivePromise = fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Goog-Api-Key': apiKey,
              'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters',
            },
            body: JSON.stringify({
              origin: { location: { latLng: { latitude: origin.lat, longitude: origin.lng } } },
              destination: { location: { latLng: { latitude: destination.lat, longitude: destination.lng } } },
              travelMode: 'DRIVE',
              routingPreference: 'TRAFFIC_UNAWARE',
              units: 'METRIC',
            }),
          });

          // Compute walk route via Routes API
          const walkPromise = fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Goog-Api-Key': apiKey,
              'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters',
            },
            body: JSON.stringify({
              origin: { location: { latLng: { latitude: origin.lat, longitude: origin.lng } } },
              destination: { location: { latLng: { latitude: destination.lat, longitude: destination.lng } } },
              travelMode: 'WALK',
              units: 'METRIC',
            }),
          });

          const [driveRes, walkRes] = await Promise.all([drivePromise, walkPromise]);

          if (driveRes.ok) {
            const driveData: any = await driveRes.json();
            if (driveData?.routes?.[0]) {
              const route = driveData.routes[0];
              if (route.distanceMeters) distanceMeters = route.distanceMeters;
              if (route.duration) {
                // e.g. "240s"
                const secs = parseInt(route.duration.replace('s', ''), 10);
                if (!isNaN(secs)) drivingDurationMinutes = Math.max(1, Math.round(secs / 60));
              }
              source = 'google_routes_api';
            }
          }

          if (walkRes.ok) {
            const walkData: any = await walkRes.json();
            if (walkData?.routes?.[0]?.duration) {
              const secs = parseInt(walkData.routes[0].duration.replace('s', ''), 10);
              if (!isNaN(secs)) walkingDurationMinutes = Math.max(1, Math.round(secs / 60));
            }
          }
        } catch (gmpErr) {
          console.warn('[ROUTES API] Fallback to topographical model:', gmpErr);
        }
      }

      // Format distance
      let formattedDistance = '';
      if (distanceMeters < 1000) {
        formattedDistance = `${Math.max(10, Math.round(distanceMeters / 10) * 10)} m`;
      } else {
        formattedDistance = `${(distanceMeters / 1000).toFixed(1)} km`;
      }

      // Format walking
      let formattedWalking = '';
      if (walkingDurationMinutes < 60) {
        formattedWalking = `${Math.max(1, walkingDurationMinutes)} min caminando`;
      } else {
        const hrs = Math.floor(walkingDurationMinutes / 60);
        const mins = walkingDurationMinutes % 60;
        formattedWalking = mins === 0 ? `${hrs} h caminando` : `${hrs} h ${mins} min caminando`;
      }

      // Format driving
      let formattedDriving = '';
      if (drivingDurationMinutes < 60) {
        formattedDriving = `${Math.max(1, drivingDurationMinutes)} min en auto`;
      } else {
        const hrs = Math.floor(drivingDurationMinutes / 60);
        const mins = drivingDurationMinutes % 60;
        formattedDriving = mins === 0 ? `${hrs} h en auto` : `${hrs} h ${mins} min en auto`;
      }

      const isAccurate = accuracy === undefined || accuracy <= 100;

      const estimate = {
        distanceMeters,
        distanceKm: Math.round((distanceMeters / 1000) * 10) / 10,
        formattedDistance,
        walkingDurationMinutes,
        drivingDurationMinutes,
        formattedWalking,
        formattedDriving,
        summaryText: `A ${formattedDistance} de tu ubicación · ${formattedWalking} · ${formattedDriving}`,
        isEstimateAccurate: isAccurate,
        source,
      };

      routesCache.set(cacheKey, { estimate, timestamp: Date.now() });

      return res.json({ success: true, estimate });
    } catch (err: any) {
      console.error('[ROUTES API ERROR]:', err);
      return res.status(500).json({ error: 'Error calculating route' });
    }
  });

  // =========================================================================
  // ADMIN PASSCODE ENDPOINTS & ANONYMOUS VISIT ANALYTICS
  // =========================================================================

  app.get('/api/admin/auth-status', (_req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    if (getEnvAdminPasscode()) {
      return res.json({ configured: true, mode: 'env' });
    }
    if (readStoredAdminAuth()) {
      return res.json({ configured: true, mode: 'claimed' });
    }
    return res.json({ configured: false, mode: 'unclaimed' });
  });

  app.post('/api/admin/claim', (req, res) => {
    if (getEnvAdminPasscode() || readStoredAdminAuth()) {
      return res.status(409).json({
        error: 'La clave de administración ya fue configurada.',
      });
    }
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const passcode = typeof req.body?.passcode === 'string' ? req.body.passcode.trim() : '';

    if (!AUTHORIZED_ADMIN_EMAILS.has(email)) {
      return res.status(403).json({ error: 'Correo electrónico no autorizado.' });
    }
    if (passcode.length < 6 || passcode.length > 128) {
      return res.status(400).json({ error: 'La clave debe tener al menos 6 caracteres.' });
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const hash = hashPasscodeScrypt(passcode, salt);
    writeJsonAtomic(adminAuthPath, {
      salt,
      hash,
      claimedBy: email,
      claimedAt: new Date().toISOString(),
    });

    return res.json({
      success: true,
      token: signAdminToken(email),
      email,
    });
  });

  app.post('/api/admin/session', (req, res) => {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const passcode = typeof req.body?.passcode === 'string' ? req.body.passcode.trim() : '';

    if (!AUTHORIZED_ADMIN_EMAILS.has(email)) {
      return res.status(403).json({ error: 'Correo electrónico no autorizado.' });
    }
    if (!getEnvAdminPasscode() && !readStoredAdminAuth()) {
      return res.status(428).json({
        error: 'Configurá una clave de acceso por primera vez.',
        needsSetup: true,
      });
    }
    if (!verifyPasscodeAgainstServer(passcode)) {
      return res.status(401).json({ error: 'Clave de administración incorrecta.' });
    }

    return res.json({
      success: true,
      token: signAdminToken(email),
      email,
    });
  });

  // Simple in-memory rate limiter for public analytics recording (60 events/min per IP)
  const analyticsRateMap = new Map<string, { count: number; resetAt: number }>();
  const checkAnalyticsRateLimit = (ip: string): boolean => {
    const now = Date.now();
    if (analyticsRateMap.size > 2000) {
      for (const [key, val] of analyticsRateMap.entries()) {
        if (val.resetAt <= now) analyticsRateMap.delete(key);
      }
    }
    const entry = analyticsRateMap.get(ip);
    if (!entry || entry.resetAt <= now) {
      analyticsRateMap.set(ip, { count: 1, resetAt: now + 60_000 });
      return true;
    }
    if (entry.count >= 60) return false;
    entry.count += 1;
    return true;
  };

  const readVisitsLogFromDisk = (): SiteVisitRecord[] => {
    try {
      if (!fs.existsSync(visitsLogPath)) return [];
      const content = fs.readFileSync(visitsLogPath, 'utf-8');
      const lines = content.split('\n');
      const records: SiteVisitRecord[] = [];
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        try {
          const parsed = JSON.parse(trimmed);
          if (parsed && typeof parsed.t === 'number') {
            records.push({
              t: parsed.t,
              type:
                parsed.type === 'section' || parsed.type === 'place_view'
                  ? parsed.type
                  : 'visit',
              target: typeof parsed.target === 'string' ? parsed.target : undefined,
              label: typeof parsed.label === 'string' ? parsed.label : undefined,
              device: parsed.device === 'desktop' ? 'desktop' : 'mobile',
            });
          }
        } catch {
          // Skip corrupted line
        }
      }
      return records;
    } catch {
      return [];
    }
  };

  const appendVisitToDisk = (record: SiteVisitRecord) => {
    if (!fs.existsSync(revisionsDir)) {
      fs.mkdirSync(revisionsDir, { recursive: true });
    }
    fs.appendFileSync(visitsLogPath, `${JSON.stringify(record)}\n`, 'utf-8');
  };

  // Format timestamp to Argentina (UTC-3) YYYY-MM-DD key
  const toArgentinaDateKey = (ts: number): string => {
    const arDate = new Date(ts - 3 * 60 * 60 * 1000);
    return arDate.toISOString().slice(0, 10);
  };

  const formatShortDateEs = (yyyyMmDd: string): string => {
    const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    const parts = yyyyMmDd.split('-');
    if (parts.length !== 3) return yyyyMmDd;
    const day = parseInt(parts[2], 10);
    const monthIdx = parseInt(parts[1], 10) - 1;
    return `${day} ${months[monthIdx] || parts[1]}`;
  };

  const SECTION_LABELS: Record<string, string> = {
    inicio: 'Inicio',
    explorar: 'Explorar todo',
    mapa: 'Mapa interactivo',
    cerca: 'Cerca de mí',
    agenda: 'Agenda y Eventos',
    guardados: 'Favoritos guardados',
    visitar: 'Qué Visitar',
    comer: 'Gastronomía y Sabores',
    merendar: 'Casas de Té y Meriendas',
    campings: 'Campings y Piletas',
    dormir: 'Dónde Dormir',
    religioso: 'Turismo Religioso',
    naturaleza: 'Naturaleza y Dique',
    historia: 'Historia y Patrimonio',
    actividades: 'Actividades y Aventura',
    senderos: 'Senderos y Trekking',
    audioguias: 'Audioguías',
    oficinas: 'Oficinas de Turismo',
  };

  // Public, anonymous visit/usage event endpoint (no visitor login required)
  // Uses neutral path /api/uso/registrar so mobile privacy shields / ad-blockers never block it
  app.post(['/api/uso/registrar', '/api/analytics/event'], async (req, res) => {
    try {
      const clientIp =
        (typeof req.headers['x-forwarded-for'] === 'string'
          ? req.headers['x-forwarded-for'].split(',')[0].trim()
          : req.socket.remoteAddress) || 'unknown';

      if (!checkAnalyticsRateLimit(clientIp)) {
        return res.status(429).json({ error: 'Demasiados eventos' });
      }

      const rawType = req.body?.type;
      if (rawType !== 'visit' && rawType !== 'section' && rawType !== 'place_view') {
        return res.status(400).json({ error: 'Tipo de evento inválido' });
      }

      const rawDevice = req.body?.device;
      const device: 'mobile' | 'desktop' = rawDevice === 'desktop' ? 'desktop' : 'mobile';

      let target: string | undefined;
      if (typeof req.body?.target === 'string' && req.body.target.trim()) {
        const cleanTarget = req.body.target.trim().slice(0, 80);
        if (/^[a-zA-Z0-9_-]+$/.test(cleanTarget)) {
          target = cleanTarget;
        }
      }

      let label: string | undefined;
      if (typeof req.body?.label === 'string' && req.body.label.trim()) {
        label = req.body.label.trim().replace(/[\r\n\t]+/g, ' ').slice(0, 120);
      }

      const record: SiteVisitRecord = {
        t: Date.now(),
        type: rawType,
        ...(target ? { target } : {}),
        ...(label ? { label } : {}),
        device,
      };

      if (isPostgresConfigured()) {
        try {
          await recordSiteVisitEvent(record);
        } catch (pgErr) {
          console.warn('[ANALYTICS] PostgreSQL write failed, saved to disk log:', pgErr);
        }
      }
      try {
        appendVisitToDisk(record);
      } catch {
        // Non-fatal
      }

      return res.json({ success: true });
    } catch (err) {
      console.error('[ANALYTICS ERROR]:', err);
      return res.status(500).json({ error: 'Error registrando evento' });
    }
  });

  // Admin-only statistics endpoint (accepts Firebase Auth ID token or municipal session token)
  app.get(['/api/uso/resumen', '/api/analytics/stats'], requireAdminAuth, async (_req: AuthRequest, res) => {
    res.setHeader('Cache-Control', 'no-store');

    try {
      let events: SiteVisitRecord[] = [];
      if (isPostgresConfigured()) {
        try {
          events = await getAllSiteVisitEvents();
        } catch (pgErr) {
          console.warn('[ANALYTICS] PostgreSQL read failed, falling back to disk log:', pgErr);
          events = readVisitsLogFromDisk();
        }
      } else {
        events = readVisitsLogFromDisk();
      }

      const now = Date.now();
      const todayKey = toArgentinaDateKey(now);
      const dayMs = 24 * 60 * 60 * 1000;
      const cutoff7 = now - 7 * dayMs;
      const cutoff30 = now - 30 * dayMs;

      let totalVisits = 0;
      let todayVisits = 0;
      let last7DaysVisits = 0;
      let last30DaysVisits = 0;
      let totalPlaceViews = 0;
      let totalSectionClicks = 0;
      let mobileVisits = 0;
      let desktopVisits = 0;
      let firstVisitAt: number | null = null;
      let lastVisitAt: number | null = null;

      // Build last 14 days map in Argentina timezone
      const dailyMap = new Map<string, { visits: number; placeViews: number }>();
      const dailyKeys: string[] = [];
      for (let i = 13; i >= 0; i--) {
        const key = toArgentinaDateKey(now - i * dayMs);
        dailyKeys.push(key);
        dailyMap.set(key, { visits: 0, placeViews: 0 });
      }

      const sectionCounts = new Map<string, { label: string; count: number }>();
      const placeCounts = new Map<string, { label: string; count: number }>();

      for (const ev of events) {
        const dateKey = toArgentinaDateKey(ev.t);

        if (ev.type === 'visit') {
          totalVisits += 1;
          if (firstVisitAt === null || ev.t < firstVisitAt) firstVisitAt = ev.t;
          if (lastVisitAt === null || ev.t > lastVisitAt) lastVisitAt = ev.t;
          if (dateKey === todayKey) todayVisits += 1;
          if (ev.t >= cutoff7) last7DaysVisits += 1;
          if (ev.t >= cutoff30) last30DaysVisits += 1;
          if (ev.device === 'desktop') desktopVisits += 1;
          else mobileVisits += 1;

          const dayBucket = dailyMap.get(dateKey);
          if (dayBucket) dayBucket.visits += 1;
        } else if (ev.type === 'section' && ev.target) {
          totalSectionClicks += 1;
          const prev = sectionCounts.get(ev.target);
          sectionCounts.set(ev.target, {
            label: ev.label || SECTION_LABELS[ev.target] || ev.target,
            count: (prev?.count || 0) + 1,
          });
        } else if (ev.type === 'place_view' && ev.target) {
          totalPlaceViews += 1;
          const dayBucket = dailyMap.get(dateKey);
          if (dayBucket) dayBucket.placeViews += 1;
          const prev = placeCounts.get(ev.target);
          placeCounts.set(ev.target, {
            label: ev.label || prev?.label || ev.target,
            count: (prev?.count || 0) + 1,
          });
        }
      }

      const dailyVisits = dailyKeys.map((date) => {
        const b = dailyMap.get(date) || { visits: 0, placeViews: 0 };
        return {
          date,
          label: formatShortDateEs(date),
          visits: b.visits,
          placeViews: b.placeViews,
        };
      });

      const topSections = Array.from(sectionCounts.entries())
        .map(([id, info]) => ({ id, label: info.label, count: info.count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      const topPlaces = Array.from(placeCounts.entries())
        .map(([id, info]) => ({ id, label: info.label, count: info.count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      return res.json({
        totalVisits,
        todayVisits,
        last7DaysVisits,
        last30DaysVisits,
        totalPlaceViews,
        totalSectionClicks,
        firstVisitAt: firstVisitAt ? new Date(firstVisitAt).toISOString() : null,
        lastVisitAt: lastVisitAt ? new Date(lastVisitAt).toISOString() : null,
        devices: {
          mobile: mobileVisits,
          desktop: desktopVisits,
        },
        dailyVisits,
        topSections,
        topPlaces,
        generatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('[ANALYTICS STATS ERROR]:', err);
      return res.status(500).json({ error: 'Error al consultar estadísticas' });
    }
  });

  // Admin-only reset analytics counter
  app.post(['/api/uso/reiniciar', '/api/analytics/reset'], requireAdminAuth, async (_req: AuthRequest, res) => {
    try {
      if (isPostgresConfigured()) {
        await clearSiteVisitEvents();
      }
      try {
        if (!fs.existsSync(revisionsDir)) {
          fs.mkdirSync(revisionsDir, { recursive: true });
        }
        fs.writeFileSync(visitsLogPath, '', 'utf-8');
      } catch {
        // Non-fatal
      }
      return res.json({ success: true });
    } catch (err) {
      console.error('[ANALYTICS RESET ERROR]:', err);
      return res.status(500).json({ error: 'Error al reiniciar el contador' });
    }
  });

  // Vite middleware in dev or static serving in prod
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Fray Turismo Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
