'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Send } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../lib/axios';
import Header from '../../../components/layout/Header';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Badge from '../../../components/ui/Badge';

export default function NotificationsPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ target: 'all', studentId: '', title: '', message: '' });
  const students = useQuery({ queryKey: ['students'], queryFn: () => api.get('/admin/students').then((r) => r.data.students) });
  const logs = useQuery({ queryKey: ['notifications'], queryFn: () => api.get('/admin/notifications').then((r) => r.data.notifications) });

  async function submit(e) {
    e.preventDefault();
    await api.post('/admin/notifications/send', form);
    toast.success('Notification sent');
    setForm({ target: 'all', studentId: '', title: '', message: '' });
    qc.invalidateQueries({ queryKey: ['notifications'] });
  }

  return (
    <>
      <Header title="Notifications" />
      <main className="space-y-4 p-4 sm:space-y-6 sm:p-8">
        <form onSubmit={submit} className="grid grid-cols-1 gap-4 rounded-lg border border-border bg-card p-4 sm:p-5 sm:grid-cols-2">
          <select
            className="rounded-md border border-border bg-secondary px-3 py-2 text-sm text-white focus:border-gold focus:outline-none"
            value={form.target}
            onChange={(e) => setForm({ ...form, target: e.target.value })}
          >
            <option value="all">All Students</option>
            <option value="student">Specific Student</option>
          </select>
          {form.target === 'student' && (
            <select
              className="rounded-md border border-border bg-secondary px-3 py-2 text-sm text-white focus:border-gold focus:outline-none"
              value={form.studentId}
              onChange={(e) => setForm({ ...form, studentId: e.target.value })}
            >
              <option value="">Select student</option>
              {students.data?.map((s) => <option key={s._id} value={s._id}>{s.name || s.email}</option>)}
            </select>
          )}
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <Input label="Message" maxLength={200} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
          <Button className="col-span-full"><Send size={16} /> Send Notification</Button>
        </form>
        <section className="rounded-lg border border-border bg-card p-4 sm:p-5">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] text-sm">
              <thead className="text-left text-muted">
                <tr className="border-b border-border">
                  <th className="py-2 pr-4">Title</th>
                  <th className="pr-4">Sent To</th>
                  <th className="pr-4">Count</th>
                  <th className="pr-4">Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {logs.data?.map((n) => (
                  <tr key={n._id} className="border-t border-border">
                    <td className="py-3 pr-4">{n.title}</td>
                    <td className="pr-4">{n.target === 'all' ? 'All' : n.student?.email}</td>
                    <td className="pr-4">{n.sentCount}</td>
                    <td className="pr-4"><Badge tone={n.status === 'sent' ? 'success' : 'error'}>{n.status}</Badge></td>
                    <td className="whitespace-nowrap text-xs text-muted">{new Date(n.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </>
  );
}
