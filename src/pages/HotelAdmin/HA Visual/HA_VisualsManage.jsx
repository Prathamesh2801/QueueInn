

// Mock data for demonstration

import {motion} from 'framer-motion'
export default function HA_VisualsManage() {
    const mockData = {
        totalUsers: 1234,
        totalHotels: 56,
        totalBookings: 789,
        revenue: '$123,456'
    }
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
        >
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {[
                    { label: 'Total Users', value: mockData.totalUsers, color: 'from-blue-500 to-cyan-500' },
                    { label: 'Total Hotels', value: mockData.totalHotels, color: 'from-purple-500 to-pink-500' },
                    { label: 'Total Bookings', value: mockData.totalBookings, color: 'from-green-500 to-emerald-500' },
                    { label: 'Revenue', value: mockData.revenue, color: 'from-yellow-500 to-orange-500' }
                ].map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="relative overflow-hidden rounded-xl bg-gray-800/50 backdrop-blur-sm p-6 border border-gray-700/50"
                    >
                        <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-10`} />
                        <div className="relative">
                            <p className="text-sm font-medium text-gray-300">{stat.label}</p>
                            <p className="text-3xl font-bold text-white">{stat.value}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="rounded-xl bg-gray-800/50 backdrop-blur-sm p-6 border border-gray-700/50"
            >
                <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
                <div className="space-y-3">
                    {[
                        'New user registration: john.doe@email.com',
                        'Hotel "Grand Palace" updated room prices',
                        'Booking confirmed for Resort Paradise',
                        'Payment processed: $299.99'
                    ].map((activity, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                            className="flex items-center gap-3 p-3 rounded-lg bg-gray-700/30"
                        >
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                            <p className="text-gray-300">{activity}</p>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </motion.div>
    )
}
