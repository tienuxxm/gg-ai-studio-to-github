import Swal from 'sweetalert2';

// Tạo instance với cấu hình mặc định (Dark mode + Tailwind)
const MySwal = Swal.mixin({
  background: '#1f2937', // bg-gray-800
  color: '#f3f4f6',      // text-gray-100
  customClass: {
    popup: 'border border-gray-700 rounded-xl shadow-2xl',
    title: 'text-xl font-bold text-white',
    htmlContainer: 'text-gray-300',
    confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg mr-3 transition-colors',
    cancelButton: 'bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium px-5 py-2.5 rounded-lg transition-colors'
  },
  buttonsStyling: false // Tắt style mặc định để dùng class Tailwind ở trên
});

export default MySwal;