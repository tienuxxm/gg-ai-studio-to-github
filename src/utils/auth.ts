// src/utils/auth.ts
export const getCurrentUser = () => {
  const userJson = localStorage.getItem('user');
  if (!userJson) return null;

  const user = JSON.parse(userJson);

  // ✅ Chuẩn hóa lại role & department thành object (giả lập giống từ backend)
  if (typeof user.role === 'string') {
    user.role = { name_role: user.role };
  }

  if (typeof user.department === 'string') {
    user.department = { name_department: user.department };
  }

  return user;
};
