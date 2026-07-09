'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ActivitiesPage() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setActivities([
        {
          id: 1,
          type: 'donation',
          title: 'John Doe donated',
          description: 'John Doe donated RWF 5,000 to Clean Water Project',
          date: new Date().toISOString(),
          icon: 'fa-hand-holding-heart',
          iconColor: 'text-green-600',
          bgColor: 'bg-green-100'
        },
        {
          id: 2,
          type: 'volunteer',
          title: 'Jane Smith joined as a volunteer',
          description: 'Jane Smith signed up to volunteer with skills in teaching',
          date: new Date().toISOString(),
          icon: 'fa-user-plus',
          iconColor: 'text-yellow-600',
          bgColor: 'bg-yellow-100'
        }
      ]);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-[#2c5f2d] border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium text-sm sm:text-base">Loading activities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Responsive */}
      <section className="bg-gradient-to-r from-[#2c5f2d] to-[#1a3a1a] text-white py-12 sm:py-16 md:py-20 text-center px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex justify-center mb-3 sm:mb-4">
            <div className="bg-[#ff6b35] p-2 sm:p-3 rounded-full">
              <i className="fas fa-clock text-xl sm:text-2xl"></i>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4">
            Recent Activities
          </h1>
          <p className="text-sm sm:text-base md:text-lg max-w-2xl mx-auto opacity-90 px-2">
            See the impact of your generosity - Latest donations, projects, and volunteer activities
          </p>
        </div>
      </section>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {activities.length === 0 ? (
          <div className="text-center py-12 sm:py-16 bg-white rounded-xl shadow-md px-4">
            <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">📭</div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-700 mb-2">No activities found</h3>
            <p className="text-sm sm:text-base text-gray-500">Check back later for updates.</p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4 max-w-3xl mx-auto">
            {activities.map((activity) => (
              <div key={activity.id} className="bg-white rounded-xl shadow-md p-3 sm:p-4 hover:shadow-lg transition-shadow">
                <div className="flex flex-col sm:flex-row items-start gap-2 sm:gap-3">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${activity.bgColor} flex items-center justify-center flex-shrink-0`}>
                    <i className={`fas ${activity.icon} ${activity.iconColor} text-sm sm:text-base`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 text-sm sm:text-base">{activity.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 break-words">{activity.description}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      <i className="far fa-clock mr-1"></i>
                      {formatDate(activity.date)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}