import { useState } from 'react';
import { useAppStore } from '../../core/store/appStore';
import { getApprovedMembers, getPendingMembers } from '../../core/store/selectors';
import { canApproveJoin, canManageMembers, roleLabel } from '../../core/permissions';
import { Role } from '../../core/types';
import { useActiveMember } from '../context/ActiveMemberContext';
import RoleBadge from '../components/RoleBadge';

export default function MembersTab() {
  const { club, member } = useActiveMember();
  const members = useAppStore((s) => s.members);
  const setMemberRole = useAppStore((s) => s.setMemberRole);
  const removeMember = useAppStore((s) => s.removeMember);
  const approveMember = useAppStore((s) => s.approveMember);
  const rejectMember = useAppStore((s) => s.rejectMember);
  const addInstantMember = useAppStore((s) => s.addInstantMember);
  const requestJoin = useAppStore((s) => s.requestJoin);

  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<Role>('member');
  const [applicantName, setApplicantName] = useState('');

  const approved = getApprovedMembers(members, club.id);
  const pending = getPendingMembers(members, club.id);

  const iCanManageMembers = canManageMembers(member.role);
  const iCanApproveJoin = canApproveJoin(member.role);

  const addInstant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    addInstantMember(club.id, newName.trim(), newRole);
    setNewName('');
  };

  const addApplicant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName.trim()) return;
    requestJoin(club.id, applicantName.trim());
    setApplicantName('');
  };

  return (
    <div className="stack">
      <div className="card">
        <h3 style={{ marginTop: 0 }}>👥 멤버 ({approved.length})</h3>
        <div className="stack">
          {approved.map((m) => (
            <div key={m.id} className="row between">
              <div className="row">
                <strong>{m.name}</strong>
                <RoleBadge role={m.role} />
              </div>
              {iCanManageMembers && m.id !== member.id && (
                <div className="row">
                  <select
                    className="input"
                    style={{ width: 'auto' }}
                    value={m.role}
                    onChange={(e) => setMemberRole(m.id, e.target.value as Role)}
                  >
                    {(['president', 'manager', 'member'] as Role[]).map((r) => (
                      <option key={r} value={r}>
                        {roleLabel[r]}
                      </option>
                    ))}
                  </select>
                  <button className="btn btn-danger btn-sm" onClick={() => removeMember(m.id)}>
                    내보내기
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {pending.length > 0 && (
        <div className="card">
          <h3 style={{ marginTop: 0 }}>⏳ 가입 승인 대기 ({pending.length})</h3>
          <div className="stack">
            {pending.map((m) => (
              <div key={m.id} className="row between">
                <span>{m.name}</span>
                {iCanApproveJoin ? (
                  <div className="row">
                    <button className="btn btn-leaf btn-sm" onClick={() => approveMember(m.id)}>
                      승인
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => rejectMember(m.id)}>
                      거절
                    </button>
                  </div>
                ) : (
                  <span className="badge pending">승인 대기</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {iCanManageMembers && (
        <div className="card">
          <h3 style={{ marginTop: 0 }}>🧪 테스트 도구 (실제 서비스에는 없음)</h3>
          <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
            개발자 1인 사용 전제라 다른 회원이 실제로 가입할 수 없어요. 대신 가상의 멤버를 만들어
            역할별 화면과 가입 승인 흐름을 확인할 수 있어요.
          </p>
          <div className="row wrap" style={{ alignItems: 'flex-end' }}>
            <form className="row" onSubmit={addInstant}>
              <input
                className="input"
                placeholder="이름"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                style={{ width: 120 }}
              />
              <select className="input" style={{ width: 'auto' }} value={newRole} onChange={(e) => setNewRole(e.target.value as Role)}>
                {(['president', 'manager', 'member'] as Role[]).map((r) => (
                  <option key={r} value={r}>
                    {roleLabel[r]}
                  </option>
                ))}
              </select>
              <button type="submit" className="btn btn-ghost btn-sm">
                즉시 멤버로 추가
              </button>
            </form>
          </div>
          <div className="row wrap" style={{ marginTop: 10 }}>
            <form className="row" onSubmit={addApplicant}>
              <input
                className="input"
                placeholder="가입 신청자 이름"
                value={applicantName}
                onChange={(e) => setApplicantName(e.target.value)}
                style={{ width: 140 }}
              />
              <button type="submit" className="btn btn-ghost btn-sm">
                가입 신청으로 추가 ({club.joinPolicy === 'instant' ? '즉시가입' : '승인 대기'})
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
