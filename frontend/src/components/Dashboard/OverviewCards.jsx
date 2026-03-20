import React from 'react'
import { useSelector } from 'react-redux'
import { UsersIcon, BookOpenIcon, CurrencyDollarIcon, ServerIcon } from '@heroicons/react/24/outline'

const OverviewCards = () => {
  const { stats } = useSelector((state) => state.dashboard)

  const cards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: UsersIcon,
      color: 'bg-blue-500'
    },
    {
      title: 'Total Classes',
      value: stats.totalClasses,
      icon: BookOpenIcon,
      color: 'bg-green-500'
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue}`,
      icon: CurrencyDollarIcon,
      color: 'bg-yellow-500'
    },
    {
      title: 'System Health',
      value: stats.systemHealth,
      icon: ServerIcon,
      color: stats.systemHealth === 'Good' ? 'bg-green-500' : 'bg-red-500'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => (
        <div key={index} className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className={`p-3 rounded-full ${card.color} text-white mr-4`}>
              <card.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default OverviewCards