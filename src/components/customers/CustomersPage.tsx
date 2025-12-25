import React, { useState } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Mail, Phone, MapPin, Calendar, DollarSign } from 'lucide-react';
import CustomerModal from './CustomerModal';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  status: 'active' | 'inactive';
  totalOrders: number;
  totalSpent: number;
  lastOrder: string;
  joinDate: string;
  avatar: string;
}

const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([
    {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@email.com',
      phone: '+1 (555) 123-4567',
      address: '123 Main St',
      city: 'New York',
      country: 'USA',
      status: 'active',
      totalOrders: 15,
      totalSpent: 2450.75,
      lastOrder: '2024-01-15',
      joinDate: '2023-06-15',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1'
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+1 (555) 234-5678',
      address: '456 Oak Ave',
      city: 'Los Angeles',
      country: 'USA',
      status: 'active',
      totalOrders: 8,
      totalSpent: 1299.50,
      lastOrder: '2024-01-12',
      joinDate: '2023-08-22',
      avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1'
    },
    {
      id: '3',
      name: 'Mike Wilson',
      email: 'mike.wilson@email.com',
      phone: '+1 (555) 345-6789',
      address: '789 Pine St',
      city: 'Chicago',
      country: 'USA',
      status: 'inactive',
      totalOrders: 3,
      totalSpent: 567.25,
      lastOrder: '2023-11-28',
      joinDate: '2023-09-10',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1'
    },
    {
      id: '4',
      name: 'Emily Davis',
      email: 'emily.davis@email.com',
      phone: '+1 (555) 456-7890',
      address: '321 Elm St',
      city: 'Miami',
      country: 'USA',
      status: 'active',
      totalOrders: 22,
      totalSpent: 3890.00,
      lastOrder: '2024-01-14',
      joinDate: '2023-03-05',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1'
    },
    {
      id: '5',
      name: 'David Brown',
      email: 'david.brown@email.com',
      phone: '+1 (555) 567-8901',
      address: '654 Maple Dr',
      city: 'Seattle',
      country: 'USA',
      status: 'active',
      totalOrders: 11,
      totalSpent: 1876.30,
      lastOrder: '2024-01-10',
      joinDate: '2023-07-18',
      avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const statuses = ['all', 'active', 'inactive'];

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.phone.includes(searchTerm);
    const matchesStatus = selectedStatus === 'all' || customer.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: Customer['status']) => {
    switch (status) {
      case 'active':
        return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'inactive':
        return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  const handleAddCustomer = () => {
    setEditingCustomer(null);
    setShowModal(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setShowModal(true);
  };

  const handleDeleteCustomer = (customerId: string) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      setCustomers(customers.filter(c => c.id !== customerId));
    }
  };

  const handleSaveCustomer = (customerData: Omit<Customer, 'id' | 'totalOrders' | 'totalSpent' | 'lastOrder' | 'joinDate'>) => {
    if (editingCustomer) {
      setCustomers(customers.map(c => 
        c.id === editingCustomer.id 
          ? { ...c, ...customerData }
          : c
      ));
    } else {
      const newCustomer: Customer = {
        ...customerData,
        id: Date.now().toString(),
        totalOrders: 0,
        totalSpent: 0,
        lastOrder: '',
        joinDate: new Date().toISOString().split('T')[0]
      };
      setCustomers([newCustomer, ...customers]);
    }
    setShowModal(false);
  };

  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.status === 'active').length;
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const avgOrderValue = totalRevenue / customers.reduce((sum, c) => sum + c.totalOrders, 0) || 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold text-white mb-2">Customer Management</h1>
          <p className="text-gray-400 text-sm sm:text-base">Manage your customer database and relationships</p>
        </div>
        <button
          onClick={handleAddCustomer}
          className="flex items-center space-x-2 px-3 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium rounded-xl transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
        >
          <Plus className="h-5 w-5" />
          <span className="hidden sm:inline">Add Customer</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-3 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs sm:text-sm">Total Customers</p>
              <p className="text-white text-lg sm:text-2xl font-bold">{totalCustomers}</p>
            </div>
            <div className="p-3 bg-blue-500/20 rounded-xl">
              <Mail className="h-4 w-4 sm:h-6 sm:w-6 text-blue-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-3 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs sm:text-sm">Active Customers</p>
              <p className="text-white text-lg sm:text-2xl font-bold">{activeCustomers}</p>
            </div>
            <div className="p-3 bg-green-500/20 rounded-xl">
              <Calendar className="h-4 w-4 sm:h-6 sm:w-6 text-green-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-3 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs sm:text-sm">Total Revenue</p>
              <p className="text-white text-lg sm:text-2xl font-bold">${totalRevenue.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-purple-500/20 rounded-xl">
              <DollarSign className="h-4 w-4 sm:h-6 sm:w-6 text-purple-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-3 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs sm:text-sm">Avg Order Value</p>
              <p className="text-white text-lg sm:text-2xl font-bold">${avgOrderValue.toFixed(0)}</p>
            </div>
            <div className="p-3 bg-orange-500/20 rounded-xl">
              <DollarSign className="h-4 w-4 sm:h-6 sm:w-6 text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-3 sm:p-6">
        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0 lg:space-x-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 sm:px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm sm:text-base"
          >
            {statuses.map(status => (
              <option key={status} value={status}>
                {status === 'all' ? 'All Status' : status.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl overflow-hidden overflow-x-auto">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-800/50 border-b border-gray-700/50">
              <tr>
                <th className="text-left p-2 sm:p-4 text-gray-300 font-medium text-xs sm:text-sm">Customer</th>
                <th className="text-left p-2 sm:p-4 text-gray-300 font-medium text-xs sm:text-sm">Contact</th>
                <th className="text-left p-2 sm:p-4 text-gray-300 font-medium text-xs sm:text-sm">Location</th>
                <th className="text-left p-2 sm:p-4 text-gray-300 font-medium text-xs sm:text-sm">Orders</th>
                <th className="text-left p-2 sm:p-4 text-gray-300 font-medium text-xs sm:text-sm">Total Spent</th>
                <th className="text-left p-2 sm:p-4 text-gray-300 font-medium text-xs sm:text-sm">Last Order</th>
                <th className="text-left p-2 sm:p-4 text-gray-300 font-medium text-xs sm:text-sm">Status</th>
                <th className="text-left p-2 sm:p-4 text-gray-300 font-medium text-xs sm:text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="border-b border-gray-700/30 hover:bg-gray-800/30 transition-colors">
                  <td className="p-2 sm:p-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={customer.avatar}
                        alt={customer.name}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-white font-medium text-xs sm:text-sm">{customer.name}</p>
                        <p className="text-gray-400 text-xs">Joined {customer.joinDate}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-2 sm:p-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-gray-300">
                        <Mail className="h-4 w-4" />
                        <span className="text-xs sm:text-sm">{customer.email}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-300 hidden sm:flex">
                        <Phone className="h-4 w-4" />
                        <span className="text-xs sm:text-sm">{customer.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-2 sm:p-4">
                    <div className="flex items-center space-x-2 text-gray-300">
                      <MapPin className="h-4 w-4" />
                      <div>
                        <p className="text-xs sm:text-sm">{customer.city}</p>
                        <p className="text-xs text-gray-400">{customer.country}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-2 sm:p-4 text-white font-semibold text-xs sm:text-sm">{customer.totalOrders}</td>
                  <td className="p-2 sm:p-4 text-white font-semibold text-xs sm:text-sm">${customer.totalSpent.toLocaleString()}</td>
                  <td className="p-2 sm:p-4 text-gray-300 text-xs sm:text-sm">{customer.lastOrder || 'Never'}</td>
                  <td className="p-2 sm:p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(customer.status)}`}>
                      {customer.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-2 sm:p-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditCustomer(customer)}
                        className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCustomer(customer.id)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCustomers.length === 0 && (
          <div className="text-center py-12">
            <Mail className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">No customers found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Customer Modal */}
      {showModal && (
        <CustomerModal
          customer={editingCustomer}
          onSave={handleSaveCustomer}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default CustomersPage;