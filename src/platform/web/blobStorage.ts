// ============================================================================
// 웹용 BlobStorageAdapter 구현 (platform/web)
//
// 자료(파일) 실제 바이트는 localStorage에 넣기엔 용량 제약이 크므로 IndexedDB에
// 저장한다. core는 이 구현을 모르고 BlobStorageAdapter 인터페이스만 안다 —
// 나중에 React Native로 옮길 때는 이 파일 대신 expo-file-system 등을 쓰는
// 구현체를 만들어 끼우면 되고, core나 웹 컴포넌트 코드는 손댈 필요가 없다.
// ============================================================================

import { BlobStorageAdapter } from '../../core/adapters/types';

const DB_NAME = 'club-zone-files';
const STORE_NAME = 'blobs';
const DB_VERSION = 1;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export const webBlobStorage: BlobStorageAdapter = {
  async saveBlob(key, data) {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put(data, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  },

  async getBlobUrl(key) {
    const db = await openDb();
    const blob = await new Promise<Blob | undefined>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).get(key);
      req.onsuccess = () => resolve(req.result as Blob | undefined);
      req.onerror = () => reject(req.error);
    });
    db.close();
    return blob ? URL.createObjectURL(blob) : null;
  },

  async deleteBlob(key) {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  },
};
