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
      <Header
        title="Coupons"
        action={
          <Button onClick={() => setEditing({ discountType: 'percentage', applicableOn: 'all', isActive: true })}>
            <span className="hidden sm:inline">Create Coupon</span>
            <span className="sm:hidden">+ Coupon</span>
          </Button>
        }
      />
      <main className="space-y-4 p-4 sm:space-y-6 sm:p-8">
        {/* Coupon form: 1-col on mobile, 3-col on md+ */}
        {editing && (
          <form
            onSubmit={submit}
            className="grid grid-cols-1 gap-4 rounded-lg border border-border bg-card p-4 sm:p-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            <Input name="code" label="Code" defaultValue={editing.code} required />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted">Discount Type</label>
              <select
                name="discountType"
                className="rounded-md border border-border bg-secondary px-3 py-2 text-sm text-white focus:border-gold focus:outline-none"
                defaultValue={editing.discountType}
              >
                <option value="percentage">Percentage</option>
                <option value="flat">Flat Rs</option>
              </select>
            </div>
            <Input name="discountValue" label="Value" type="number" defaultValue={editing.discountValue} required />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted">Applicable On</label>
              <select
                name="applicableOn"
                className="rounded-md border border-border bg-secondary px-3 py-2 text-sm text-white focus:border-gold focus:outline-none"
                defaultValue={editing.applicableOn}
              >
                <option value="all">All</option>
                <option value="bundle">Bundle</option>
                <option value="specific">Specific Course</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted">Specific Course</label>
              <select
                name="specificCourse"
                className="rounded-md border border-border bg-secondary px-3 py-2 text-sm text-white focus:border-gold focus:outline-none"
                defaultValue={editing.specificCourse?._id || ''}
              >
                <option value="">No specific course</option>
                {courses.data?.map((c) => <option key={c._id} value={c._id}>{c.title}</option>)}
              </select>
            </div>
            <Input name="expiryDate" label="Expiry" type="date" defaultValue={editing.expiryDate?.slice(0, 10)} />
            <Input name="usageLimit" label="Usage Limit" type="number" defaultValue={editing.usageLimit} />
            <label className="flex items-center gap-2 text-sm text-white">
              <input type="checkbox" name="isActive" defaultChecked={editing.isActive !== false} className="accent-gold" />
              Active
            </label>
            <div className="col-span-full flex gap-2">
              <Button type="submit">Save</Button>
              <Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            </div>
          </form>
        )}

        {/* Coupons table */}
        <section className="rounded-lg border border-border bg-card p-4 sm:p-5">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-sm">
              <thead className="text-left text-muted">
                <tr className="border-b border-border">
                  <th className="py-2 pr-4">Code</th>
                  <th className="pr-4">Type</th>
                  <th className="pr-4">Value</th>
                  <th className="pr-4">Applicable</th>
                  <th className="pr-4">Expiry</th>
                  <th className="pr-4">Used</th>
                  <th className="pr-4">Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.data?.map((c) => (
                  <tr key={c._id} className="border-t border-border hover:bg-secondary/40 transition">
                    <td className="py-3 pr-4 font-mono text-gold">{c.code}</td>
                    <td className="pr-4">{c.discountType}</td>
                    <td className="pr-4">{c.discountValue}</td>
                    <td className="pr-4">{c.applicableOn}</td>
                    <td className="pr-4 whitespace-nowrap">{c.expiryDate ? new Date(c.expiryDate).toLocaleDateString() : '-'}</td>
                    <td className="pr-4">{c.usedCount}/{c.usageLimit || '∞'}</td>
                    <td className="pr-4">
                      <Badge tone={c.isActive ? 'success' : 'error'}>{c.isActive ? 'Active' : 'Off'}</Badge>
                    </td>
                    <td>
                      <Button onClick={() => setEditing(c)}>Edit</Button>
                    </td>
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
