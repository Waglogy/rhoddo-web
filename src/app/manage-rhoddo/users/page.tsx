import { api } from '@/lib/api';
import { formatDate } from '@/lib/format';

type UserRow = {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  createdAt: string;
  bookingCount: number;
};

export default async function UsersPage() {
  const data = await api<{ users: UserRow[] }>('/admin/users');

  return (
    <div>
      <div className="label">People</div>
      <h1 className="font-display text-4xl text-ink">Users</h1>
      <p className="mt-1 text-sm text-mute">Registered Rhoddo accounts.</p>

      <div className="card mt-8 divide-y divide-line">
        {data.users.length === 0 && (
          <div className="p-6 text-sm text-mute">No users yet.</div>
        )}
        {data.users.map((u) => (
          <div key={u.id} className="flex items-center justify-between p-5">
            <div>
              <div className="text-sm text-ink">{u.name || u.email}</div>
              <div className="mt-0.5 text-xs text-mute">
                {u.email} · joined {formatDate(u.createdAt)}
              </div>
            </div>
            <div className="text-xs text-mute">{u.bookingCount} bookings</div>
          </div>
        ))}
      </div>
    </div>
  );
}
