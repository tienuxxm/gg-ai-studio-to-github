import React, { useState, useEffect } from 'react';
import { X, Folder,Plus,Trash2  } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  prefix: string;
  user_emails?:string[];
}

interface CategoryModalProps {
  category: Category | null;
  onSave: (category: Omit<Category, 'id'> & { user_emails?: string[] }) => void;
  onClose: () => void;
  readOnly?:boolean;
}

const CategoryModal: React.FC<CategoryModalProps> = ({ category, onSave, onClose , readOnly = false }) => {
  const [formData, setFormData] = useState<Omit<Category, 'id'>>({
    name: '',
    description: '',
    status: 'active',
    prefix: '',
  });
  const [userEmails, setUserEmails] = useState<string[]>([]);


// Trong file CategoryModal.tsx

  useEffect(() => {
    if (category) {
      // 1. Fill dữ liệu cơ bản
      setFormData({
        name: category.name,
        description: category.description,
        status: category.status,
        prefix: category.prefix,
      });

      // 2. Xử lý logic hiển thị Email (SỬA LẠI ĐOẠN NÀY)
      
      // Ưu tiên 1: Nếu có key 'user_emails' (Chuẩn mới mình định nghĩa)
      if (category.user_emails && Array.isArray(category.user_emails)) {
        setUserEmails(category.user_emails);
      } 
      // Ưu tiên 2: Nếu API trả về key 'users' (Dữ liệu thực tế bạn đang gặp)
      else if ('users' in category && Array.isArray((category as any).users)) {
        const rawUsers = (category as any).users;
        
        // KIỂM TRA QUAN TRỌNG: Xem dữ liệu bên trong là String hay Object
        if (rawUsers.length > 0 && typeof rawUsers[0] === 'string') {
           // Trường hợp API trả về: ["a@b.com", "c@d.com"]
           // -> Gán trực tiếp luôn, không cần .email
           setUserEmails(rawUsers);
        } else {
           // Trường hợp cũ (nếu có): [{email: "a@b.com"}, ...]
           // -> Lúc này mới cần .map(u => u.email)
           const emails = rawUsers.map((u: any) => u.email || '');
           setUserEmails(emails);
        }
      } 
      else {
        setUserEmails([]);
      }

    } else {
      // Reset form khi tạo mới
      setFormData({
        name: '',
        description: '',
        status: 'active',
        prefix: '',
      });
      setUserEmails([]);
    }
  }, [category]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

 const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  const payload = {
    ...formData,
    user_emails: userEmails.filter(email => email.trim() !== '')
  };
  onSave(payload);
};

  const addUserEmail = () => {setUserEmails([...userEmails, '']);};
  const updateUserEmail = (index: number, value: string) => {
  const updated = [...userEmails];
  updated[index] = value;
  setUserEmails(updated);
  };

  const removeUserEmail = (index: number) => {
  const updated = [...userEmails];
  updated.splice(index, 1);
  setUserEmails(updated);
  };
//   useEffect(() => {
//   if (category) {
//     setFormData({
//       name: category.name,
//       description: category.description,
//       status: category.status,
//       prefix: category.prefix,
//     });

//     // Gán danh sách email từ category.users
//     if ('users' in category && Array.isArray((category as any).users)) {
//       const users = (category as any).users as { email: string }[];
//       const emails = users.map(u => u.email);
//       setUserEmails(emails);
//     } else {
//       setUserEmails([]);
//     }
//   }
// }, [category]);



  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
          <h2 className="text-2xl font-bold text-white">
            {readOnly ? 'View Category':(category ? 'Edit Category' : 'Add New Category')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Category Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={readOnly}
              required
              placeholder="Enter category name"
              className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-white"
            />
            
          </div>
          {/* Prefix */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Prefix</label>
            <input
              type="text"
              name="prefix"
              value={formData.prefix}
              onChange={handleChange}
              disabled={readOnly}              
              required
              className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-white"
              placeholder="Enter prefix"
            />
          </div>

          <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Assigned Users</h3>
            {!readOnly &&(
              <button
              type="button"
              onClick={addUserEmail}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add User</span>
            </button>
            )}
            
          </div>
          {userEmails.map((email, index) => (
            <div key={index} className="flex gap-2 items-center">
              <input
                type="email"
                value={email}
                onChange={(e) => updateUserEmail(index, e.target.value)}
                placeholder="User email"
                disabled={readOnly}

                className="flex-1 px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-white"
              />
              {!readOnly && (
                <button
                type="button"
                onClick={() => removeUserEmail(index)}
                className="text-red-400 hover:text-red-300"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              )}
              
            </div>
          ))}

          </div>


          

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={readOnly}

              placeholder="Enter description"
              className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-white"
              rows={4}
            />
          </div>

          {/* Status */}
          {/* <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              disabled={readOnly}

              className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-white"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div> */}

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-700/50">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
            >
              {readOnly ? 'Close':'Cancel'}
              
            </button>
            {!readOnly && (
              <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium rounded-xl transition-all duration-300"
            >
              {category ? 'Update Category' : 'Create Category'}
            </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;
