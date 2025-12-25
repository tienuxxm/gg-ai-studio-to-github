import { Clock, CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react';

interface StatConfig {
  label: string;
  color: string; // class color của tailwind
  icon: any;
  description: string;
}

export const getStatConfig = (
  role: string | undefined, 
  dept: string | undefined
): { pending: StatConfig; processing: StatConfig } => {
    
  // --- 1. KINH DOANH (SALES) ---
  if ( role === 'Sales') {
    return {
      pending: {
        label: 'Pending',
        description: 'Đơn cần hoàn thiện gửi đi',
        color: 'bg-yellow-500/10 text-yellow-500',
        icon: AlertCircle
      },
      processing: {
        label: 'Processing',
        description: 'Đã gửi Cung ứng/Sếp',
        color: 'bg-blue-500/10 text-blue-500',
        icon: Clock
      }
    };
  }

  // --- 2. CUNG ỨNG (SUPPLY) ---
  if (role === 'Supply' ) {
    return {
      pending: {
        label: 'Pending',
        description: 'Đơn mới từ Sales hoặc Đã duyệt',
        color: 'bg-red-500/10 text-red-500', // Màu đỏ để báo động việc cần làm ngay
        icon: AlertCircle
      },
      processing: {
        label: 'Processing',
        description: 'Chờ sếp duyệt hoặc chờ hàng về',
        color: 'bg-indigo-500/10 text-indigo-500',
        icon: TrendingUp
      }
    };
  }

  // --- 3. GIÁM ĐỐC (LEADER) ---
  if ( role === 'Leader') {
    return {
      pending: {
        label: 'Pending',
        description: 'Đơn cần phê duyệt ngay',
        color: 'bg-orange-500/10 text-orange-500',
        icon: AlertCircle
      },
      processing: {
        label: 'Processing',
        description: 'Đơn đã duyệt, đang chạy',
        color: 'bg-emerald-500/10 text-emerald-500',
        icon: CheckCircle2
      }
    };
  }

  // --- MẶC ĐỊNH ---
  return {
    pending: { label: 'pending', description: 'Pending', color: 'bg-gray-500/10', icon: Clock },
    processing: { label: 'processing', description: 'Processing', color: 'bg-blue-500/10', icon: TrendingUp }
  };
};

