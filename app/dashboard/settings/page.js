'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../../lib/axios';
import Header from '../../../components/layout/Header';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Badge from '../../../components/ui/Badge';

export default function SettingsPage() {
  const qc = useQueryClient();
  const settings = useQuery({ queryKey: ['settings'], queryFn: () => api.get('/settings').then((r) => r.data.settings) });
  const banners = useQuery({ queryKey: ['banners'], queryFn: () => api.get('/banners').then((r) => r.data.banners) });
  const legal = useQuery({ queryKey: ['legal'], queryFn: () => api.get('/legal').then((r) => r.data.pages) });
  const [password, setPassword] = useState('');
  const [bannerImage, setBannerImage] = useState(null);

  async function saveSettings(e) {
    e.preventDefault();
    const body = Object.fromEntries(new FormData(e.currentTarget));
    await api.put('/settings', {
      bundlePrice: Number(body.bundlePrice),
      maintenanceMode: body.maintenanceMode === 'on',
      company: {
        description: body.description,
        mission: body.mission,
        vision: body.vision,
        supportEmail: body.supportEmail,
        supportPhone: body.supportPhone,
        whatsapp: body.whatsapp,
        socialLinks: { instagram: body.instagram, youtube: body.youtube },
      },
    });
    toast.success('Settings saved');
    qc.invalidateQueries({ queryKey: ['settings'] });
  }

  async function saveBanner(e) {
    e.preventDefault();
    const body = Object.fromEntries(new FormData(e.currentTarget));
    if (bannerImage) {
      const image = new FormData();
      image.append('image', bannerImage);
      const upload = await api.post('/media', image, { headers: { 'Content-Type': 'multipart/form-data' } });
      body.imageUrl = upload.data.url;
    }
    body.order = Number(body.order || 0);
    await api.post('/banners', body);
    toast.success('Banner saved');
    setBannerImage(null);
    e.currentTarget.reset();
    qc.invalidateQueries({ queryKey: ['banners'] });
  }

  async function saveLegal(slug, title, content) {
    await api.put(`/legal/${slug}`, { slug, title, content, isActive: true });
    toast.success('Legal page saved');
    qc.invalidateQueries({ queryKey: ['legal'] });
  }

  const company = settings.data?.company || {};
  return (
    <>
      <Header title="Settings" />
      <main className="space-y-4 p-4 sm:space-y-6 sm:p-8">
        <form onSubmit={saveSettings} className="grid grid-cols-1 gap-4 rounded-lg border border-border bg-card p-4 sm:p-5 sm:grid-cols-2">
          <Input name="bundlePrice" label="Bundle Price" type="number" defaultValue={settings.data?.bundlePrice || 4999} />
          <label className="flex items-center gap-2 text-sm text-white">
            <input name="maintenanceMode" type="checkbox" defaultChecked={settings.data?.maintenanceMode} className="accent-gold" />
            Maintenance Mode
          </label>
          <Input name="supportEmail" label="Support Email" defaultValue={company.supportEmail} />
          <Input name="supportPhone" label="Support Phone" defaultValue={company.supportPhone} />
          <Input name="whatsapp" label="WhatsApp Number" defaultValue={company.whatsapp} />
          <Input name="instagram" label="Instagram" defaultValue={company.socialLinks?.instagram} />
          <Input name="youtube" label="YouTube" defaultValue={company.socialLinks?.youtube} />
          <label className="col-span-full space-y-2 text-sm">
            <span className="text-muted">Company Description</span>
            <textarea name="description" className="min-h-24 w-full rounded-md border border-border bg-secondary p-3 text-white focus:border-gold focus:outline-none" defaultValue={company.description} />
          </label>
          <label className="space-y-2 text-sm">
            <span className="text-muted">Mission</span>
            <textarea name="mission" className="min-h-24 w-full rounded-md border border-border bg-secondary p-3 text-white focus:border-gold focus:outline-none" defaultValue={company.mission} />
          </label>
          <label className="space-y-2 text-sm">
            <span className="text-muted">Vision</span>
            <textarea name="vision" className="min-h-24 w-full rounded-md border border-border bg-secondary p-3 text-white focus:border-gold focus:outline-none" defaultValue={company.vision} />
          </label>
          <Button className="col-span-full">Save Settings</Button>
        </form>
        <section className="rounded-lg border border-border bg-card p-4 sm:p-5">
          <h2 className="mb-4 text-xl font-bold">Change Password</h2>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input type="password" placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <Button onClick={async () => { await api.put('/admin/password', { password }); setPassword(''); toast.success('Password changed'); }}>Update</Button>
          </div>
        </section>
        <section className="rounded-lg border border-border bg-card p-4 sm:p-5">
          <h2 className="mb-4 text-xl font-bold">App Banners</h2>
          <form onSubmit={saveBanner} className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Input name="title" label="Title" required />
            <Input name="subtitle" label="Subtitle" />
            <Input name="imageUrl" label="Image URL" />
            <Input name="order" label="Order" type="number" />
            <label className="col-span-full rounded-md border border-dashed border-border bg-secondary p-4 text-sm">
              <span className="block font-semibold text-gold">Upload Banner Image</span>
              <input className="mt-2" type="file" accept="image/*" onChange={(e) => setBannerImage(e.target.files?.[0] || null)} />
              <span className="mt-2 block text-muted">{bannerImage ? bannerImage.name : 'Optional when Image URL is filled.'}</span>
            </label>
            <Button className="col-span-full">Add Banner</Button>
          </form>
          <div className="space-y-2">{banners.data?.map((b) => <div key={b._id} className="flex items-center justify-between rounded-md border border-border p-3"><div><div className="font-semibold">{b.title}</div><div className="text-sm text-muted">{b.subtitle}</div></div><Badge tone={b.isActive ? 'success' : 'error'}>{b.isActive ? 'Active' : 'Off'}</Badge></div>)}</div>
        </section>
        <section className="space-y-4 rounded-lg border border-border bg-card p-5">
          <h2 className="text-xl font-bold">Legal Pages</h2>
          {legal.data?.map((page) => <LegalEditor key={page.slug} page={page} onSave={saveLegal} />)}
        </section>
      </main>
    </>
  );
}

function LegalEditor({ page, onSave }) {
  const [title, setTitle] = useState(page.title);
  const [content, setContent] = useState(page.content);
  return <div className="rounded-md border border-border p-4"><Input label={page.slug} value={title} onChange={(e) => setTitle(e.target.value)} /><textarea className="mt-3 min-h-28 w-full rounded-md p-3" value={content} onChange={(e) => setContent(e.target.value)} /><Button className="mt-3" onClick={() => onSave(page.slug, title, content)}>Save Page</Button></div>;
}
