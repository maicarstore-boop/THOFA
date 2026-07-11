'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ActivitiesPage() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({
    donations: 0,
    projects: 0,
    volunteers: 0,
    news: 0
  });

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      // Fetch all types of activities
      const [donationsRes, projectsRes, volunteersRes, blogRes] = await Promise.all([
        fetch('/api/donations?limit=10'),
        fetch('/api/projects?status=active&limit=10'),
        fetch('/api/volunteers?status=approved&limit=10'),
        fetch('/api/blog?limit=10')
      ]);

      const donations = await donationsRes.json();
      const projects = await projectsRes.json();
      const volunteers = await volunteersRes.json();
      const blogPosts = await blogRes.json();

      // Combine and format all activities
      const allActivities = [];

      // Add donations
      const donationActivities = donations.map(d => ({
        type: 'donation',
        id: d.id,
        title: `${d.donor_name} made a donation`,
        description: `${d.donor_name} donated ${formatCurrency(d.amount)}${d.project_title ? ` to ${d.project_title}` : ''}`,
        date: d.created_at,
        icon: 'fa-hand-holding-heart',
        iconColor: 'text-green-600',
        bgColor: 'bg-green-100',
        amount: d.amount,
        donor: d.donor_name
      }));
      allActivities.push(...donationActivities);

      // Add projects
      const projectActivities = projects.map(p => {
        const progress = Math.round((p.raised_amount / p.goal_amount) * 100);
        return {
          type: 'project',
          id: p.id,
          title: `New Project: ${p.title}`,
          description: `${p.title} - ${progress}% funded (${formatCurrency(p.raised_amount)} raised of ${formatCurrency(p.goal_amount)})`,
          date: p.created_at,
          icon: 'fa-project-diagram',
          iconColor: 'text-blue-600',
          bgColor: 'bg-blue-100',
          link: `/projects/${p.id}`,
          progress: progress
        };
      });
      allActivities.push(...projectActivities);

      // Add volunteers
      const volunteerActivities = volunteers.map(v => ({
        type: 'volunteer',
        id: v.id,
        title: `${v.full_name} joined as a volunteer`,
        description: `${v.full_name} signed up to volunteer${v.skills ? ` with skills in ${v.skills}` : ''}`,
        date: v.created_at,
        icon: 'fa-user-plus',
        iconColor: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        name: v.full_name
      }));
      allActivities.push(...volunteerActivities);

      // Add blog posts
      const blogActivities = blogPosts.map(b => ({
        type: 'blog',
        id: b.id,
        title: b.title,
        description: b.excerpt || b.content?.substring(0, 150) + '...',
        date: b.created_at,
        icon: 'fa-newspaper',
        iconColor: 'text-purple-600',
        bgColor: 'bg-purple-100',
        link: `/news/${b.id}`,
        category: b.category
      }));
      allActivities.push(...blogActivities);

      // Sort by date (newest first)
      allActivities.sort((a, b) => new Date(b.date) - new Date(a.date));

      setActivities(allActivities);
      
      // Update stats
      setStats({
        donations: donationActivities.length,
        projects: projectActivities.length,
        volunteers: volunteerActivities.length,
        news: blogActivities.length
      });
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return 'RWF ' + new Intl.NumberFormat().format(amount);
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

  const getTypeLabel = (type) => {
    const labels = {
      donation: 'Donation',
      project: 'Project',
      volunteer: 'Volunteer',
      blog: 'News'
    };
    return labels[type] || type;
  };

  const getTypeColor = (type) => {
    const colors = {
      donation: 'text-green-700 bg-green-50 border-green-200',
      project: 'text-blue-700 bg-blue-50 border-blue-200',
      volunteer: 'text-yellow-700 bg-yellow-50 border-yellow-200',
      blog: 'text-purple-700 bg-purple-50 border-purple-200'
    };
    return colors[type] || 'text-gray-700 bg-gray-50 border-gray-200';
  };

  const getIconBgColor = (type) => {
    const colors = {
      donation: 'bg-green-100',
      project: 'bg-blue-100',
      volunteer: 'bg-yellow-100',
      blog: 'bg-purple-100'
    };
    return colors[type] || 'bg-gray-100';
  };

  const getIconColor = (type) => {
    const colors = {
      donation: 'text-green-600',
      project: 'text-blue-600',
      volunteer: 'text-yellow-600',
      blog: 'text-purple-600'
    };
    return colors[type] || 'text-gray-600';
  };

  const getActivityIcon = (type) => {
    const icons = {
      donation: 'fa-hand-holding-heart',
      project: 'fa-project-diagram',
      volunteer: 'fa-user-plus',
      blog: 'fa-newspaper'
    };
    return icons[type] || 'fa-circle';
  };

  const filteredActivities = filter === 'all' 
    ? activities 
    : activities.filter(a => a.type === filter);

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
      {/* Hero Section */}
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
        {/* Activity Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl shadow-md p-3 sm:p-4 text-center hover:shadow-lg transition-shadow">
            <div className="text-lg sm:text-2xl font-bold text-[#2c5f2d]">{stats.donations}</div>
            <p className="text-xs sm:text-sm text-gray-600">
              <i className="fas fa-hand-holding-heart text-green-600 mr-1"></i> Donations
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-3 sm:p-4 text-center hover:shadow-lg transition-shadow">
            <div className="text-lg sm:text-2xl font-bold text-[#2c5f2d]">{stats.projects}</div>
            <p className="text-xs sm:text-sm text-gray-600">
              <i className="fas fa-project-diagram text-blue-600 mr-1"></i> Projects
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-3 sm:p-4 text-center hover:shadow-lg transition-shadow">
            <div className="text-lg sm:text-2xl font-bold text-[#2c5f2d]">{stats.volunteers}</div>
            <p className="text-xs sm:text-sm text-gray-600">
              <i className="fas fa-user-plus text-yellow-600 mr-1"></i> Volunteers
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-3 sm:p-4 text-center hover:shadow-lg transition-shadow">
            <div className="text-lg sm:text-2xl font-bold text-[#2c5f2d]">{stats.news}</div>
            <p className="text-xs sm:text-sm text-gray-600">
              <i className="fas fa-newspaper text-purple-600 mr-1"></i> News
            </p>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="bg-white rounded-xl shadow-md p-3 sm:p-4 mb-6">
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-medium transition-colors text-xs sm:text-sm ${
                filter === 'all'
                  ? 'bg-[#2c5f2d] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <i className="fas fa-th-list mr-1"></i> All
            </button>
            <button
              onClick={() => setFilter('donation')}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-medium transition-colors text-xs sm:text-sm ${
                filter === 'donation'
                  ? 'bg-[#2c5f2d] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <i className="fas fa-hand-holding-heart mr-1"></i> Donations
            </button>
            <button
              onClick={() => setFilter('project')}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-medium transition-colors text-xs sm:text-sm ${
                filter === 'project'
                  ? 'bg-[#2c5f2d] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <i className="fas fa-project-diagram mr-1"></i> Projects
            </button>
            <button
              onClick={() => setFilter('volunteer')}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-medium transition-colors text-xs sm:text-sm ${
                filter === 'volunteer'
                  ? 'bg-[#2c5f2d] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <i className="fas fa-user-plus mr-1"></i> Volunteers
            </button>
            <button
              onClick={() => setFilter('blog')}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-medium transition-colors text-xs sm:text-sm ${
                filter === 'blog'
                  ? 'bg-[#2c5f2d] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <i className="fas fa-newspaper mr-1"></i> News
            </button>
          </div>
        </div>

        {/* Activities Timeline */}
        {filteredActivities.length === 0 ? (
          <div className="text-center py-12 sm:py-16 bg-white rounded-xl shadow-md px-4">
            <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">📭</div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-700 mb-2">No activities found</h3>
            <p className="text-sm sm:text-base text-gray-500">Try selecting a different filter or check back later.</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#2c5f2d] to-[#ff6b35] transform -translate-x-1/2"></div>

            {/* Timeline items */}
            <div className="space-y-6">
              {filteredActivities.map((activity, index) => (
                <div key={`${activity.type}-${activity.id}-${index}`} className="relative">
                  <div className={`flex flex-col md:flex-row items-start md:items-center gap-4 ${
                    index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}>
                    {/* Timeline dot */}
                    <div className={`absolute left-4 md:left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full border-2 ${getIconBgColor(activity.type)} border-[#2c5f2d] z-10`}>
                      <div className="absolute inset-0 rounded-full animate-ping bg-[#2c5f2d] opacity-25"></div>
                    </div>

                    {/* Content */}
                    <div className={`w-full md:w-5/12 ${index % 2 === 0 ? 'md:pr-8' : 'md:pl-8'} pl-12 md:pl-0`}>
                      <div className="bg-white rounded-xl shadow-md p-4 md:p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${getIconBgColor(activity.type)} flex items-center justify-center flex-shrink-0`}>
                            <i className={`fas ${getActivityIcon(activity.type)} ${getIconColor(activity.type)} text-sm sm:text-base`}></i>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className={`text-xs font-medium px-2 py-1 rounded-full ${getTypeColor(activity.type)}`}>
                                {getTypeLabel(activity.type)}
                              </span>
                              <span className="text-xs text-gray-500">
                                <i className="far fa-clock mr-1"></i>
                                {formatDate(activity.date)}
                              </span>
                            </div>
                            <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-800">
                              {activity.link ? (
                                <Link href={activity.link} className="hover:text-[#2c5f2d] transition-colors">
                                  {activity.title}
                                </Link>
                              ) : (
                                activity.title
                              )}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-600 mt-1">
                              {activity.description}
                            </p>
                            {activity.type === 'donation' && activity.amount && (
                              <div className="mt-2 inline-block bg-green-50 text-green-700 text-xs font-bold px-2 py-1 rounded-full">
                                {formatCurrency(activity.amount)}
                              </div>
                            )}
                            {activity.type === 'project' && activity.progress !== undefined && (
                              <div className="mt-2 flex items-center gap-2">
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-[#2c5f2d] h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${activity.progress}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs text-gray-600">{activity.progress}%</span>
                              </div>
                            )}
                            {activity.link && (
                              <Link 
                                href={activity.link} 
                                className="inline-block mt-2 text-xs sm:text-sm text-[#2c5f2d] font-medium hover:underline"
                              >
                                Learn More <i className="fas fa-arrow-right ml-1"></i>
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Subscribe to Updates */}
        <div className="mt-8 sm:mt-12 bg-gradient-to-r from-[#2c5f2d] to-[#1a3a1a] rounded-xl p-6 sm:p-8 text-white text-center">
          <h3 className="text-xl sm:text-2xl font-bold mb-2">Stay Updated</h3>
          <p className="opacity-90 text-sm sm:text-base mb-4">Subscribe to get notified about new activities and updates</p>
          <form className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#ff6b35] text-sm sm:text-base"
            />
            <button className="bg-[#ff6b35] hover:bg-[#e55a2b] px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors whitespace-nowrap text-sm sm:text-base">
              <i className="fas fa-paper-plane mr-2"></i> Subscribe
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}