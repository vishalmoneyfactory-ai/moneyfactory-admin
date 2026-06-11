'use client';

import { useEffect, useState } from 'react';
import { Camera, KeyRound, LogOut, Save, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../lib/axios';
import { clearSession, getUser, setSession } from '../../../lib/auth';
import Header from '../../../components/layout/Header';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

function mediaUrl(path) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '')}${path}`;
}

export default function AdminProfilePage() {
  const [user, setUser] = useState(null);
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/auth/me').then(({ data }) => setUser(data.user)).catch(() => setUser(getUser()));
  }, []);

  async function saveProfile(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const body = Object.fromEntries(new FormData(e.currentTarget));
      const { data } = await api.put('/auth/me', body);
      const token = localStorage.getItem('moneyfactory_admin_token');
      if (token) setSession(token, data.user);
      setUser(data.user);
      toast.success('Profile updated');
    } finally {
      setSaving(false);
    }
  }

  async function uploadPhoto(file) {
    if (!file) return;
    const form = new FormData();
    form.append('image', file);
    const { data } = await api.post('/auth/me/profile-image', form, { headers: { 'Content-Type': 'multipart/form-data' } });
    const token = localStorage.getItem('moneyfactory_admin_token');
    if (token) setSession(token, data.user);
    setUser(data.user);
    toast.success('Profile photo updated');
  }

  async function removePhoto() {
    const { data } = await api.delete('/auth/me/profile-image');
    const token = localStorage.getItem('moneyfactory_admin_token');
    if (token) setSession(token, data.user);
    setUser(data.user);
    toast.success('Profile photo removed');
  }

  async function changePassword() {
    await api.put('/admin/password', { password });
    setPassword('');
    toast.success('Password changed');
  }

  function logout() {
    clearSession();
    window.location.href = '/login';
  }

  const photo = mediaUrl(user?.profileImage);

  return (
    <>
      <Header title="Admin Profile" action={<Button variant="outline" onClick={logout}><LogOut size={16} /> Logout</Button>} />
      <main className="grid gap-6 p-8 xl:grid-cols-[360px_1fr]">
        <section className="rounded-lg border border-gold/40 bg-card p-6 shadow-[0_24px_70px_rgba(0,0,0,0.35)]">
          <div className="mx-auto flex h-32 w-32 items-center justify-center overflow-hidden rounded-lg border border-gold/50 bg-primary text-5xl font-black text-gold">
            {photo ? <img src={photo} alt="" className="h-full w-full object-cover" /> : (user?.name || user?.email || 'A').slice(0, 1).toUpperCase()}
          </div>
          <div className="mt-5 text-center">
            <div className="text-xl font-black">{user?.name || 'Admin'}</div>
            <div className="mt-1 text-sm text-muted">{user?.email}</div>
          </div>
          <div className="mt-6 grid gap-2">
            <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-md bg-gold px-4 py-2 text-sm font-semibold text-black hover:bg-goldHover">
              <Camera size={16} /> Upload Photo
              <input type="file" accept="image/*" className="hidden" onChange={(e) => uploadPhoto(e.target.files?.[0])} />
            </label>
            <Button type="button" variant="outline" onClick={removePhoto} disabled={!photo}><Trash2 size={16} /> Remove Photo</Button>
          </div>
        </section>

        <div className="space-y-6">
          <form onSubmit={saveProfile} className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-5 text-xl font-bold">Account Details</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Input name="name" label="Name" defaultValue={user?.name || ''} required />
              <Input name="phone" label="Phone" defaultValue={user?.phone || ''} />
              <Input name="email" label="Admin Email" type="email" defaultValue={user?.email || ''} disabled />
            </div>
            <Button className="mt-5" disabled={saving}><Save size={16} /> {saving ? 'Saving...' : 'Save Profile'}</Button>
          </form>

          <section className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-5 text-xl font-bold">Password</h2>
            <div className="flex flex-col gap-3 md:flex-row">
              <Input type="password" placeholder="New password, minimum 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} />
              <Button onClick={changePassword} disabled={password.length < 8}><KeyRound size={16} /> Change Password</Button>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
