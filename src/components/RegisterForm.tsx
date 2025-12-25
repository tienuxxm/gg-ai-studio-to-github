import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Lock,
  Shield,
  Building2,
  Eye,
  EyeOff,
} from 'lucide-react';
import api from '../services/api';               // axios instance của bạn

/* ===== Kiểu dữ liệu lấy từ backend ===== */
type Role = { id: number; code: string; label: string };
type Department = { id: number; label: string };

interface RegisterFormProps {
  onSubmit: (formData: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    role_id: number;
    department_id?: number;
  }) => void;
}

/* ===== Wrapper input giữ nguyên ===== */
const Field = ({
  icon,
  ...inputProps
}: React.InputHTMLAttributes<HTMLInputElement> & { icon: JSX.Element }) => (
  <div className="relative group">
    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
      {icon}
    </div>
    <input
      {...inputProps}
      className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl
                 text-white placeholder-gray-400 focus:outline-none focus:ring-2
                 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 backdrop-blur-sm"
    />
  </div>
);

const RegisterForm: React.FC<RegisterFormProps> = ({ onSubmit }) => {
  /* ---------- META ---------- */
  const [roles, setRoles] = useState<Role[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingMeta, setLoadingMeta] = useState(true);

  /* ---------- FORM ---------- */
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role_id: 0,
    department_id: 0,
  });
  const [showPw, setShowPw] = useState(false);

  /* ---------- Fetch roles + departments lúc mount ---------- */
  useEffect(() => {
    (async () => {
      try {
        const [roleRes, deptRes] = await Promise.all([
          api.get<Role[]>('/roles'),
          api.get<Department[]>('/departments'),
        ]);

        setRoles(roleRes.data);
        setDepartments(deptRes.data);

        // gán mặc định option đầu tiên nếu có
        setForm((f) => ({
          ...f,
          role_id: roleRes.data[0]?.id ?? 0,
          department_id: deptRes.data[0]?.id ?? 0,
        }));
      } catch (err) {
        console.error('Lỗi tải roles/departments:', err);
      } finally {
        setLoadingMeta(false);
      }
    })();
  }, []);


  /* ---------- Helpers ---------- */
const selectedRole = roles.find((r) => r.id === +form.role_id);
const isDirector = selectedRole?.label?.toLowerCase() === 'giam_doc'; // hoặc 'giám đốc'

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = { ...form };
    if (isDirector) delete payload.department_id;        // không gửi phòng ban
    onSubmit(payload);
  };

  /* ---------- Loading skeleton ---------- */
  if (loadingMeta) {
    return <p className="text-center text-gray-300 py-6">Đang tải dữ liệu…</p>;
  }

  /* ---------- UI ---------- */
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-3xl font-bold text-white text-center mb-2">Đăng ký</h2>

      {/* Họ tên */}
      <Field
        icon={<User className="h-5 w-5 text-gray-400 group-focus-within:text-blue-400" />}
        type="text"
        name="name"
        placeholder="Full name"
        value={form.name}
        onChange={handleChange}
        required
      />

      {/* Email */}
      <Field
        icon={<Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-400" />}
        type="email"
        name="email"
        placeholder="Email address"
        value={form.email}
        onChange={handleChange}
        required
      />

      {/* Mật khẩu + nút mắt */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-400" />
        </div>
        <input
          type={showPw ? 'text' : 'password'}
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          className="w-full pl-12 pr-12 py-3 bg-gray-800/50 border border-gray-700 rounded-xl
                     text-white placeholder-gray-400 focus:outline-none focus:ring-2
                     focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 backdrop-blur-sm"
        />
        <button
          type="button"
          onClick={() => setShowPw(!showPw)}
          className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-blue-400"
        >
          {showPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>

      {/* Nhập lại mật khẩu */}
      <Field
        icon={<Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-400" />}
        type="password"
        name="password_confirmation"
        placeholder="Re-enter password"
        value={form.password_confirmation}
        onChange={handleChange}
        required
      />

      {/* Combo Role */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Shield className="h-5 w-5 text-gray-400 group-focus-within:text-blue-400" />
        </div>
        <select
          name="role_id"
          value={form.role_id}
          onChange={handleChange}
          className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl
                     text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          {roles.map((r) => (
            <option key={r.id} value={r.id}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      {/* Combo Department – ẩn khi giám đốc */}
      {!isDirector && (
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Building2 className="h-5 w-5 text-gray-400 group-focus-within:text-blue-400" />
          </div>
          <select
            name="department_id"
            value={form.department_id}
            onChange={handleChange}
            className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl
                       text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl transition"
      >
        Đăng ký
      </button>
    </form>
  );
};

export default RegisterForm;
