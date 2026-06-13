import ProtectedRoute from '../../components/layout/ProtectedRoute';
import Sidebar from '../../components/layout/Sidebar';
import { SidebarProvider } from '../../components/layout/SidebarContext';

export default function DashboardLayout({ children }) {
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <div className="min-h-screen bg-primary">
          <Sidebar />
          {/* On desktop offset by sidebar width; on mobile full width */}
          <div className="min-h-screen lg:ml-72">{children}</div>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
