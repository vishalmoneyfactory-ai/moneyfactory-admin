'use client';

import { useQuery } from '@tanstack/react-query';
import { Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { IndianRupee, ShoppingCart, TrendingUp, Users } from 'lucide-react';
import api from '../../lib/axios';
import Header from '../../components/layout/Header';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

function Stat({ icon: Icon, label, value }) {
  return <div className="rounded-lg border border-border bg-card p-5"><Icon className="mb-4 text-gold" /><div className="text-sm text-muted">{label}</div><div className="mt-1 font-mono text-2xl font-bold">{value}</div></div>;
}

export default function DashboardPage() {
  const dashboard = useQuery({ queryKey: ['dashboard'], queryFn: () => api.get('/admin/dashboard').then((r) => r.data) });
  const analytics = useQuery({ queryKey: ['analytics'], queryFn: () => api.get('/admin/analytics').then((r) => r.data) });

  if (dashboard.isLoading) return <div className="flex h-screen items-center justify-center"><LoadingSpinner /></div>;
  const stats = dashboard.data?.stats || {};
  const revenue = analytics.data?.revenueByDay?.map((r) => ({ date: r._id, revenue: r.revenue })) || [];
  const pie = dashboard.data?.topCourses?.map((c) => ({ name: c.title, value: c.enrolledCount || 1 })) || [];

  return (
    <>
      <Header title="Dashboard" />
      <main className="space-y-6 p-8">
        <div className="grid grid-cols-4 gap-4">
          <Stat icon={IndianRupee} label="Total Revenue" value={`Rs ${stats.totalRevenue || 0}`} />
          <Stat icon={Users} label="Total Students" value={stats.totalStudents || 0} />
          <Stat icon={TrendingUp} label="Revenue This Month" value={`Rs ${stats.revenueThisMonth || 0}`} />
          <Stat icon={ShoppingCart} label="New Students This Week" value={stats.newStudentsThisWeek || 0} />
        </div>
        <div className="grid grid-cols-[3fr_2fr] gap-4">
          <section className="rounded-lg border border-border bg-card p-5">
            <h2 className="mb-4 font-semibold">Revenue Last 60 Days</h2>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={revenue}><XAxis dataKey="date" stroke="#888" /><YAxis stroke="#888" /><Tooltip contentStyle={{ background: '#111', border: '1px solid #2A2A2A' }} /><Line type="monotone" dataKey="revenue" stroke="#FFD700" strokeWidth={3} /></LineChart>
            </ResponsiveContainer>
          </section>
          <section className="rounded-lg border border-border bg-card p-5">
            <h2 className="mb-4 font-semibold">Course Enrollment</h2>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart><Pie dataKey="value" data={pie} fill="#FFD700" label /></PieChart>
            </ResponsiveContainer>
          </section>
        </div>
        <section className="rounded-lg border border-border bg-card p-5">
          <h2 className="mb-4 font-semibold">Recent Orders</h2>
          <table className="text-sm">
            <thead className="text-left text-muted"><tr><th className="py-2">Student</th><th>Course</th><th>Amount</th><th>Coupon</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>{dashboard.data?.recentOrders?.map((o) => <tr key={o._id} className="border-t border-border"><td className="py-3">{o.user?.name || o.user?.email}</td><td>{o.isBundle ? 'Full Bundle' : o.course?.title}</td><td className="font-mono">Rs {o.amount}</td><td>{o.couponApplied || '-'}</td><td><Badge tone={o.status === 'success' ? 'success' : o.status === 'failed' ? 'error' : 'gold'}>{o.status}</Badge></td><td>{new Date(o.createdAt).toLocaleDateString()}</td></tr>)}</tbody>
          </table>
        </section>
      </main>
    </>
  );
}
