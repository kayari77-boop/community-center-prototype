import { useEffect, useRef, useState } from 'react';
import { useAppStore } from '../../core/store/appStore';
import { findMemberName, getClubChat } from '../../core/store/selectors';
import { formatDateTime } from '../../core/utils';
import { useActiveMember } from '../context/ActiveMemberContext';
import EmptyState from '../components/EmptyState';

// 보조 기능 (단순 버전): 저장된 메시지를 시간순으로 보여주는 로컬 채팅.
export default function ChatTab() {
  const { club, member } = useActiveMember();
  const members = useAppStore((s) => s.members);
  const chatMessages = useAppStore((s) => s.chatMessages);
  const sendChatMessage = useAppStore((s) => s.sendChatMessage);
  const [text, setText] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  const messages = getClubChat(chatMessages, club.id);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages.length]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendChatMessage(club.id, member.id, text.trim());
    setText('');
  };

  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>💬 채팅</h3>

      {messages.length === 0 ? (
        <EmptyState emoji="💭" text="아직 대화가 없어요. 첫 메시지를 보내보세요!" />
      ) : (
        <div className="stack" style={{ maxHeight: 420, overflowY: 'auto', padding: '4px 2px' }}>
          {messages.map((m) => {
            const mine = m.authorId === member.id;
            return (
              <div key={m.id} style={{ display: 'flex', flexDirection: 'column' }}>
                <div className={`chat-bubble${mine ? ' me' : ''}`}>
                  {!mine && <div className="author">{findMemberName(members, m.authorId)}</div>}
                  {m.text}
                </div>
                <div className="meta" style={{ margin: mine ? '2px 0 0 auto' : '2px 0 0 4px' }}>
                  {formatDateTime(m.createdAt)}
                </div>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>
      )}

      <form className="row" onSubmit={submit} style={{ marginTop: 12 }}>
        <input
          className="input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="메시지를 입력하세요"
        />
        <button type="submit" className="btn btn-primary">
          보내기
        </button>
      </form>
    </div>
  );
}
