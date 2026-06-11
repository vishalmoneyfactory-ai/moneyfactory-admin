'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../../lib/axios';
import Header from '../../../components/layout/Header';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Badge from '../../../components/ui/Badge';

export default function CouponsPage() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(null);
  const coupons = useQuery({ queryKey: ['coupons'], queryFn: () => api.get('/coupons').then((r) => r.data.coupons) });
  const courses = useQuery({ queryKey: ['courses'], queryFn: () => api.get('/courses').then((r) => r.data.courses) });

  async function submit(e) {
    e.preventDefault();
    const body = Object.fromEntries(new FormData(e.currentTarget));
    body.discountValue = Number(body.discountValue);
    body.usageLimit = Number(body.usageLimit || 0);
    body.isActive = body.isActive === 'on';
    if (!body.specificCourse) delete body.specificCourse;
    if (editing?._id) await api.put(`/coupons/${editing._id}`, body);
    else await api.post('/coupons', body);
    toast.success('Coupon saved');
    setEditing(null);
    qc.invalidateQueries({ queryKey: ['coupons'] });
  }

  return (
    <>
      <Header title="Coupons" action={<Button onClick={() => setEditing({ discountType: 'percentage', applicableOn: 'all', isActive: true })}>Create Coupon</Button>} />
      <main className="space-y-6 p-8">
        {editing && <form onSubmit={submit} className="grid grid-cols-3 gap-4 rounded-lg border border-border bg-card p-5">
          <Input name="code" label="Code" defaultValue={editing.code} required />
          <select name="discountType" className="rounded-md px-3 py-2" defaultValue={editing.discountType}><option value="percentage">Percentage</option><option value="flat">Flat Rs</option></select>
          <Input name="discountValue" label="Value" type="number" defaultValue={editing.discountValue} required />
          <select name="applicableOn" className="rounded-md px-3 py-2" defaultValue={editing.applicableOn}><option value="all">All</option><option value="bundle">Bundle</option><option value="specific">Specific Course</option></select>
          <select name="specificCourse" className="rounded-md px-3 py-2" defaultValue={editing.specificCourse?._id || ''}><option value="">No specific course</option>{courses.data?.map((c) => <option key={c._id} value={c._id}>{c.title}</option>)}</select>
          <Input name="expiryDate" label="Expiry" type="date" defaultValue={editing.expiryDate?.slice(0, 10)} />
          <Input name="usageLimit" label="Usage Limit" type="number" defaultValue={editing.usageLimit} />
          <label className="flex items-center gap-2"><input type="checkbox" name="isActive" defaultChecked={editing.isActive !== false} /> Active</label>
          <div className="col-span-3 flex gap-2"><Button>Save</Button><Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancel</Button></div>
        </form>}
        <section className="rounded-lg border border-border bg-card p-5">
          <table className="text-sm"><thead className="text-left text-muted"><tr><th className="py-2">Code</th><th>Type</th><th>Value</th><th>Applicable</th><th>Expiry</th><th>Used</th><th>Status</th><th>Actions</th></tr></thead><tbody>{coupons.data?.map((c) => <tr key={c._id} className="border-t border-border"><td className="py-3 font-mono text-gold">{c.code}</td><td>{c.discountType}</td><td>{c.discountValue}</td><td>{c.applicableOn}</td><td>{c.expiryDate ? new Date(c.expiryDate).toLocaleDateString() : '-'}</td><td>{c.usedCount}/{c.usageLimit || '∞'}</td><td><Badge tone={c.isActive ? 'success' : 'error'}>{c.isActive ? 'Active' : 'Off'}</Badge></td><td><Button onClick={() => setEditing(c)}>Edit</Button></td></tr>)}</tbody></table>
        </section>
      </main>
    </>
  );
}
