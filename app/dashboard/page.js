'use client';

import { useQuery } from '@tanstack/react-query';
import { Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { IndianRupee, ShoppingCart, TrendingUp, Users } from 'lucide-react';
import api from '../../lib/axios';
import Header from '../../components/layout/Header';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 sm:p-5">
      <Icon className="mb-3 text-gold" size={22} />
      <div className="text-xs text-muted sm:text-sm">{label}</div>
      <div className="mt-1 font-mono text-xl font-bold sm:text-2xl">{value}</div>
    </div>
  );
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
      <main className="space-y-4 p-4 sm:space-y-6 sm:p-8">
        {/* Stats grid: 2 cols on mobile, 4 on lg+ */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          <Stat icon={IndianRupee} label="Total Revenue" value={`Rs ${stats.totalRevenue || 0}`} />
          <Stat icon={Users} label="Total Students" value={stats.totalStudents || 0} />
          <Stat icon={TrendingUp} label="Revenue This Month" value={`Rs ${stats.revenueThisMonth || 0}`} />
          <Stat icon={ShoppingCart} label="New Students This Week" value={stats.newStudentsThisWeek || 0} />
        </div>

        {/* Charts: stack on mobile, side by side on md+ */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[3fr_2fr]">
          <section className="rounded-lg border border-border bg-card p-4 sm:p-5">
            <h2 className="mb-4 font-semibold">Revenue Last 60 Days</h2>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={revenue}>
                <XAxis dataKey="date" stroke="#888" tick={{ fontSize: 11 }} />
                <YAxis stroke="#888" tick={{ fontSize: 11 }} width={50} />
                <Tooltip contentStyle={{ background: '#111', border: '1px solid #2A2A2A', fontSize: 12 }} />
                <Line type="monotone" dataKey="revenue" stroke="#FFD700" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </section>
          <section className="rounded-lg border border-border bg-card p-4 sm:p-5">
            <h2 className="mb-4 font-semibold">Course Enrollment</h2>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie dataKey="value" data={pie} fill="#FFD700" label={({ name }) => name?.slice(0, 12)} labelLine={false} />
              </PieChart>
            </ResponsiveContainer>
          </section>
        </div>

        {/* Recent orders table with horizontal scroll */}
        <section className="rounded-lg border border-border bg-card p-4 sm:p-5">
          <h2 className="mb-4 font-semibold">Recent Orders</h2>
          <div className="overflow-x-auto -mx-4 sm:-mx-5 px-4 sm:px-5">
            <table className="w-full min-w-[600px] text-sm">
              <thead className="text-left text-muted">
                <tr>
                  <th className="py-2 pr-4">Student</th>
                  <th className="pr-4">Course</th>
                  <th className="pr-4">Amount</th>
                  <th className="pr-4">Coupon</th>
                  <th className="pr-4">Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.data?.recentOrders?.map((o) => (
                  <tr key={o._id} className="border-t border-border">
                    <td className="py-3 pr-4 font-medium">{o.user?.name || o.user?.email}</td>
                    <td className="pr-4 max-w-[160px] truncate">{o.isBundle ? 'Full Bundle' : o.course?.title}</td>
                    <td className="pr-4 font-mono">Rs {o.amount}</td>
                    <td className="pr-4">{o.couponApplied || '-'}</td>
                    <td className="pr-4">
                      <Badge tone={o.status === 'success' ? 'success' : o.status === 'failed' ? 'error' : 'gold'}>
                        {o.status}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap">{new Date(o.createdAt).toLocaleDateString()}</td>
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
