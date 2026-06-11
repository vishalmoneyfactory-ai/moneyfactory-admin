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
      <main className="space-y-6 p-8">
        <form onSubmit={submit} className="grid grid-cols-2 gap-4 rounded-lg border border-border bg-card p-5">
          <select className="rounded-md px-3 py-2" value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })}><option value="all">All Students</option><option value="student">Specific Student</option></select>
          {form.target === 'student' && <select className="rounded-md px-3 py-2" value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })}><option value="">Select student</option>{students.data?.map((s) => <option key={s._id} value={s._id}>{s.name || s.email}</option>)}</select>}
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <Input label="Message" maxLength={200} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
          <Button className="col-span-2"><Send size={16} /> Send Notification</Button>
        </form>
        <section className="rounded-lg border border-border bg-card p-5">
          <table className="text-sm"><thead className="text-left text-muted"><tr><th className="py-2">Title</th><th>Sent To</th><th>Count</th><th>Status</th><th>Date</th></tr></thead><tbody>{logs.data?.map((n) => <tr key={n._id} className="border-t border-border"><td className="py-3">{n.title}</td><td>{n.target === 'all' ? 'All' : n.student?.email}</td><td>{n.sentCount}</td><td><Badge tone={n.status === 'sent' ? 'success' : 'error'}>{n.status}</Badge></td><td>{new Date(n.createdAt).toLocaleString()}</td></tr>)}</tbody></table>
        </section>
      </main>
    </>
  );
}
