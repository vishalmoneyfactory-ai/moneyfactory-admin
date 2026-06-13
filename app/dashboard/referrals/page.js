'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { HandCoins, History, WalletCards } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../lib/axios';
import Header from '../../../components/layout/Header';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Input from '../../../components/ui/Input';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';

function RewardTable({ rows, paid, onPaid }) {
  if (!rows?.length) {
    return <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted">No {paid ? 'paid' : 'pending'} referral rewards.</div>;
  }
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <table className="w-full min-w-[900px] text-sm">
        <thead>
          <tr className="border-b border-border bg-secondary/50 text-left text-xs uppercase tracking-wider text-muted">
            <th className="px-4 py-3">Referrer</th>
            <th className="px-4 py-3">Referred User</th>
            <th className="px-4 py-3">Course</th>
            <th className="px-4 py-3">Reward</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Date</th>
            {!paid && <th className="px-4 py-3">Action</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row._id} className="border-t border-border">
              <td className="px-4 py-3">
                <div className="font-semibold text-white">{row.referrerId?.name || row.referrerId?.email}</div>
                <div className="text-xs text-muted">{row.referrerId?.phone || 'No phone'} | {row.referrerId?.referralCode}</div>
              </td>
              <td className="px-4 py-3">
                <div>{row.referredUserId?.name || row.referredUserId?.email}</div>
                <div className="text-xs text-muted">{row.referredUserId?.phone || 'No phone'}</div>
              </td>
              <td className="px-4 py-3">{row.courseId?.title || 'Course'}</td>
              <td className="px-4 py-3 font-mono text-gold">Rs {row.rewardAmount}</td>
              <td className="px-4 py-3"><Badge tone={paid ? 'success' : 'warning'}>{row.status}</Badge></td>
              <td className="px-4 py-3 text-xs text-muted">{new Date(row.paidAt || row.createdAt).toLocaleString('en-IN')}</td>
              {!paid && <td className="px-4 py-3"><Button onClick={() => onPaid(row)}>Mark Paid</Button></td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ReferralsPage() {
  const qc = useQueryClient();
  const [method, setMethod] = useState('UPI');
  const [note, setNote] = useState('');
  const [selected, setSelected] = useState(null);
  const { data, isLoading } = useQuery({
    queryKey: ['referrals'],
    queryFn: () => api.get('/admin/referrals').then((r) => r.data),
  });

  async function markPaid() {
    await api.put(`/admin/referrals/${selected._id}/paid`, { method, note });
    toast.success('Referral payout marked paid');
    setSelected(null);
    setNote('');
    qc.invalidateQueries({ queryKey: ['referrals'] });
  }

  if (isLoading) return <div className="flex h-screen items-center justify-center"><LoadingSpinner /></div>;

  return (
    <>
      <Header title="Referrals" />
      <main className="space-y-6 p-4 sm:p-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-4">
            <HandCoins className="mb-2 text-gold" size={20} />
            <div className="text-sm text-muted">Pending Rewards</div>
            <div className="mt-1 font-mono text-2xl font-black text-gold">Rs {data?.stats?.pending?.amount || 0}</div>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <WalletCards className="mb-2 text-gold" size={20} />
            <div className="text-sm text-muted">Paid Rewards</div>
            <div className="mt-1 font-mono text-2xl font-black text-gold">Rs {data?.stats?.paid?.amount || 0}</div>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <History className="mb-2 text-gold" size={20} />
            <div className="text-sm text-muted">Wallet Users</div>
            <div className="mt-1 font-mono text-2xl font-black text-gold">{data?.walletUsers?.length || 0}</div>
          </div>
        </div>

        <section className="space-y-3">
          <h2 className="text-xl font-bold">Pending Referral Rewards</h2>
          <RewardTable rows={data?.pending} onPaid={setSelected} />
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold">Paid Referral Rewards</h2>
          <RewardTable rows={data?.paid} paid />
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold">User Wallet Balances</h2>
          <div className="overflow-x-auto rounded-lg border border-border bg-card">
            <table className="w-full min-w-[700px] text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50 text-left text-xs uppercase tracking-wider text-muted">
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Referrals</th>
                  <th className="px-4 py-3">Wallet</th>
                </tr>
              </thead>
              <tbody>
                {data?.walletUsers?.map((user) => (
                  <tr key={user._id} className="border-t border-border">
                    <td className="px-4 py-3"><div className="font-semibold">{user.name || user.email}</div><div className="text-xs text-muted">{user.email}</div></td>
                    <td className="px-4 py-3">{user.phone || 'No phone'}</td>
                    <td className="px-4 py-3">{user.referralCode}</td>
                    <td className="px-4 py-3">{user.totalReferrals || 0}</td>
                    <td className="px-4 py-3 font-mono text-gold">Rs {user.walletBalance || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold">Audit Logs</h2>
          <div className="space-y-2">
            {data?.audits?.map((audit) => (
              <div key={audit._id} className="rounded-lg border border-border bg-card p-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold">{audit.type}</span>
                  <span className="font-mono text-gold">Rs {audit.amount}</span>
                </div>
                <div className="mt-1 text-muted">{audit.user?.name || audit.user?.email} | Balance Rs {audit.balanceAfter} | {audit.note}</div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-5">
            <h2 className="text-xl font-bold text-gold">Mark Payout Paid</h2>
            <p className="mt-2 text-sm text-muted">Confirm after transferring Rs {selected.rewardAmount} outside the app.</p>
            <div className="mt-4 space-y-3">
              <Input label="Payment Method" value={method} onChange={(e) => setMethod(e.target.value)} />
              <Input label="Note" value={note} onChange={(e) => setNote(e.target.value)} />
              <div className="flex gap-2">
                <Button onClick={markPaid}>Confirm Paid</Button>
                <Button variant="outline" onClick={() => setSelected(null)}>Cancel</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
