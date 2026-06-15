import { GeoState, OverlaySettings } from '../types';

function toDMS(decimal: number, isLat: boolean): string {
  const abs = Math.abs(decimal);
  const deg = Math.floor(abs);
  const minFull = (abs - deg) * 60;
  const min = Math.floor(minFull);
  const sec = ((minFull - min) * 60).toFixed(1);

  let dir = '';
  if (isLat) {
    dir = decimal >= 0 ? 'N' : 'S';
  } else {
    dir = decimal >= 0 ? 'L' : 'O';
  }

  return `${deg}°${min}'${sec}"${dir}`;
}

function getFontSize(setting: 'small' | 'medium' | 'large', base: number): number {
  switch (setting) {
    case 'small':
      return base * 0.75;
    case 'large':
      return base * 1.3;
    default:
      return base;
  }
}

export function renderPhotoWithOverlay(
  video: HTMLVideoElement,
  geo: GeoState,
  projectName: string,
  settings: OverlaySettings
): string {
  const canvas = document.createElement('canvas');
  const width = video.videoWidth || 1280;
  const height = video.videoHeight || 720;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d')!;

  // Draw video frame
  ctx.drawImage(video, 0, 0, width, height);

  // Build overlay lines
  const lines: Array<{ text: string; isTitle?: boolean }> = [];

  if (settings.showProject && projectName) {
    lines.push({ text: `Projeto: ${projectName}`, isTitle: true });
  }

  const now = new Date();
  if (settings.showDate) {
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    lines.push({ text: `Data: ${day}/${month}/${year}` });
  }

  if (settings.showTime) {
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    lines.push({ text: `Hora: ${h}:${m}:${s}` });
  }

  if (settings.showCoords) {
    if (geo.lat !== null && geo.lon !== null) {
      if (settings.coordFormat === 'dms') {
        lines.push({ text: `Lat: ${toDMS(geo.lat, true)}` });
        lines.push({ text: `Lon: ${toDMS(geo.lon, false)}` });
      } else {
        lines.push({ text: `Lat: ${geo.lat.toFixed(6)}` });
        lines.push({ text: `Lon: ${geo.lon.toFixed(6)}` });
      }
    } else {
      lines.push({ text: 'Lat: -- / Lon: --' });
    }
  }

  if (settings.showAccuracy && geo.accuracy !== null) {
    lines.push({ text: `Precisão: ${Math.round(geo.accuracy)} m` });
  }

  if (settings.showAltitude && geo.altitude !== null) {
    lines.push({ text: `Altitude: ${Math.round(geo.altitude)} m` });
  }

  if (settings.showCity && (geo.city || geo.state)) {
    const location = [geo.city, geo.state].filter(Boolean).join(' — ');
    if (location) {
      lines.push({ text: location });
    }
  }

  if (lines.length === 0) {
    return canvas.toDataURL('image/jpeg', 0.94);
  }

  // Calculate font size relative to canvas width
  const baseFontSize = Math.max(14, width * 0.022);
  const fontSize = getFontSize(settings.fontSize, baseFontSize);
  const lineHeight = fontSize * 1.55;
  const paddingH = width * 0.025;
  const paddingV = fontSize * 0.75;
  const borderWidth = Math.max(3, width * 0.005);

  const panelHeight = lines.length * lineHeight + paddingV * 2;

  // Logo setup
  let logoImg: HTMLImageElement | null = null;
  const logoHeight = Math.min(fontSize * 3, 60 * (width / 400));

  if (settings.showLogo && settings.logoDataUrl) {
    logoImg = new Image();
    logoImg.src = settings.logoDataUrl;
  }

  // Draw semi-transparent panel
  const panelY = settings.position === 'top' ? 0 : height - panelHeight;

  ctx.fillStyle = 'rgba(3, 3, 3, 0.82)';
  ctx.fillRect(0, panelY, width, panelHeight);

  // Draw neon green left border
  ctx.fillStyle = '#00ff66';
  ctx.fillRect(0, panelY, borderWidth, panelHeight);

  // Draw text lines
  ctx.font = `${fontSize}px 'Courier New', Courier, monospace`;
  ctx.textBaseline = 'top';

  const textX = paddingH + borderWidth * 2;
  let textY = panelY + paddingV;

  // If logo exists on the right side, reserve space
  const logoWidth = logoImg ? (logoHeight * 2) + paddingH : 0;
  const maxTextWidth = width - textX - logoWidth - paddingH;

  lines.forEach((line) => {
    if (line.isTitle) {
      ctx.fillStyle = '#00ff66';
      ctx.font = `bold ${fontSize}px 'Courier New', Courier, monospace`;
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.font = `${fontSize}px 'Courier New', Courier, monospace`;
    }

    // Truncate if needed
    let text = line.text;
    while (ctx.measureText(text).width > maxTextWidth && text.length > 4) {
      text = text.slice(0, -4) + '...';
    }

    ctx.fillText(text, textX, textY);
    textY += lineHeight;
  });

  // Draw logo if set
  if (logoImg && settings.logoDataUrl) {
    const logoX = width - logoHeight * 2 - paddingH;
    const logoY = panelY + (panelHeight - logoHeight) / 2;

    // Draw logo synchronously (it should already be loaded via base64)
    try {
      const aspectRatio = logoImg.naturalWidth / logoImg.naturalHeight || 1;
      const drawWidth = logoHeight * aspectRatio;
      ctx.drawImage(logoImg, logoX, logoY, drawWidth, logoHeight);
    } catch (_) {
      // Logo not loaded yet, skip
    }
  }

  return canvas.toDataURL('image/jpeg', 0.94);
}

export async function renderPhotoWithOverlayAsync(
  video: HTMLVideoElement,
  geo: GeoState,
  projectName: string,
  settings: OverlaySettings
): Promise<string> {
  if (settings.showLogo && settings.logoDataUrl) {
    await new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => resolve();
      img.src = settings.logoDataUrl;
    });
  }
  return renderPhotoWithOverlay(video, geo, projectName, settings);
}
