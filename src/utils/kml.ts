import { CapturedPhoto } from '../types';

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function generateKML(photos: CapturedPhoto[], documentName: string): string {
  const withCoords = photos.filter((p) => p.lat !== null && p.lon !== null);

  const placemarks = withCoords.map((p, idx) => {
    const dt = new Date(p.capturedAt);
    const date = dt.toLocaleDateString('pt-BR');
    const time = dt.toLocaleTimeString('pt-BR');
    const name = `Foto ${String(idx + 1).padStart(3, '0')} — ${date}`;

    const descParts: string[] = [`Data: ${date} ${time}`];
    if (p.city || p.state) {
      descParts.push(`Local: ${[p.city, p.state].filter(Boolean).join(' — ')}`);
    }
    if (p.observation) {
      descParts.push(`Obs: ${p.observation}`);
    }

    const alt = p.altitude ?? 0;

    return `    <Placemark>
      <name>${escapeXml(name)}</name>
      <description>${escapeXml(descParts.join('\n'))}</description>
      <Point>
        <coordinates>${p.lon},${p.lat},${alt}</coordinates>
      </Point>
    </Placemark>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>${escapeXml(documentName)}</name>
${placemarks.join('\n')}
  </Document>
</kml>`;
}

export function downloadKML(kml: string, filename: string): void {
  const blob = new Blob([kml], { type: 'application/vnd.google-earth.kml+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
