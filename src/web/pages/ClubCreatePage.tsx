import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppStore } from '../../core/store/appStore';
import { JoinPolicy } from '../../core/types';

export default function ClubCreatePage() {
  const createClub = useAppStore((s) => s.createClub);
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [joinPolicy, setJoinPolicy] = useState<JoinPolicy>('approval');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const { clubId } = createClub({ name: name.trim(), description: description.trim(), joinPolicy });
    navigate(`/clubs/${clubId}`);
  };

  return (
    <div className="page">
      <Link to="/clubs" className="link-back">
        ← 동호회존
      </Link>
      <h1>➕ 새 동호회 만들기</h1>

      <form className="card stack" onSubmit={submit}>
        <div className="field">
          <label>동호회 이름</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="예: 주말 등산 동호회" required />
        </div>
        <div className="field">
          <label>소개</label>
          <textarea
            className="textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="어떤 모임인지 간단히 소개해주세요"
          />
        </div>
        <div className="field">
          <label>가입 방식</label>
          <div className="row wrap">
            <label className="row" style={{ cursor: 'pointer' }}>
              <input
                type="radio"
                checked={joinPolicy === 'instant'}
                onChange={() => setJoinPolicy('instant')}
              />
              즉시가입 (신청하면 바로 회원)
            </label>
            <label className="row" style={{ cursor: 'pointer' }}>
              <input
                type="radio"
                checked={joinPolicy === 'approval'}
                onChange={() => setJoinPolicy('approval')}
              />
              승인제 (동호회장/총무 승인 필요)
            </label>
          </div>
        </div>
        <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
          🗂 만든 동호회는 &quot;개설 승인 대기&quot; 상태로 시작해요. 동호회존 홈에서 승인해주세요.
        </p>
        <button type="submit" className="btn btn-primary">
          동호회 만들기
        </button>
      </form>
    </div>
  );
}
