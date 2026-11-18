import express from 'express';
import path from 'path';
import fs from 'fs';
import { isPostgresConfigured } from './src/db/index.ts';
import {
  getAllAudioguides,
  getAllEvents,
  getAllPlaces,
  getMediaUpload,
  getSiteConfig,
  replaceAllAudioguides,
  replaceAllEvents,
  replaceAllPlaces,
  saveMediaUpload,
  saveSiteConfig,
} from './src/db/repository.ts';

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

  app.use('/uploads', express.static(uploadsDir));
  app.get('/uploads/:filename', async (req, res, next) => {
    if (!isPostgresConfigured()) return next();
    try {
      const media = await getMediaUpload(req.params.filename);
      if (!media) return next();
      const buffer = Buffer.from(media.dataBase64, 'base64');
      res.setHeader('Content-Type', media.mimeType);
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      return res.send(buffer);
    } catch {
      return next();
    }
  });
  app.use('/images', express.static(imagesDir));
  app.use(express.static(path.join(process.cwd(), 'public')));

  // Health check API
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      database: isPostgresConfigured() ? 'postgresql' : 'json',
      timestamp: new Date().toISOString(),
    });
  });

  // Persistent Image Upload API
  app.post('/api/upload', async (req, res) => {
    try {
      const { filename, dataUrl, base64 } = req.body;
      if (!dataUrl && !base64) {
        return res.status(400).json({ error: 'No image data provided' });
      }

      // Clean or generate file name
      let cleanName = (filename || `foto_${Date.now()}.jpg`)
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

      const targetPath = path.join(uploadsDir, cleanName);
      fs.writeFileSync(targetPath, buffer);

      // If dist/uploads exists in production, also copy there for instant access
      const distUploads = path.join(process.cwd(), 'dist', 'uploads');
      if (fs.existsSync(distUploads)) {
        fs.writeFileSync(path.join(distUploads, cleanName), buffer);
      }

      if (isPostgresConfigured()) {
        await saveMediaUpload(cleanName, mimeType, rawBase64, buffer.length);
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
      return res.status(500).json({ error: 'Error al procesar y guardar la imagen', details: err.message });
    }
  });

  // Places Persistence API (Sync between devices & reloads)
  const placesFilePath = path.join(dataDir, 'places.json');
  const siteConfigFilePath = path.join(dataDir, 'site_config.json');
  const eventsFilePath = path.join(dataDir, 'events.json');
  const audioguidesFilePath = path.join(dataDir, 'audioguides.json');

  // Site Config API (CMS & Section Customization)
  app.get('/api/site-config', async (req, res) => {
    try {
      if (isPostgresConfigured()) {
        const config = await getSiteConfig();
        return res.json({ config });
      }
      if (fs.existsSync(siteConfigFilePath)) {
        const content = fs.readFileSync(siteConfigFilePath, 'utf-8');
        const data = JSON.parse(content);
        return res.json({ config: data });
      }
      return res.json({ config: null });
    } catch (err: any) {
      console.error('[DATABASE] Error reading site config:', err);
      return res.status(500).json({ error: 'Error reading site config' });
    }
  });

  app.post('/api/site-config', async (req, res) => {
    try {
      const { config } = req.body;
      if (!config || typeof config !== 'object') {
        return res.status(400).json({ error: 'Expected valid site config object' });
      }
      if (isPostgresConfigured()) {
        await saveSiteConfig(config);
      } else {
        fs.writeFileSync(siteConfigFilePath, JSON.stringify(config, null, 2), 'utf-8');
      }
      console.log('[DATABASE] Saved site configuration to persistent storage.');
      return res.json({ success: true });
    } catch (err: any) {
      console.error('[DATABASE ERROR] Failed to save site config:', err);
      return res.status(500).json({ error: 'Error saving site config' });
    }
  });

  // Events API
  app.get('/api/events', async (req, res) => {
    try {
      if (isPostgresConfigured()) {
        const events = await getAllEvents();
        return res.json({ events });
      }
      if (fs.existsSync(eventsFilePath)) {
        const content = fs.readFileSync(eventsFilePath, 'utf-8');
        const data = JSON.parse(content);
        return res.json({ events: data });
      }
      return res.json({ events: null });
    } catch (err: any) {
      console.error('[DATABASE] Error reading events:', err);
      return res.status(500).json({ error: 'Error reading events' });
    }
  });

  app.post('/api/events', async (req, res) => {
    try {
      const { events } = req.body;
      if (!Array.isArray(events)) {
        return res.status(400).json({ error: 'Expected array of events' });
      }
      if (isPostgresConfigured()) {
        const count = await replaceAllEvents(events);
        return res.json({ success: true, count });
      }
      fs.writeFileSync(eventsFilePath, JSON.stringify(events, null, 2), 'utf-8');
      return res.json({ success: true, count: events.length });
    } catch (err: any) {
      console.error('[DATABASE ERROR] Failed to save events:', err);
      return res.status(500).json({ error: 'Error saving events' });
    }
  });

  // Audioguides API
  app.get('/api/audioguides', async (req, res) => {
    try {
      if (isPostgresConfigured()) {
        const audioguides = await getAllAudioguides();
        return res.json({ audioguides });
      }
      if (fs.existsSync(audioguidesFilePath)) {
        const content = fs.readFileSync(audioguidesFilePath, 'utf-8');
        const data = JSON.parse(content);
        return res.json({ audioguides: data });
      }
      return res.json({ audioguides: null });
    } catch (err: any) {
      console.error('[DATABASE] Error reading audioguides:', err);
      return res.status(500).json({ error: 'Error reading audioguides' });
    }
  });

  app.post('/api/audioguides', async (req, res) => {
    try {
      const { audioguides } = req.body;
      if (!Array.isArray(audioguides)) {
        return res.status(400).json({ error: 'Expected array of audioguides' });
      }
      if (isPostgresConfigured()) {
        const count = await replaceAllAudioguides(audioguides);
        return res.json({ success: true, count });
      }
      fs.writeFileSync(audioguidesFilePath, JSON.stringify(audioguides, null, 2), 'utf-8');
      return res.json({ success: true, count: audioguides.length });
    } catch (err: any) {
      console.error('[DATABASE ERROR] Failed to save audioguides:', err);
      return res.status(500).json({ error: 'Error saving audioguides' });
    }
  });

  app.get('/api/places', async (req, res) => {
    try {
      if (isPostgresConfigured()) {
        const places = await getAllPlaces();
        return res.json({ places });
      }
      if (fs.existsSync(placesFilePath)) {
        const content = fs.readFileSync(placesFilePath, 'utf-8');
        const data = JSON.parse(content);
        return res.json({ places: data });
      }
      return res.json({ places: null });
    } catch (err: any) {
      console.error('[DATABASE] Error reading places:', err);
      return res.status(500).json({ error: 'Error reading places database' });
    }
  });

  app.post('/api/places', async (req, res) => {
    try {
      const { places } = req.body;
      if (!Array.isArray(places)) {
        return res.status(400).json({ error: 'Expected array of places' });
      }
      if (isPostgresConfigured()) {
        const count = await replaceAllPlaces(places);
        console.log(`[DATABASE] Saved ${count} places to PostgreSQL.`);
        return res.json({ success: true, count });
      }
      fs.writeFileSync(placesFilePath, JSON.stringify(places, null, 2), 'utf-8');
      console.log(`[DATABASE] Saved ${places.length} places to persistent storage.`);
      return res.json({ success: true, count: places.length });
    } catch (err: any) {
      console.error('[DATABASE ERROR] Failed to save places:', err);
      return res.status(500).json({ error: 'Error saving places database' });
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
