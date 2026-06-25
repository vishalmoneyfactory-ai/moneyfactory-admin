'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download } from 'lucide-react';
import api from '../../../lib/axios';
import Header from '../../../components/layout/Header';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';

export default function OrdersPage() {
  const [status, setStatus] = useState('');
  const orders = useQuery({
    queryKey: ['orders', status],
    queryFn: () => api.get('/admin/orders', { params: { status } }).then((r) => r.data.orders),
  });

  async function exportCsv() {
    const response = await api.get('/admin/export/orders', { responseType: 'blob' });
    const url = URL.createObjectURL(response.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'money-factory-orders.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <Header
        title="Orders"
        action={
          <Button variant="outline" onClick={exportCsv}>
            <Download size={16} /> <span className="hidden sm:inline">Export CSV</span>
          </Button>
        }
      />
      <main className="space-y-4 p-4 sm:p-8">
        <select
          className="rounded-md border border-border bg-card px-3 py-2 text-sm text-white focus:border-gold focus:outline-none"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="success">Success</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>

        <section className="rounded-lg border border-border bg-card p-4 sm:p-5">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm">
              <thead className="text-left text-muted">
                <tr className="border-b border-border">
                  <th className="py-2 pr-4">Order ID</th>
                  <th className="pr-4">Student</th>
                  <th className="pr-4">Course</th>
                  <th className="pr-4">Amount</th>
                  <th className="pr-4">Discount</th>
                  <th className="pr-4">Coupon</th>
                  <th className="pr-4">Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.data?.map((o) => (
                  <tr key={o._id} className="border-t border-border hover:bg-secondary/40 transition">
                    <td className="py-3 pr-4 font-mono text-xs text-muted">{o.cashfreeOrderId}</td>
                    <td className="pr-4">{o.user?.name || o.user?.email}</td>
                    <td className="pr-4 max-w-[140px] truncate">{o.isBundle ? 'Full Bundle' : o.course?.title}</td>
                    <td className="pr-4 font-mono whitespace-nowrap">Rs {o.amount}</td>
                    <td className="pr-4 font-mono whitespace-nowrap">Rs {o.discountAmount}</td>
                    <td className="pr-4">{o.couponApplied || '-'}</td>
                    <td className="pr-4">
                      <Badge tone={o.status === 'success' ? 'success' : o.status === 'failed' ? 'error' : 'gold'}>
                        {o.status}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap text-xs text-muted">{new Date(o.createdAt).toLocaleString()}</td>
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
