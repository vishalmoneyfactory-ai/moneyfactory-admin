import ProtectedRoute from '../../components/layout/ProtectedRoute';
import Sidebar from '../../components/layout/Sidebar';

export default function DashboardLayout({ children }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-primary">
        <Sidebar />
        <div className="ml-72 min-h-screen">{children}</div>
      </div>
    </ProtectedRoute>
  );
}
