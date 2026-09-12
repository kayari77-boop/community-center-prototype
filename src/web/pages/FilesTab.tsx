import { useRef } from 'react';
import { useAppStore } from '../../core/store/appStore';
import { getClubFiles, findMemberName } from '../../core/store/selectors';
import { canDeleteFile, canUploadFile } from '../../core/permissions';
import { formatDate, formatFileSize, generateId } from '../../core/utils';
import { useActiveMember } from '../context/ActiveMemberContext';
import { webBlobStorage } from '../../platform/web/blobStorage';
import EmptyState from '../components/EmptyState';

export default function FilesTab() {
  const { club, member } = useActiveMember();
  const members = useAppStore((s) => s.members);
  const files = useAppStore((s) => s.files);
  const addFileRecord = useAppStore((s) => s.addFileRecord);
  const deleteFileRecord = useAppStore((s) => s.deleteFileRecord);
  const inputRef = useRef<HTMLInputElement>(null);

  const clubFiles = getClubFiles(files, club.id);

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const blobKey = generateId();
    await webBlobStorage.saveBlob(blobKey, file);
    addFileRecord({
      clubId: club.id,
      fileName: file.name,
      mimeType: file.type || 'application/octet-stream',
      size: file.size,
      uploaderId: member.id,
      blobKey,
    });
  };

  const onDownload = async (blobKey: string, fileName: string) => {
    const url = await webBlobStorage.getBlobUrl(blobKey);
    if (!url) {
      alert('파일을 찾을 수 없어요.');
      return;
    }
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  };

  const onDelete = async (id: string, blobKey: string) => {
    if (!confirm('이 자료를 삭제할까요?')) return;
    await webBlobStorage.deleteBlob(blobKey);
    deleteFileRecord(id);
  };

  return (
    <div className="card">
      <div className="row between">
        <h3 style={{ margin: 0 }}>📁 자료실</h3>
        {canUploadFile(member.role) && (
          <>
            <input ref={inputRef} type="file" hidden onChange={onPick} />
            <button className="btn btn-primary btn-sm" onClick={() => inputRef.current?.click()}>
              ⬆️ 업로드
            </button>
          </>
        )}
      </div>

      {clubFiles.length === 0 ? (
        <EmptyState emoji="🗄️" text="아직 업로드된 자료가 없어요." />
      ) : (
        <div>
          {clubFiles.map((f) => (
            <div key={f.id} className="file-item">
              <div>
                <div style={{ fontWeight: 700 }}>📄 {f.fileName}</div>
                <div className="meta">
                  {findMemberName(members, f.uploaderId)} · {formatDate(f.uploadedAt)} · {formatFileSize(f.size)}
                </div>
              </div>
              <div className="row">
                <button className="btn btn-ghost btn-sm" onClick={() => onDownload(f.blobKey, f.fileName)}>
                  다운로드
                </button>
                {canDeleteFile(member.role, f.uploaderId === member.id) && (
                  <button className="btn btn-danger btn-sm" onClick={() => onDelete(f.id, f.blobKey)}>
                    삭제
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
