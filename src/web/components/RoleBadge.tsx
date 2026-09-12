import { Role } from '../../core/types';
import { roleLabel } from '../../core/permissions';

export default function RoleBadge({ role }: { role: Role }) {
  return <span className={`badge ${role}`}>{roleLabel[role]}</span>;
}
