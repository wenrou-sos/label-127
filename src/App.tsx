import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from '@/components/ui';
import CashierPage from '@/pages/CashierPage';
import MemberLoginPage from '@/pages/member/MemberLoginPage';
import MemberPage from '@/pages/member/MemberPage';

export default function App() {
  return (
    <ToastProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/cashier" replace />} />
          <Route path="/cashier" element={<CashierPage />} />
          <Route path="/member/login" element={<MemberLoginPage />} />
          <Route path="/member" element={<MemberPage />} />
          <Route path="*" element={<Navigate to="/cashier" replace />} />
        </Routes>
      </Router>
    </ToastProvider>
  );
}
