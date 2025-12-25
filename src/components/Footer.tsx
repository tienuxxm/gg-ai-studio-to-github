import React from 'react';
import { Activity, Phone, Mail, HelpCircle } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="h-12 bg-gray-900/80 backdrop-blur-xl border-t border-gray-700/50 flex items-center justify-between px-3 sm:px-6 text-xs sm:text-sm text-gray-400">
      {/* Left Section */}
      <div className="flex items-center space-x-3 sm:space-x-6">
        <div className="flex items-center space-x-2">
          <span className="hidden sm:inline">Version:</span>
          <span className="sm:hidden">v</span>
          <span className="text-blue-400 font-medium">v1.2.0</span>
        </div>
        
        <div className="hidden sm:flex items-center space-x-2">
          <Activity className="h-4 w-4 text-green-400" />
          <span>System Status:</span>
          <span className="text-green-400 font-medium">Online 99.9% uptime</span>
        </div>
      </div>

      {/* Center Section */}
      <div className="hidden lg:flex items-center space-x-6">
        <a 
          href="#" 
          className="flex items-center space-x-2 hover:text-blue-400 transition-colors"
        >
          <HelpCircle className="h-4 w-4" />
          <span>FAQ</span>
        </a>
        
        <a 
          href="tel:19001234" 
          className="flex items-center space-x-2 hover:text-blue-400 transition-colors"
        >
          <Phone className="h-4 w-4" />
          <span>Hotline: 1900 1234</span>
        </a>
        
        <a 
          href="mailto:support@company.com" 
          className="flex items-center space-x-2 hover:text-blue-400 transition-colors"
        >
          <Mail className="h-4 w-4" />
          <span>Support</span>
        </a>
      </div>

      {/* Right Section */}
      <div className="text-gray-500 text-xs sm:text-sm">
        © 2025 BITEX Company. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;