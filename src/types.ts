export type LicenseStatus = 'active' | 'blocked' | 'trial';

export interface UserProfile {
  uid: string;
  email: string;
  nome: string;
  photoURL: string;
  licenseStatus: LicenseStatus;
  createdAt: number;
  photoCount: number;
}

export interface Project {
  id: string;
  name: string;
  createdAt: number;
}

export interface GeoState {
  lat: number | null;
  lon: number | null;
  accuracy: number | null;
  altitude: number | null;
  city: string;
  state: string;
  loading: boolean;
}

export interface OverlaySettings {
  showDate: boolean;
  showTime: boolean;
  showCoords: boolean;
  showAccuracy: boolean;
  showAltitude: boolean;
  showCity: boolean;
  showProject: boolean;
  showLogo: boolean;
  logoDataUrl: string;
  coordFormat: 'decimal' | 'dms';
  fontSize: 'small' | 'medium' | 'large';
  position: 'bottom' | 'top';
}

export interface CapturedPhoto {
  id: number;
  projectId: string;
  projectName: string;
  dataUrl: string;
  capturedAt: number;
  lat: number | null;
  lon: number | null;
  altitude?: number | null;
  city: string;
  state: string;
  observation?: string;
}
