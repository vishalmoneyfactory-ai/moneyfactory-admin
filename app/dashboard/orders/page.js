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
  const orders = useQuery({ queryKey: ['orders', status], queryFn: () => api.get('/admin/orders', { params: { status } }).then((r) => r.data.orders) });

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
      <Header title="Orders" action={<Button variant="outline" onClick={exportCsv}><Download size={16} /> Export CSV</Button>} />
      <main className="space-y-4 p-8">
        <select className="rounded-md px-3 py-2" value={status} onChange={(e) => setStatus(e.target.value)}><option value="">All Statuses</option><option value="success">Success</option><option value="pending">Pending</option><option value="failed">Failed</option></select>
        <section className="rounded-lg border border-border bg-card p-5">
          <table className="text-sm">
            <thead className="text-left text-muted"><tr><th className="py-2">Order ID</th><th>Student</th><th>Course</th><th>Amount</th><th>Discount</th><th>Coupon</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>{orders.data?.map((o) => <tr key={o._id} className="border-t border-border"><td className="py-3 font-mono text-xs">{o.razorpayOrderId}</td><td>{o.user?.name || o.user?.email}</td><td>{o.isBundle ? 'Full Bundle' : o.course?.title}</td><td className="font-mono">Rs {o.amount}</td><td>Rs {o.discountAmount}</td><td>{o.couponApplied || '-'}</td><td><Badge tone={o.status === 'success' ? 'success' : o.status === 'failed' ? 'error' : 'gold'}>{o.status}</Badge></td><td>{new Date(o.createdAt).toLocaleString()}</td></tr>)}</tbody>
          </table>
        </section>
      </main>
    </>
  );
}
