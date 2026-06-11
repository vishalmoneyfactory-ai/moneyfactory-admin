'use client';

import { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, Shield, ShieldOff, Users, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../lib/axios';
import Header from '../../../components/layout/Header';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';

/* ─── Grant Course Dropdown ──────────────────────────────────── */
function GrantDropdown({ student, courses, onGrant }) {
  return (
    <div className="relative">
      <select
        className="w-full appearance-none rounded-lg border border-border bg-secondary px-3 py-1.5 pr-8 text-xs text-white focus:border-gold focus:outline-none"
        defaultValue=""
        onChange={(e) => {
          if (e.target.value) {
            onGrant(student, e.target.value, true);
            e.target.value = '';
          }
        }}
      >
        <option value="" disabled>Grant access…</option>
        {courses?.filter((c) => !c.isBundle).map((c) => (
          <option key={c._id} value={c._id}>{c.title}</option>
        ))}
      </select>
      <ChevronDown size={12} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted" />
    </div>
  );
}

/* ─── Student Row ────────────────────────────────────────────── */
function StudentRow({ student, courses, onBanToggle, onGrant }) {
  const enrolledLabel = student.hasBundle
    ? 'Bundle (All Courses)'
    : student.purchasedCourses?.length > 0
      ? student.purchasedCourses.map((c) => c.title).join(', ')
      : '—';

  return (
    <tr className="border-t border-border align-middle transition hover:bg-secondary/50">
      <td className="py-3 pr-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-secondary text-sm font-bold text-gold">
            {(student.name || student.email || '?').slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-white">{student.name || '—'}</div>
            <div className="truncate text-xs text-muted">{student.email}</div>
          </div>
        </div>
      </td>
      <td className="pr-4 text-sm text-muted max-w-[220px]">
        <div className="truncate" title={enrolledLabel}>{enrolledLabel}</div>
      </td>
      <td className="pr-4 font-mono text-sm text-gold">₹{student.totalSpent ?? 0}</td>
      <td className="pr-4 text-xs text-muted">{new Date(student.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
      <td className="pr-4">
        <Badge tone={student.isActive ? 'success' : 'error'}>
          {student.isActive ? 'Active' : 'Banned'}
        </Badge>
      </td>
      <td className="space-y-2 py-2">
        <Button
          variant={student.isActive ? 'danger' : 'solid'}
          className="w-full text-xs px-2 py-1"
          onClick={() => onBanToggle(student)}
        >
          {student.isActive ? <><ShieldOff size={12} /> Ban</> : <><Shield size={12} /> Unban</>}
        </Button>
        {!student.hasBundle && (
          <GrantDropdown student={student} courses={courses} onGrant={onGrant} />
        )}
      </td>
    </tr>
  );
}

/* ─── Main Page ──────────────────────────────────────────────── */
export default function StudentsPage() {
  const qc = useQueryClient();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');

  const studentsQuery = useQuery({
    queryKey: ['students', q, status],
    queryFn: () => api.get('/admin/students', { params: { q, status } }).then((r) => r.data.students),
    placeholderData: (prev) => prev, // keeps previous data visible while refetching (replaces keepPreviousData)
  });

  const coursesQuery = useQuery({
    queryKey: ['courses-list'],
    queryFn: () => api.get('/admin/courses').then((r) => r.data.courses),
  });

  const grant = useCallback(async (student, courseId, hasAccess) => {
    try {
      await api.put(`/admin/students/${student._id}/access`, { courseId, hasAccess });
      qc.invalidateQueries({ queryKey: ['students'] });
      toast.success('Access granted');
    } catch {
      // silently handled
    }
  }, [qc]);

  const banToggle = useCallback(async (student) => {
    await api.put(`/admin/students/${student._id}/ban`, { isActive: !student.isActive });
    qc.invalidateQueries({ queryKey: ['students'] });
  }, [qc]);

  const students = studentsQuery.data;
  const courses = coursesQuery.data;
  const isLoading = studentsQuery.isLoading;
  const isError = studentsQuery.isError;

  return (
    <>
      <Header title="Students" />
      <main className="space-y-6 p-8">
        {/* Search & Filter */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              placeholder="Search by name or email…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full rounded-lg border border-border bg-card py-2.5 pl-9 pr-3 text-sm text-white placeholder-muted focus:border-gold focus:outline-none"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-white focus:border-gold focus:outline-none"
          >
            <option value="">All Students</option>
            <option value="active">Active</option>
            <option value="banned">Banned</option>
          </select>
        </div>

        {/* Stats bar */}
        {students && (
          <div className="flex items-center gap-2 text-sm text-muted">
            <Users size={14} />
            <span>{students.length} student{students.length !== 1 ? 's' : ''} found</span>
            {studentsQuery.isFetching && <span className="ml-2 text-gold text-xs">Refreshing…</span>}
          </div>
        )}

        {/* Table */}
        <section className="rounded-xl border border-border bg-card overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <LoadingSpinner />
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-lg font-semibold text-white">Failed to load students</p>
              <p className="mt-1 text-sm text-muted">Please try again</p>
              <Button className="mt-4" onClick={() => studentsQuery.refetch()}>Retry</Button>
            </div>
          ) : !students?.length ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Users size={40} className="text-muted" />
              <p className="mt-4 text-lg font-semibold text-white">No students found</p>
              <p className="mt-1 text-sm text-muted">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Student</th>
                    <th className="pr-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Courses</th>
                    <th className="pr-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Spent</th>
                    <th className="pr-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Joined</th>
                    <th className="pr-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Status</th>
                    <th className="pr-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => (
                    <StudentRow
                      key={s._id}
                      student={s}
                      courses={courses}
                      onBanToggle={banToggle}
                      onGrant={grant}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
