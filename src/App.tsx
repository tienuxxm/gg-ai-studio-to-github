import { Routes, Route, Navigate} from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import DashboardLayout from './layouts/DashboardLayout';

export default function App() {
  // Component bảo vệ: Luôn kiểm tra localStorage mỗi khi được gọi
  const PrivateRoute = ({ children }: { children: JSX.Element }) => {
    const isAuth = !!localStorage.getItem('token'); // Kiểm tra trực tiếp tại đây
    return isAuth ? children : <Navigate to="/" replace />;
  };

  // Component chặn đăng nhập: Nếu đã có token thì không cho vào trang Login nữa
  const PublicRoute = ({ children }: { children: JSX.Element }) => {
    const isAuth = !!localStorage.getItem('token');
    return isAuth ? <Navigate to="/dashboard" replace /> : children;
  };

  return (
    <Routes>
      {/* Trang Login: Bọc trong PublicRoute để nếu đã login thì tự vào dashboard */}
      <Route 
        path="/" 
        element={
          <PublicRoute>
            <AuthPage />
          </PublicRoute>
        } 
      />

      {/* Trang Dashboard: Bọc trong PrivateRoute */}
      <Route
        path="/dashboard/*"
        element={
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        }
      />

      {/* Fix Bug 1: Nếu đường dẫn sai (hoặc sau khi logout), tự động về trang chủ */}
      {/* replace giúp không lưu lịch sử duyệt web để back lại không bị lỗi */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}