import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';
import BackgroundEffects from '../components/BackgroundEffects';
import api from '../services/api';

export default function AuthPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (email: string, password: string) => {
    try {
      const { data } = await api.post('/login', { email, password });
      // Lưu vào localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      api.post('/admin/send-reminders')
           .then(() => console.log('Đã kích hoạt quét đơn hàng ngầm.'))
           .catch(err => console.error('Lỗi kích hoạt nhắc nhở:', err));
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Đăng nhập thất bại');
    }
  };

  /* ---- REGISTER ---- */
  const handleRegister = async (formData: any) => {
    try {
      const { data } = await api.post('/register', formData);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Đăng ký thất bại');
    }
  };

  /* ---- UI ---- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black relative overflow-hidden">
      <BackgroundEffects />
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="backdrop-blur-xl bg-gray-900/40 border border-gray-700/50 rounded-2xl p-8 shadow-2xl">
            {isRegister ? (
              <>
                <RegisterForm onSubmit={handleRegister} />
                <p className="text-sm text-gray-300 text-center mt-4">
                  Đã có tài khoản?{' '}
                  <button
                    onClick={() => {
                      setIsRegister(false);
                      setError('');
                    }}
                    className="text-indigo-400 hover:underline"
                  >
                    Đăng nhập
                  </button>
                </p>
              </>
            ) : (
              <>
                <LoginForm onSubmit={handleLogin}
                  onSwitchToRegister={() => {
                    setIsRegister(true);
                    setError('');
                  }}
                />

              </>
            )}

            {error && (
              <div className="mt-4 text-red-500 text-sm text-center">{error}</div>
            )}
          </div>
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent h-px animate-pulse"></div>
    </div>
  );
}
