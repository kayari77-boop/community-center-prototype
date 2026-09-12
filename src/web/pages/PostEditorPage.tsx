import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '../../core/store/appStore';
import { canPostNotice } from '../../core/permissions';
import { useActiveMember } from '../context/ActiveMemberContext';
import { todayYMD } from '../../core/utils';

export default function PostEditorPage() {
  const { club, member } = useActiveMember();
  const { postId } = useParams<{ postId: string }>();
  const posts = useAppStore((s) => s.posts);
  const createPost = useAppStore((s) => s.createPost);
  const updatePost = useAppStore((s) => s.updatePost);
  const navigate = useNavigate();

  const existing = postId ? posts.find((p) => p.id === postId) : undefined;
  const isEditing = !!existing;

  const [title, setTitle] = useState(existing?.title ?? '');
  const [content, setContent] = useState(existing?.content ?? '');
  const [isNotice, setIsNotice] = useState(existing?.isNotice ?? false);
  const [hasEvent, setHasEvent] = useState(!!existing?.event);
  const [date, setDate] = useState(existing?.event?.date ?? todayYMD());
  const [time, setTime] = useState(existing?.event?.time ?? '');
  const [location, setLocation] = useState(existing?.event?.location ?? '');
  const [itemsToBring, setItemsToBring] = useState(existing?.event?.itemsToBring ?? '');
  const [feeInfo, setFeeInfo] = useState(existing?.event?.feeInfo ?? '');

  const allowNotice = canPostNotice(member.role);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const event =
      isNotice && hasEvent
        ? { date, time: time || undefined, location: location || undefined, itemsToBring: itemsToBring || undefined, feeInfo: feeInfo || undefined }
        : undefined;

    if (isEditing) {
      updatePost(existing!.id, {
        title: title.trim(),
        content: content.trim(),
        isNotice,
        event: event ?? null,
      });
      navigate(`../${existing!.id}`, { relative: 'path' });
    } else {
      const id = createPost({
        clubId: club.id,
        authorId: member.id,
        title: title.trim(),
        content: content.trim(),
        isNotice,
        event,
      });
      navigate(`../${id}`, { relative: 'path' });
    }
  };

  return (
    <div className="card">
      <Link to={isEditing ? `../${existing!.id}` : '..'} relative="path" className="link-back">
        ← 취소
      </Link>
      <h3>{isEditing ? '✏️ 글 수정' : '✏️ 새 글쓰기'}</h3>

      <form className="stack" onSubmit={submit}>
        <div className="field">
          <label>제목</label>
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className="field">
          <label>내용</label>
          <textarea className="textarea" value={content} onChange={(e) => setContent(e.target.value)} />
        </div>

        {allowNotice && (
          <label className="row" style={{ cursor: 'pointer' }}>
            <input type="checkbox" checked={isNotice} onChange={(e) => setIsNotice(e.target.checked)} />
            📌 공지사항으로 등록
          </label>
        )}

        {isNotice && (
          <label className="row" style={{ cursor: 'pointer' }}>
            <input type="checkbox" checked={hasEvent} onChange={(e) => setHasEvent(e.target.checked)} />
            🎒 모임 정보 포함 (날짜/장소/준비물/회비 + 참석체크)
          </label>
        )}

        {isNotice && hasEvent && (
          <div className="event-box stack" style={{ background: '#fff', borderStyle: 'solid' }}>
            <div className="field">
              <label>날짜</label>
              <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div className="field">
              <label>시간</label>
              <input className="input" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
            <div className="field">
              <label>장소</label>
              <input className="input" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <div className="field">
              <label>준비물</label>
              <input className="input" value={itemsToBring} onChange={(e) => setItemsToBring(e.target.value)} />
            </div>
            <div className="field">
              <label>회비 여부</label>
              <input
                className="input"
                value={feeInfo}
                onChange={(e) => setFeeInfo(e.target.value)}
                placeholder="예: 5,000원 / 무료"
              />
            </div>
          </div>
        )}

        <button type="submit" className="btn btn-primary">
          {isEditing ? '수정 완료' : '등록하기'}
        </button>
      </form>
    </div>
  );
}
