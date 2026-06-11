'use client';

import { useEffect, useState } from 'react';
import { Eye, EyeOff, LockKeyhole, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '../../lib/axios';
import { setSession } from '../../lib/auth';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState('login');
  const [checking, setChecking] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/auth/admin/setup-status')
      .then(({ data }) => setMode(data.hasAdmin ? 'login' : 'setup'))
      .finally(() => setChecking(false));
  }, []);

  async function submit(e) {
    e.preventDefault();
    if (mode === 'setup' && password !== confirm) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const payload = mode === 'setup' ? { name, email, phone, password } : { email, password };
      const endpoint = mode === 'setup' ? '/auth/admin/setup' : '/auth/admin/login';
      const { data } = await api.post(endpoint, payload);
      setSession(data.token, data.user);
      toast.success(mode === 'setup' ? 'Admin account created' : 'Welcome back');
      router.replace('/dashboard');
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return <main className="flex min-h-screen items-center justify-center bg-primary px-4"><div className="text-gold">Checking admin setup...</div></main>;
  }

  const isSetup = mode === 'setup';

  return (
    <main className="flex min-h-screen items-center justify-center bg-primary px-4">
      <form onSubmit={submit} className="w-full max-w-md rounded-lg border border-gold/50 bg-card p-8 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-gold text-gold">
            {isSetup ? <ShieldCheck /> : <LockKeyhole />}
          </div>
          <h1 className="text-4xl font-black text-gold">MONEY FACTORY</h1>
          <p className="mt-2 text-muted">{isSetup ? 'Create the first admin account' : 'Admin Portal'}</p>
        </div>
        <div className="space-y-4">
          {isSetup && <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />}
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          {isSetup && <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />}
          <label className="block space-y-2 text-sm">
            <span className="font-medium">Password</span>
            <div className="relative">
              <input className="w-full rounded-md px-3 py-2 pr-10" type={show ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required />
              <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-2.5 text-muted">{show ? <EyeOff size={18} /> : <Eye size={18} />}</button>
            </div>
          </label>
          {isSetup && <Input label="Confirm Password" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />}
          <Button disabled={loading} className="w-full">{loading ? (isSetup ? 'Creating...' : 'Signing In...') : (isSetup ? 'Create Admin Account' : 'Sign In')}</Button>
        </div>
      </form>
    </main>
  );
}
