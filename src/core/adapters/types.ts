// ============================================================================
// 플랫폼 어댑터 인터페이스 (core)
//
// core 는 "실제 파일 바이트를 어디에 저장하는가"를 모른다. 대신 이 인터페이스를
// 통해서만 접근한다. 웹에서는 IndexedDB 구현체(src/platform/web/blobStorage.ts)를
// 쓰고, 나중에 React Native로 옮길 때는 expo-file-system 등을 쓰는 구현체로
// 교체하면 된다 — core/store의 비즈니스 로직과 컴포넌트 코드는 그대로 재사용.
// ============================================================================

export interface BlobStorageAdapter {
  /** key로 바이너리 데이터를 저장한다 */
  saveBlob(key: string, data: Blob): Promise<void>;
  /** key로 저장된 데이터를 열람 가능한 URL(웹) 형태로 돌려준다. 없으면 null */
  getBlobUrl(key: string): Promise<string | null>;
  /** key로 저장된 데이터를 삭제한다 */
  deleteBlob(key: string): Promise<void>;
}
