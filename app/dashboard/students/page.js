'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../../lib/axios';
import Header from '../../../components/layout/Header';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Input from '../../../components/ui/Input';

export default function StudentsPage() {
  const qc = useQueryClient();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const students = useQuery({ queryKey: ['students', q, status], queryFn: () => api.get('/admin/students', { params: { q, status } }).then((r) => r.data.students) });
  const courses = useQuery({ queryKey: ['courses'], queryFn: () => api.get('/courses').then((r) => r.data.courses) });

  async function grant(student, courseId, hasAccess) {
    await api.put(`/admin/students/${student._id}/access`, { courseId, hasAccess });
    qc.invalidateQueries({ queryKey: ['students'] });
  }

  return (
    <>
      <Header title="Students" />
      <main className="space-y-4 p-8">
        <div className="grid grid-cols-[1fr_220px] gap-3">
          <Input placeholder="Search name or email" value={q} onChange={(e) => setQ(e.target.value)} />
          <select className="rounded-md px-3 py-2" value={status} onChange={(e) => setStatus(e.target.value)}><option value="">All</option><option value="active">Active</option><option value="banned">Banned</option></select>
        </div>
        <section className="rounded-lg border border-border bg-card p-5">
          <table className="text-sm">
            <thead className="text-left text-muted"><tr><th className="py-2">Name</th><th>Email</th><th>Courses</th><th>Total Spent</th><th>Joined</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>{students.data?.map((s) => <tr key={s._id} className="border-t border-border align-top"><td className="py-3">{s.name}</td><td>{s.email}</td><td>{s.hasBundle ? 'Bundle' : s.purchasedCourses?.map((c) => c.title).join(', ') || '-'}</td><td className="font-mono">Rs {s.totalSpent}</td><td>{new Date(s.createdAt).toLocaleDateString()}</td><td><Badge tone={s.isActive ? 'success' : 'error'}>{s.isActive ? 'Active' : 'Banned'}</Badge></td><td className="space-y-2"><Button variant={s.isActive ? 'danger' : 'solid'} onClick={async () => { await api.put(`/admin/students/${s._id}/ban`, { isActive: !s.isActive }); qc.invalidateQueries({ queryKey: ['students'] }); }}>{s.isActive ? 'Ban' : 'Unban'}</Button><select className="block w-full rounded-md px-2 py-1" onChange={(e) => e.target.value && grant(s, e.target.value, true)}><option value="">Grant course</option>{courses.data?.filter((c) => !c.isBundle).map((c) => <option key={c._id} value={c._id}>{c.title}</option>)}</select></td></tr>)}</tbody>
          </table>
        </section>
      </main>
    </>
  );
}
