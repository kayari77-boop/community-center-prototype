import { useState } from 'react';
import { useAppStore } from '../../core/store/appStore';
import { getApprovedMembers, getClubFees, findMemberName } from '../../core/store/selectors';
import { canManageFees } from '../../core/permissions';
import { formatCurrency, formatDate, todayYMD } from '../../core/utils';
import { useActiveMember } from '../context/ActiveMemberContext';
import EmptyState from '../components/EmptyState';

export default function FeesTab() {
  const { club, member } = useActiveMember();
  const members = useAppStore((s) => s.members);
  const feeRecords = useAppStore((s) => s.feeRecords);
  const addFeeRecord = useAppStore((s) => s.addFeeRecord);
  const updateFeeRecord = useAppStore((s) => s.updateFeeRecord);
  const deleteFeeRecord = useAppStore((s) => s.deleteFeeRecord);

  const approvedMembers = getApprovedMembers(members, club.id);
  const records = getClubFees(feeRecords, club.id);
  const canManage = canManageFees(member.role);

  const [memberId, setMemberId] = useState(approvedMembers[0]?.id ?? '');
  const [amount, setAmount] = useState(10000);
  const [date, setDate] = useState(todayYMD());
  const [paid, setPaid] = useState(true);
  const [memo, setMemo] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberId) return;
    addFeeRecord({ clubId: club.id, memberId, amount, date, paid, memo: memo.trim() || undefined, recordedBy: member.id });
    setMemo('');
  };

  const totalPaid = records.filter((r) => r.paid).reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="stack">
      <div className="card">
        <h3 style={{ marginTop: 0 }}>💰 회비 장부</h3>
        <p style={{ color: 'var(--ink-soft)', fontSize: 13 }}>수기 기록 · 총 납부액 {formatCurrency(totalPaid)}</p>

        {records.length === 0 ? (
          <EmptyState emoji="🧾" text="아직 회비 기록이 없어요." />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="fee-table">
              <thead>
                <tr>
                  <th>이름</th>
                  <th>금액</th>
                  <th>납부</th>
                  <th>날짜</th>
                  <th>메모</th>
                  {canManage && <th />}
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id}>
                    <td>{findMemberName(members, r.memberId)}</td>
                    <td>{formatCurrency(r.amount)}</td>
                    <td>
                      {canManage ? (
                        <button
                          className={`btn btn-sm ${r.paid ? 'btn-leaf' : 'btn-ghost'}`}
                          onClick={() => updateFeeRecord(r.id, { paid: !r.paid })}
                        >
                          {r.paid ? '✅ 납부' : '❌ 미납'}
                        </button>
                      ) : (
                        <span className={r.paid ? 'paid-yes' : 'paid-no'}>{r.paid ? '납부' : '미납'}</span>
                      )}
                    </td>
                    <td>{formatDate(r.date)}</td>
                    <td>{r.memo}</td>
                    {canManage && (
                      <td>
                        <button className="btn btn-danger btn-sm" onClick={() => deleteFeeRecord(r.id)}>
                          삭제
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {canManage && (
        <div className="card">
          <h3 style={{ marginTop: 0 }}>➕ 회비 기록 추가</h3>
          <form className="row wrap" onSubmit={submit} style={{ alignItems: 'flex-end' }}>
            <div className="field">
              <label>멤버</label>
              <select className="input" value={memberId} onChange={(e) => setMemberId(e.target.value)}>
                {approvedMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>금액</label>
              <input
                className="input"
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                style={{ width: 110 }}
              />
            </div>
            <div className="field">
              <label>날짜</label>
              <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <label className="row" style={{ cursor: 'pointer' }}>
              <input type="checkbox" checked={paid} onChange={(e) => setPaid(e.target.checked)} />
              납부완료
            </label>
            <div className="field" style={{ flex: 1, minWidth: 140 }}>
              <label>메모</label>
              <input className="input" value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="선택사항" />
            </div>
            <button type="submit" className="btn btn-primary">
              추가
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
