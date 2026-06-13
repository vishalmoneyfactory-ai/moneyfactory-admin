import './globals.css';
import { Toaster } from 'react-hot-toast';
import QueryProvider from '../components/layout/QueryProvider';

export const metadata = {
  title: 'Money Factory Admin',
  description: 'Money Factory admin dashboard',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          {children}
          <Toaster position="top-right" toastOptions={{ style: { background: '#1A1A1A', color: '#FFFFFF', border: '1px solid #2A2A2A' } }} />
        </QueryProvider>
      </body>
    </html>
  );
}
