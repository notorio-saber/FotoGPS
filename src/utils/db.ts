import { CapturedPhoto } from '../types';

const DB_NAME = 'geofoto-db';
const DB_VERSION = 1;
const STORE_NAME = 'photos';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('projectId', 'projectId', { unique: false });
        store.createIndex('capturedAt', 'capturedAt', { unique: false });
      }
    };
  });
}

export async function savePhoto(
  photo: Omit<CapturedPhoto, 'id'>
): Promise<number> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.add(photo);
    request.onsuccess = () => resolve(request.result as number);
    request.onerror = () => reject(request.error);
  });
}

export async function getPhotos(): Promise<CapturedPhoto[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => {
      const photos = (request.result as CapturedPhoto[]).sort(
        (a, b) => b.capturedAt - a.capturedAt
      );
      resolve(photos);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function getPhotosByProject(
  projectId: string
): Promise<CapturedPhoto[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('projectId');
    const request = index.getAll(projectId);
    request.onsuccess = () => {
      const photos = (request.result as CapturedPhoto[]).sort(
        (a, b) => b.capturedAt - a.capturedAt
      );
      resolve(photos);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function deletePhoto(id: number): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
