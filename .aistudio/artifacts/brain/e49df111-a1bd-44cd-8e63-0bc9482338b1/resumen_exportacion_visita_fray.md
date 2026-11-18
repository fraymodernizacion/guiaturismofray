# Exportación de Información Turística — Visitá Fray

Se recuperó íntegramente la información turística almacenada en el proyecto **sin modificar ni eliminar archivos existentes** y sin inventar ni completar datos faltantes.

## Archivos Exportados
En este directorio de artefactos quedaron generados los dos archivos principales listos para migrar a la nueva versión:
1. **`visita_fray_export_completo.json`** — Exportación estructurada completa:
   - `registros_verificados_y_completos` (**2 registros**)
   - `registros_incompletos_o_no_verificables` (**56 registros**, cada uno con su arreglo `motivosRevision` y sin alterar los campos originales)
   - `categorias` (**8 categorías**)
   - `localidades` (**8 localidades** + 4 puntos de referencia de mapa)
   - `imagenes_almacenadas` (**47 archivos de imagen** relevados en disco con su ruta, tamaño y si están referenciados)
   - `eventos_agenda` (**5 eventos**), `audioguias` (**5 audioguías**), `experiencias` (**6 circuitos**), `informacion_util_y_emergencias`
2. **`visita_fray_lugares.csv`** — Planilla UTF-8 (con BOM para Excel/Google Sheets) con los **58 lugares y establecimientos**, encabezados por la columna `grupo_revision` (`VERIFICADO_COMPLETO` vs `INCOMPLETO_O_REVISAR`) y `motivos_revision`.

---

## Resumen Cuantitativo (58 lugares / establecimientos)

| Grupo | Cantidad | Detalle |
| --- | ---: | --- |
| **Verificados y completos** (estado `verificado`, foto asignada y enlace Google Maps explícito) | **2** | Casa Natal de Fray Mamerto Esquiú, Monumento al Beato Mamerto Esquiú |
| **Incompletos o requieren revisión** | **56** | Separados según qué dato falta o requiere validación |
| — *Con foto asignada, sin enlace de Google Maps o sin estado `verificado`* | 3 | Dique y Embalse Las Pirquitas *(nota: teléfono `4567890` parece genérico)*, Iglesia de San José de Piedra Blanca, La Casona de Piedra Blanca |
| — *Con enlace de Google Maps explícito, pero sin imagen asignada* | 4 | Ruinas del Trapiche Azucarero, Paluma Cervecería, Amadeus Bar, El Chaperío de Mamerto |
| — *Estado `verificado`, pero sin imagen ni enlace de Google Maps* | 8 | Casa de Piedra, Santuario Señor de los Milagros, Campanas del Rosario & Capilla, Cuesta del Cura & Cuesta del Gracián, Paseo Las Moras & Costanera del Dique *(tel. `4567890`)*, Tienda de Artesanías (Trapiche), Plaza Parque Chacarero, Vertedero y Mirador Dique Las Pirquitas |
| — *Estado `pendiente_validacion` (sin imagen ni enlace de Google Maps)* | 32 | Establecimientos de gastronomía, alojamientos, piletas, alquiler de bicis, kayak y artesanías de la Guía Oficial |
| — *Estado `dato_pendiente_actualizacion`* | 1 | Pileta Polideportivo Evita (teléfono pendiente de actualización, sin foto ni Maps) |
| — *Sin estado de validación, sin imagen ni enlace de Google Maps* | 8 | Casa de Té La Calera, Hostería y Cabañas del Dique, Balneario San Antonio, Club Náutico & Kayak Pirquitas, Parrilla El Quincho, Helados San José, Cabañas Sol y Sierras, Sendero Serranías del Gracián |

---

## Enlaces de Google Maps Explícitos Encontrados (6)
- **Casa Natal de Fray Mamerto Esquiú** (`casa-natal-esquiu`): `https://maps.app.goo.gl/xQJHPy1nYiffXkeU7`
- **Monumento al Beato Mamerto Esquiú** (`monumento-esquiu`): `https://maps.app.goo.gl/5EZx4Lnhi4ibEV7j7`
- **Ruinas del Trapiche Azucarero** (`trapiche-azucarero`): `https://maps.app.goo.gl/eBNxMQdTsg5jviUz7`
- **Paluma Cervecería** (`paluma-cerveceria`): `https://maps.app.goo.gl/Ua6s9jgnMowxLQ886`
- **Amadeus Bar** (`amadeus-bar`): `https://maps.app.goo.gl/qpwsFgGEgLCqsgvN9`
- **El Chaperío de Mamerto** (`el-chaperio-de-mamerto`): `https://maps.app.goo.gl/RLqDk8Q5Lko7hQpe7`

*(El resto de los 52 lugares posee coordenadas `lat`/`lng` almacenadas, pero sin URL verificada de Google Maps; conviene revisarlas antes de publicar.)*

---

## Imágenes Almacenadas en Disco
Se relevaron **47 archivos de imagen** distribuidos entre `public/`, `public/images/`, `public/uploads/` y `src/assets/images/`:
- **13 rutas referenciadas** actualmente en fichas de lugares, audioguías y portadas (incluyendo `/images/casa-natal-esquiu.jpg`, `/images/dique-las-pirquitas.jpg`, `/images/dique-las-pirquitas-hero.jpg`, `/images/iglesia-san-jose.jpg`, `/images/templo-san-jose-piedra-blanca.jpg`, `/images/casona-piedra-blanca.jpg`, `/images/monumento-beato-esquiu.jpg` y `/dique%20las%20pirquitas.jpg`).
- **34 archivos adicionales** en disco (copias duplicadas entre carpetas, imágenes históricas/paisajes como `Cuesta de Las Pirquitas STEFAN SAUZUK`, y subidas anteriores) detallados en el campo `imagenes_almacenadas` del JSON para que decidas cuáles reutilizar o descartar.

---

## Diferencias detectadas entre código fuente y base local
Al comparar las definiciones iniciales de la aplicación contra el respaldo persistido en disco, se detectaron diferencias menores en 3 registros (`dique-las-pirquitas`, `trapiche-azucarero`, `monumento-esquiu`). Ambas versiones quedaron preservadas dentro del objeto `diferenciaEnDataPlacesJson` de cada registro en `visita_fray_export_completo.json` para tu revisión.
