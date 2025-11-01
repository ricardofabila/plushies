import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppHeader from '@/components/navigation/AppHeader';
import StoreTabs from '@/components/navigation/StoreTabs';
import ToastContainer from '@/components/ui/Toast';
import Dashboard from '@/pages/Dashboard';
import StoreDetail from '@/pages/StoreDetail';
import Settings from '@/pages/Settings';
import { ToastProvider, useToast } from '@/contexts/ToastContext';

const AppContent = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      {/* Main Application Layout */}
      <div className="flex flex-col min-h-screen">
        {/* App Header */}
        <AppHeader />

        {/* Store Navigation Tabs */}
        <StoreTabs />

        {/* Main Content Area */}
        <main className="flex-1 container mx-auto px-4 py-6 max-w-7xl">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/store/:storeId" element={<StoreDetail />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

function App() {
  return (
    <Router>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </Router>
  );
}

export default App;
