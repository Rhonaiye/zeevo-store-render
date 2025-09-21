'use client';

import { motion } from 'framer-motion';
import { Eye, X, Calendar, User, Mail, Phone, MapPin, CreditCard, Package, Clock, CheckCircle, AlertCircle, DollarSign, Filter, Info } from 'lucide-react';
import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';

// TypeScript interfaces for order data structure
interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  _id: string;
}

interface Customer {
  fullName: string;
  email: string;
  address: string;
  phone: string;
}

interface Order {
  _id: string;
  createdAt: string;
  updatedAt: string;
  customer: Customer;
  items: OrderItem[];
  paymentReference: string;
  status: string;
  storeId: string;
  totalAmount: number;
}

export default function OrdersManagement() {
  const { userProfile } = useAppStore();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  const realOrders = userProfile?.stores[0]?.orders || [];
  // Sort orders by createdAt in descending order (latest first)
  const sortedOrders = [...realOrders].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
  };

  const closeModal = () => {
    setSelectedOrder(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-indigo-600" />;
      case 'paid':
        return <DollarSign className="w-3 h-3 md:w-4 md:h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-3 h-3 md:w-4 md:h-4 text-gray-600" />;
      default:
        return <AlertCircle className="w-3 h-3 md:w-4 md:h-4 text-black" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'paid':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'pending':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      default:
        return 'bg-black text-white border-black';
    }
  };

  const statusInfo = {
    pending: "Orders that have been placed but are still being processed or prepared",
    paid: "Orders that have been paid for but not yet completed or delivered",
    completed: "Orders that have been successfully fulfilled and delivered to customers",
    cancelled: "Orders that have been cancelled by either the customer or the store"
  };

  const filteredOrders = statusFilter === 'all' 
    ? sortedOrders 
    : sortedOrders.filter(order => order.status === statusFilter);

  // Calculate revenue only from paid and completed orders
  const revenueGeneratingOrders = realOrders.filter(order => 
    order.status === 'paid' || order.status === 'completed'
  );
  const totalRevenue = revenueGeneratingOrders.reduce((sum, order) => sum + order.totalAmount, 0);

  const statusCounts = {
    all: realOrders.length,
    pending: realOrders.filter(order => order.status === 'pending').length,
    paid: realOrders.filter(order => order.status === 'paid').length,
    completed: realOrders.filter(order => order.status === 'completed').length,
    cancelled: realOrders.filter(order => order.status === 'cancelled').length,
  };

  return (
    <div className="min-h-screen">
      {/* Main Content */}
      <main className=" mx-auto px-4 sm:px-6 lg:px-3 ">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm md:text-xs font-medium text-gray-600 uppercase tracking-wide">Total Orders</p>
                <p className="text-xl sm:text-2xl md:text-xl font-bold text-black mt-1">{realOrders.length}</p>
              </div>
              <div className="bg-indigo-100 rounded-lg p-2 sm:p-3">
                <Package className="w-4 h-4 sm:w-6 sm:h-6 md:w-5 md:h-5 text-indigo-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm md:text-xs font-medium text-gray-600 uppercase tracking-wide">Pending</p>
                <p className="text-xl sm:text-2xl md:text-xl font-bold text-gray-700 mt-1">
                  {statusCounts.pending}
                </p>
              </div>
              <div className="bg-gray-100 rounded-lg p-2 sm:p-3">
                <Clock className="w-4 h-4 sm:w-6 sm:h-6 md:w-5 md:h-5 text-gray-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm md:text-xs font-medium text-gray-600 uppercase tracking-wide">Paid Orders</p>
                <p className="text-xl sm:text-2xl md:text-xl font-bold text-green-600 mt-1">
                  {statusCounts.paid}
                </p>
              </div>
              <div className="bg-green-100 rounded-lg p-2 sm:p-3">
                <DollarSign className="w-4 h-4 sm:w-6 sm:h-6 md:w-5 md:h-5 text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm md:text-xs font-medium text-gray-600 uppercase tracking-wide">Total Revenue</p>
                <p className="text-lg sm:text-xl md:text-lg font-bold text-black mt-1">
                  {formatCurrency(totalRevenue)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  From {revenueGeneratingOrders.length} paid orders
                </p>
              </div>
              <div className="bg-black rounded-lg p-2 sm:p-3">
                <CreditCard className="w-4 h-4 sm:w-6 sm:h-6 md:w-5 md:h-5 text-white" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-gradient-to-b from-[#069F44] to-[#04DB2A] rounded-lg border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 md:w-5 md:h-5 text-white" />
            <h3 className="text-sm sm:text-base md:text-sm font-semibold text-white">Filter Orders</h3>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All Orders', count: statusCounts.all },
              { key: 'pending', label: 'Pending', count: statusCounts.pending },
              { key: 'paid', label: 'Paid', count: statusCounts.paid },
              { key: 'completed', label: 'Completed', count: statusCounts.completed },
              { key: 'cancelled', label: 'Cancelled', count: statusCounts.cancelled }
            ].map(({ key, label, count }) => (
              <div key={key} className="relative">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setStatusFilter(key)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm md:text-xs font-medium transition-all ${
                    statusFilter === key
                      ? key === 'all' 
                        ? 'bg-[#069A46] text-white'
                        : key === 'completed'
                        ? 'bg-[#069A46] text-white'
                        : key === 'paid'
                        ? 'bg-[#069A46] text-white'
                        : key === 'pending'
                        ? 'bg-gray-600 text-white'
                        : 'bg-red-400 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span>{label}</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                    statusFilter === key
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {count}
                  </span>
                  {key !== 'all' && (
                    <div
                      className="relative"
                      onMouseEnter={() => setShowTooltip(key)}
                      onMouseLeave={() => setShowTooltip(null)}
                    >
                      <Info className="w-3 h-3 opacity-70" />
                      {showTooltip === key && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs rounded-lg p-2 whitespace-nowrap z-10"
                          style={{ width: '200px', whiteSpace: 'normal' }}
                        >
                          {statusInfo[key as keyof typeof statusInfo]}
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black"></div>
                        </motion.div>
                      )}
                    </div>
                  )}
                </motion.button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Orders Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredOrders.map((order, index) => (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-lg  hover:border-indigo-300 transition-all duration-300 group"
            >
              <div className="p-4 sm:p-6">
                {/* Order Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs md:text-xs font-mono text-gray-500 mb-1">
                      #{order._id.slice(-8).toUpperCase()}
                    </p>
                    <h3 className="text-sm sm:text-base md:text-sm font-semibold text-black truncate">
                      {order.customer.fullName}
                    </h3>
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full border text-xs md:text-xs font-medium ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    <span className="capitalize">{order.status}</span>
                  </div>
                </div>

                {/* Order Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-xs sm:text-sm md:text-xs text-gray-600">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 md:w-3 md:h-3 flex-shrink-0" />
                    <span className="truncate">{formatDate(order.createdAt)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs sm:text-sm md:text-xs text-gray-600">
                    <Package className="w-3 h-3 sm:w-4 sm:h-4 md:w-3 md:h-3 flex-shrink-0" />
                    <span>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs sm:text-sm md:text-xs text-gray-600">
                    <Mail className="w-3 h-3 sm:w-4 sm:h-4 md:w-3 md:h-3 flex-shrink-0" />
                    <span className="truncate">{order.customer.email}</span>
                  </div>
                </div>

                {/* Total Amount */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs sm:text-sm md:text-xs text-gray-600">Total Amount</span>
                  <span className="text-sm sm:text-base md:text-sm font-bold text-black">
                    {formatCurrency(order.totalAmount)}
                  </span>
                </div>

                {/* Action Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleViewOrder(order)}
                  className="w-full bg-[#C4FEC8] text-[#05A742] py-2 sm:py-3 px-4 rounded-lg hover:bg-[#C4FEC8]/60 transition-all duration-300 flex items-center justify-center gap-2 font-medium text-xs sm:text-sm md:text-xs"
                >
                  <Eye className="w-3 h-3 sm:w-4 sm:h-4 md:w-3 md:h-3" />
                  View Receipt
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredOrders.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center py-12 sm:py-16"
          >
            <div className="bg-white rounded-lg border border-[#63C28B] p-8 sm:p-12 max-w-md mx-auto">
              <Package className="w-12 h-12 sm:w-16 sm:h-16 md:w-12 md:h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl md:text-lg font-semibold text-black mb-2">
                {statusFilter === 'all' ? 'No orders yet' : `No ${statusFilter} orders`}
              </h3>
              <p className="text-sm sm:text-base md:text-sm text-gray-600">
                {statusFilter === 'all' 
                  ? 'Your orders will appear here once customers start placing them.'
                  : `No orders with ${statusFilter} status found. Try a different filter.`
                }
              </p>
            </div>
          </motion.div>
        )}
      </main>

      {/* Receipt Modal */}
      {selectedOrder && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-lg w-full max-w-sm mx-auto max-h-[85vh] overflow-y-auto shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundImage: `repeating-linear-gradient(
                0deg,
                transparent,
                transparent 2px,
                rgba(0,0,0,0.03) 2px,
                rgba(0,0,0,0.03) 4px
              )`
            }}
          >
            {/* Receipt Header */}
            <div className="p-6 text-center border-b border-dashed border-gray-300">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={closeModal}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-5 h-5" />
              </motion.button>
              
              <h2 className="text-base font-bold text-gray-900 mb-2">{userProfile?.stores[0].name}</h2>
              <p className="text-xs text-gray-600 mb-1">{userProfile?.stores[0].contact?.address}</p>
              <p className="text-xs text-gray-600">{userProfile?.stores[0].contact?.phone}</p>
            </div>

            {/* Receipt Body */}
            <div className="p-6 space-y-4">
              {/* Order Info */}
              <div className="text-center pb-4 border-b border-dashed border-gray-300">
                <h3 className="text-sm font-bold text-gray-900 mb-2">ORDER RECEIPT</h3>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-900">Order #:</span>
                    <span className="font-mono text-gray-600">{selectedOrder._id.slice(-8).toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-900">Date:</span>
                    <span className='text-gray-600'>{formatDate(selectedOrder.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-900">Status:</span>
                    <span
                      className={`px-2 py-1 rounded  text-xs font-medium ${
                        selectedOrder.status === 'pending'
                          ? 'bg-gray-100 text-gray-800'
                          : selectedOrder.status === 'completed'
                          ? 'bg-indigo-100 text-indigo-800'
                          : selectedOrder.status === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-black text-white'
                      }`}
                    >
                      {selectedOrder.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="pb-4 border-b border-dashed border-gray-300">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-xs">
                  <User className="w-3 h-3" />
                  CUSTOMER
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-2">
                    <User className="w-3 h-3 mt-0.5 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-700">{selectedOrder.customer.fullName}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Mail className="w-3 h-3 mt-0.5 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-700 text-xs break-all">{selectedOrder.customer.email}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Phone className="w-3 h-3 mt-0.5 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-700">{selectedOrder.customer.phone}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3 h-3 mt-0.5 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-700 text-xs">{selectedOrder.customer.address}</span>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="pb-4 border-b border-dashed border-gray-300">
                <h4 className="font-semibold text-gray-900 mb-3 text-xs">ITEMS</h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="text-xs">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-gray-900 font-medium leading-tight pr-2">{item.name}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>{item.quantity} x {formatCurrency(item.price)}</span>
                        <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="pb-4 border-b border-dashed border-gray-300">
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className='text-gray-900'>TOTAL:</span>
                  <span className='text-gray-900'>{formatCurrency(selectedOrder.totalAmount)}</span>
                </div>
              </div>

              {/* Payment Info */}
              <div className="pb-4 border-b border-dashed border-gray-300">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-xs">
                  <CreditCard className="w-3 h-3" />
                  PAYMENT
                </h4>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between items-start">
                    <span className="text-gray-800 flex-shrink-0">Reference:</span>
                    <span className="font-mono text-xs break-all text-right ml-2 text-gray-600">{selectedOrder.paymentReference.toUpperCase()}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center text-xs text-gray-500 pt-2">
                <p>Thank you for your business!</p>
                <p className="mt-1">Keep this receipt for your records</p>
                <div className="mt-4 text-center">
                  <div className="inline-block w-16 h-1 bg-gray-300"></div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}