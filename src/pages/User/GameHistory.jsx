import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    History,
    Trophy,
    Calendar,
    CreditCard,
    TrendingUp,
    Filter,
    Search,
    ArrowUpDown,
    Star,
    Gamepad2,
    Clock,
    Phone,
    Smartphone,
    Award,
    Zap,
    Target,
    RefreshCw,
    ArrowLeft
} from 'lucide-react';
import { gameTransaction } from '../../api/User/GameAPI';
import { useNavigate } from 'react-router-dom';

// Transaction Card Component for Mobile
const TransactionCard = ({ transaction, index }) => {
    const getTransactionIcon = (type) => {
        switch (type.toLowerCase()) {
            case 'credit':
                return { icon: <TrendingUp className="w-4 h-4" />, color: 'text-green-400', bg: 'bg-green-500/20' };
            case 'debit':
                return { icon: <TrendingUp className="w-4 h-4 rotate-180" />, color: 'text-red-400', bg: 'bg-red-500/20' };
            case 'pending':
                return { icon: <Clock className="w-4 h-4" />, color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
            default:
                return { icon: <CreditCard className="w-4 h-4" />, color: 'text-purple-400', bg: 'bg-purple-500/20' };
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        };
    };


    const transactionIcon = getTransactionIcon(transaction.Transaction_Type);
    const createdDate = formatDate(transaction.Created_At);
    const updatedDate = formatDate(transaction.Updated_At);

    // Render different layouts based on transaction type
    const renderTransactionHeader = () => {
        if (transaction.Transaction_Type.toLowerCase() === 'credit') {
            return (
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-xl ${transactionIcon.bg} border border-white/20`}>
                            <span className={transactionIcon.color}>
                                {transactionIcon.icon}
                            </span>
                        </div>
                        <div>
                            <h3 className="text-white font-semibold text-sm">
                                {transaction.Transaction_Type}
                            </h3>
                            <p className="text-gray-400 text-xs">
                                {transaction.Transaction_ID.slice(-8)}
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-white text-sm font-semibold">
                            {createdDate.date}
                        </div>
                        <div className="text-gray-400 text-xs">
                            {createdDate.time}
                        </div>
                    </div>
                </div>
            );
        }

        if (transaction.Transaction_Type.toLowerCase() === 'pending') {
            return (
                <div className="mb-3">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-xl ${transactionIcon.bg} border border-white/20`}>
                                <span className={transactionIcon.color}>
                                    {transactionIcon.icon}
                                </span>
                            </div>
                            <div>
                                <h3 className="text-white font-semibold text-sm">
                                    {transaction.Transaction_Type}
                                </h3>
                                <p className="text-gray-400 text-xs">
                                    {transaction.Transaction_ID.slice(-8)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Credit and Debit Timeline for Pending */}
                    <div className="bg-white/5 rounded-xl p-3 space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                <span className="text-green-400 text-xs font-medium">Credit</span>
                            </div>
                            <div className="text-right">
                                <div className="text-white text-xs font-semibold">
                                    {createdDate.date}
                                </div>
                                <div className="text-gray-400 text-xs">
                                    {createdDate.time}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                                <span className="text-yellow-400 text-xs font-medium">Processing</span>
                            </div>
                            <div className="text-right">
                                <div className="text-yellow-400 text-xs font-semibold">
                                    {updatedDate.date}
                                </div>
                                <div className="text-gray-400 text-xs">
                                    {updatedDate.time}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        if (transaction.Transaction_Type.toLowerCase() === 'debit') {
            return (
                <div className="mb-3">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-xl ${transactionIcon.bg} border border-white/20`}>
                                <span className={transactionIcon.color}>
                                    {transactionIcon.icon}
                                </span>
                            </div>
                            <div>
                                <h3 className="text-white font-semibold text-sm">
                                    {transaction.Transaction_Type}
                                </h3>
                                <p className="text-gray-400 text-xs">
                                    {transaction.Transaction_ID.slice(-8)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Credit and Debit Timeline for Completed */}
                    <div className="bg-white/5 rounded-xl p-3 space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                <span className="text-green-400 text-xs font-medium">Credit</span>
                            </div>
                            <div className="text-right">
                                <div className="text-white text-xs font-semibold">
                                    {createdDate.date}
                                </div>
                                <div className="text-gray-400 text-xs">
                                    {createdDate.time}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                                <span className="text-red-400 text-xs font-medium">Debit</span>
                            </div>
                            <div className="text-right">
                                <div className="text-red-400 text-xs font-semibold">
                                    {updatedDate.date}
                                </div>
                                <div className="text-gray-400 text-xs">
                                    {updatedDate.time}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
    };

    return (
        <motion.div
            className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 hover:bg-white/15 transition-all duration-300"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.6 }}
            whileHover={{ scale: 1.02, y: -2 }}
        >
            {/* Dynamic Header */}
            {renderTransactionHeader()}

            {/* Details */}
            <div className="space-y-2">
                {transaction.Phone_Number && (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-gray-300 text-xs">
                            <Phone className="w-3 h-3" />
                            <span>Phone</span>
                        </div>
                        <span className="text-white text-xs font-medium">
                            {transaction.Phone_Number}
                        </span>
                    </div>
                )}

                {transaction.Game_ID && (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-gray-300 text-xs">
                            <Gamepad2 className="w-3 h-3" />
                            <span>Game</span>
                        </div>
                        <span className="text-purple-400 text-xs font-medium">
                            {transaction.Game_ID.slice(-8)}
                        </span>
                    </div>
                )}

                {transaction.Score !== null && (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-gray-300 text-xs">
                            <Target className="w-3 h-3" />
                            <span>Score</span>
                        </div>
                        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 px-2 py-1 rounded-full border border-yellow-500/30">
                            <span className="text-yellow-400 text-xs font-semibold">
                                {transaction.Score}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Status Indicator */}
            <div className="mt-3 pt-3 border-t border-white/10">
                <div className="flex items-center justify-center">
                    {transaction.Transaction_Type.toLowerCase() === 'pending' ? (
                        <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/30">
                            <Clock className="w-3 h-3 text-yellow-400 animate-pulse" />
                            <span className="text-yellow-400 text-xs font-medium">
                                Transaction in process
                            </span>
                        </div>
                    ) : transaction.Transaction_Type.toLowerCase() === 'credit' ? (
                        <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30">
                            <Star className="w-3 h-3 text-green-400" />
                            <span className="text-white text-xs font-medium">
                                Credit Complete
                            </span>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30">
                            <Star className="w-3 h-3 text-red-400" />
                            <span className="text-white text-xs font-medium">
                                Transaction Complete
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

// Stats Card Component
const StatsCard = ({ title, value, icon, color, bgColor }) => (
    <motion.div
        className={`${bgColor} backdrop-blur-md rounded-2xl p-4 border border-white/20`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        whileHover={{ scale: 1.05, y: -2 }}
    >
        <div className="flex items-center justify-between">
            <div>
                <p className="text-gray-300 text-xs font-medium mb-1">{title}</p>
                <p className={`${color} text-lg font-bold`}>{value}</p>
            </div>
            <div className={`p-3 rounded-xl ${bgColor} border border-white/20`}>
                {icon}
            </div>
        </div>
    </motion.div>
);

// Main GameHistory Component
export default function GameHistory() {
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [sortOrder, setSortOrder] = useState('desc');

    // Fetch transaction data
    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                setLoading(true);
                const response = await gameTransaction();

                if (response.Status && response.Data) {
                    setTransactions(response.Data);
                } else {
                    setError(response.Message || 'Failed to load transaction history');
                }
            } catch (err) {
                console.error('Error fetching transactions:', err);
                setError('Failed to load transaction history. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, []);

    // Filter and search logic
    const filteredTransactions = transactions.filter(transaction => {
        const matchesSearch =
            transaction.Transaction_ID.toLowerCase().includes(searchTerm.toLowerCase()) ||
            transaction.Game_ID?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            transaction.Phone_Number?.includes(searchTerm);

        const matchesFilter =
            filterType === 'all' ||
            transaction.Transaction_Type.toLowerCase() === filterType.toLowerCase();

        return matchesSearch && matchesFilter;
    });

    // Sort transactions
    const sortedTransactions = [...filteredTransactions].sort((a, b) => {
        const dateA = new Date(a.Created_At);
        const dateB = new Date(b.Created_At);
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    // Calculate stats
    const stats = {
        total: transactions.length,
        credits: transactions.filter(t => t.Transaction_Type.toLowerCase() === 'credit').length,
        debits: transactions.filter(t => t.Transaction_Type.toLowerCase() === 'debit').length,
        pending: transactions.filter(t => t.Transaction_Type.toLowerCase() === 'pending').length
    };

    const handleRefresh = async () => {
        setLoading(true);
        try {
            const response = await gameTransaction();
            if (response.Status && response.Data) {
                setTransactions(response.Data);
                setError(null);
            }
        } catch (err) {
            setError('Failed to refresh data');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate(-1);
    };


    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
                <motion.div
                    className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20"
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-white text-lg">Loading history...</span>
                    </div>
                </motion.div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center px-4">
                <motion.div
                    className="bg-red-500/10 backdrop-blur-md p-8 rounded-2xl border border-red-500/20 text-center max-w-md"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
                        <History className="w-8 h-8 text-red-400" />
                    </div>
                    <h3 className="text-white text-xl font-bold mb-2">Oops!</h3>
                    <p className="text-red-400 mb-4">{error}</p>
                    <button
                        onClick={handleRefresh}
                        className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-2 rounded-lg text-white font-medium hover:from-red-600 hover:to-red-700 transition-all"
                    >
                        Retry
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
            {/* Ambient Particles */}
            <div className="absolute inset-0 pointer-events-none">
                {[...Array(15)].map((_, index) => (
                    <motion.div
                        key={index}
                        className="absolute w-1 h-1 bg-purple-400 rounded-full opacity-40"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            y: [0, -20, 0],
                            opacity: [0.4, 0.8, 0.4],
                            scale: [1, 1.5, 1]
                        }}
                        transition={{
                            delay: Math.random() * 5,
                            duration: 3 + Math.random() * 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                ))}
            </div>

            <div className="relative z-10 p-4 sm:p-6 max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    className="flex items-center justify-between mb-6"
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="flex items-center space-x-3">
                        <motion.button
                            onClick={handleBack}
                            className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 text-white hover:bg-white/20 transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                        </motion.button>

                        <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl">
                            <History className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Game History</h1>
                            <p className="text-gray-400 text-sm">Track your gaming journey</p>
                        </div>
                    </div>

                    <motion.button
                        onClick={handleRefresh}
                        className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 text-white hover:bg-white/20 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <RefreshCw className="w-5 h-5" />
                    </motion.button>
                </motion.div>

                {/* Stats Cards */}
                <motion.div
                    className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                >
                    <StatsCard
                        title="Total Transactions"
                        value={stats.total}
                        icon={<CreditCard className="w-5 h-5 text-purple-400" />}
                        color="text-purple-400"
                        bgColor="bg-purple-500/10"
                    />
                    <StatsCard
                        title="Credits"
                        value={stats.credits}
                        icon={<TrendingUp className="w-5 h-5 text-green-400" />}
                        color="text-green-400"
                        bgColor="bg-green-500/10"
                    />
                    <StatsCard
                        title="Debits"
                        value={stats.debits}
                        icon={<TrendingUp className="w-5 h-5 text-red-400 rotate-180" />}
                        color="text-red-400"
                        bgColor="bg-red-500/10"
                    />
                    <StatsCard
                        title="Pending"
                        value={stats.pending}
                        icon={<Clock className="w-5 h-5 text-yellow-400" />}
                        color="text-yellow-400"
                        bgColor="bg-yellow-500/10"
                    />
                </motion.div>

                {/* Search and Filter Controls */}
                <motion.div
                    className="bg-white/10 backdrop-blur-md rounded-2xl p-4 mb-6 border border-white/20"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                >
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search transactions..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-white/10 border border-white/20 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
                            />
                        </div>

                        {/* Filter */}
                        <div className="flex space-x-2">
                            <div className="relative">
                                <select
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                    className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 appearance-none pr-10 min-w-32"
                                    style={{
                                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                                        backgroundPosition: 'right 8px center',
                                        backgroundRepeat: 'no-repeat',
                                        backgroundSize: '16px'
                                    }}
                                >
                                    <option value="all" style={{ backgroundColor: '#1f2937', color: 'white' }}>All Types</option>
                                    <option value="credit" style={{ backgroundColor: '#1f2937', color: 'white' }}>Credits</option>
                                    <option value="debit" style={{ backgroundColor: '#1f2937', color: 'white' }}>Debits</option>
                                    <option value="pending" style={{ backgroundColor: '#1f2937', color: 'white' }}>Pending</option>
                                </select>
                            </div>

                            <button
                                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                                className="p-3 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-colors"
                            >
                                <ArrowUpDown className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Transactions List */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                >
                    {sortedTransactions.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="w-24 h-24 mx-auto mb-6 bg-white/10 rounded-2xl flex items-center justify-center">
                                <History className="w-12 h-12 text-gray-400" />
                            </div>
                            <h3 className="text-white text-xl font-bold mb-2">No Transactions Found</h3>
                            <p className="text-gray-400">
                                {searchTerm || filterType !== 'all' ? 'Try adjusting your search or filter' : 'Start playing games to see your history!'}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <AnimatePresence>
                                {sortedTransactions.map((transaction, index) => (
                                    <TransactionCard
                                        key={transaction.Transaction_ID}
                                        transaction={transaction}
                                        index={index}
                                    />
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}