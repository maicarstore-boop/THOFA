'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Head from 'next/head';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [donationAmount, setDonationAmount] = useState('');
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  const [lightboxImage, setLightboxImage] = useState(null);
  const [copiedField, setCopiedField] = useState('');

  useEffect(() => {
    if (params.id) {
      fetchProject();
    }
  }, [params.id]);

  const fetchProject = async () => {
    try {
      if (!params.id || params.id === 'undefined') {
        router.push('/projects');
        return;
      }

      const response = await fetch(`/api/projects/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setProject(data);
        document.title = `${data.title} - THOFA Charity`;
      } else {
        router.push('/projects');
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      router.push('/projects');
    } finally {
      setLoading(false);
    }
  };

  const handleDonation = (e) => {
    e.preventDefault();
    let amount = selectedAmount;
    if (selectedAmount === 'custom' && donationAmount) {
      amount = donationAmount;
    }
    if (!amount || amount <= 0) {
      alert('Please select or enter a valid donation amount.');
      return;
    }
    router.push(`/donate?project_id=${project.id}&amount=${amount}`);
  };

  const formatCurrency = (amount) => {
    return 'RWF ' + new Intl.NumberFormat().format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const openLightbox = (image) => {
    setLightboxImage(image);
  };

  const closeLightbox = () => {
    setLightboxImage(null);
  };

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(''), 2000);
    }).catch(() => {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedField(field);
      setTimeout(() => setCopiedField(''), 2000);
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-[#2c5f2d] border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <i className="fas fa-folder-open text-5xl text-gray-300 mb-4"></i>
          <h2 className="text-2xl font-bold text-gray-700">Project Not Found</h2>
          <p className="text-gray-500 mt-2">The project you're looking for doesn't exist.</p>
          <Link href="/projects" className="text-[#2c5f2d] hover:underline mt-4 inline-block">
            <i className="fas fa-arrow-left mr-2"></i> Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  const progress = Math.min(100, Math.round((project.raised_amount / project.goal_amount) * 100));

  return (
    <>
      {/* SEO Optimization */}
      <Head>
        <title>{project.title} - THOFA Charity</title>
        <meta name="description" content={project.description?.substring(0, 160) || 'Support this charity project and make a difference.'} />
        <meta name="keywords" content={`${project.title}, charity, donation, THOFA, Africa, ${project.project_type}, ${project.location}`} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://thofa-charity.vercel.app/projects/${project.id}`} />
        <meta property="og:title" content={`${project.title} - THOFA Charity`} />
        <meta property="og:description" content={project.description?.substring(0, 160) || 'Support this charity project and make a difference.'} />
        <meta property="og:image" content={project.featured_image || 'https://thofa-charity.vercel.app/images/og-image.jpg'} />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${project.title} - THOFA Charity`} />
        <meta name="twitter:description" content={project.description?.substring(0, 160) || 'Support this charity project and make a difference.'} />
        <meta name="twitter:image" content={project.featured_image || 'https://thofa-charity.vercel.app/images/og-image.jpg'} />
        
        {/* Additional SEO */}
        <link rel="canonical" href={`https://thofa-charity.vercel.app/projects/${project.id}`} />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="THOFA Charity" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        
        {/* Structured Data / JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "THOFA Charity",
              "url": "https://thofa-charity.vercel.app",
              "logo": "https://thofa-charity.vercel.app/images/logo.png",
              "description": "Tumuri Hafi Organization For Africa - Bringing Hope Closer to Africa",
              "sameAs": [
                "https://www.facebook.com/thofa",
                "https://twitter.com/thofa",
                "https://www.instagram.com/thofa"
              ]
            })
          }}
        />
        
        {/* Project Specific Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Project",
              "name": project.title,
              "description": project.description,
              "url": `https://thofa-charity.vercel.app/projects/${project.id}`,
              "location": {
                "@type": "Place",
                "name": project.location || "Rwanda"
              },
              "startDate": project.start_date,
              "endDate": project.end_date,
              "funding": {
                "@type": "MonetaryAmount",
                "currency": "RWF",
                "value": {
                  "@type": "QuantitativeValue",
                  "value": project.goal_amount
                }
              }
            })
          }}
        />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Lightbox Modal */}
        {lightboxImage && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4 cursor-pointer"
            onClick={closeLightbox}
          >
            <div className="relative max-w-4xl w-full">
              <button
                onClick={closeLightbox}
                className="absolute -top-12 right-0 text-white hover:text-gray-300 text-3xl"
              >
                <i className="fas fa-times"></i>
              </button>
              <img
                src={lightboxImage}
                alt="Gallery image"
                className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
              />
            </div>
          </div>
        )}

        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-[#2c5f2d]">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/projects" className="hover:text-[#2c5f2d]">Projects</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-700">{project.title}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Project Details */}
            <div className="lg:col-span-2">
              {/* Page Title - Dynamic Project Name */}
              <h1 className="text-3xl md:text-4xl font-bold text-[#2c5f2d] mb-4">
                {project.title}
              </h1>
              
              {/* Featured Image */}
              <div className="bg-gray-200 rounded-xl overflow-hidden mb-6">
                {project.featured_image ? (
                  <img 
                    src={project.featured_image} 
                    alt={project.title} 
                    className="w-full h-96 object-cover"
                  />
                ) : (
                  <div className="w-full h-96 flex items-center justify-center text-gray-400">
                    <i className="fas fa-image text-6xl"></i>
                  </div>
                )}
              </div>

              {/* Project Info */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <span className="text-sm text-gray-500">
                  <i className="fas fa-map-marker-alt mr-1"></i> {project.location || 'Rwanda'}
                </span>
                <span className="text-sm text-gray-500">
                  <i className="fas fa-calendar mr-1"></i> Started: {formatDate(project.created_at)}
                </span>
                {project.end_date && (
                  <span className="text-sm text-gray-500">
                    <i className="fas fa-calendar-check mr-1"></i> Ends: {formatDate(project.end_date)}
                  </span>
                )}
              </div>

              {/* Project Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-lg p-4 text-center shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-2xl font-bold text-[#2c5f2d]">{progress}%</div>
                  <div className="text-sm text-gray-600">Funded</div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-2xl font-bold text-[#2c5f2d]">{formatCurrency(project.raised_amount)}</div>
                  <div className="text-sm text-gray-600">Raised of {formatCurrency(project.goal_amount)}</div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-2xl font-bold text-[#2c5f2d]">{project.beneficiaries?.toLocaleString() || 0}</div>
                  <div className="text-sm text-gray-600">Beneficiaries</div>
                </div>
              </div>

              {/* Tabs */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="border-b border-gray-200">
                  <nav className="flex -mb-px overflow-x-auto">
                    <button
                      onClick={() => setActiveTab('details')}
                      className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                        activeTab === 'details'
                          ? 'border-[#2c5f2d] text-[#2c5f2d]'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <i className="fas fa-info-circle mr-2"></i> Details
                    </button>
                    <button
                      onClick={() => setActiveTab('gallery')}
                      className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                        activeTab === 'gallery'
                          ? 'border-[#2c5f2d] text-[#2c5f2d]'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <i className="fas fa-images mr-2"></i> Gallery
                      {project.images && project.images.length > 0 && (
                        <span className="ml-1 text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                          {project.images.length}
                        </span>
                      )}
                    </button>
                    {(project.account_holder_name || project.account_number || project.mobile_money_number || project.paypal_email) && (
                      <button
                        onClick={() => setActiveTab('donate-info')}
                        className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                          activeTab === 'donate-info'
                            ? 'border-[#2c5f2d] text-[#2c5f2d]'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <i className="fas fa-university mr-2"></i> Donation Info
                      </button>
                    )}
                  </nav>
                </div>

                <div className="p-6">
                  {/* Details Tab */}
                  {activeTab === 'details' && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-3">About This Project</h3>
                      <div className="prose max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {project.description}
                      </div>

                      {/* Project Coordinator */}
                      {(project.owner_name || project.owner_contact) && (
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-semibold text-gray-700 mb-2">
                            <i className="fas fa-user mr-2"></i> Project Coordinator
                          </h4>
                          {project.owner_name && <p className="text-sm text-gray-600">{project.owner_name}</p>}
                          {project.owner_contact && <p className="text-sm text-gray-600">📞 {project.owner_contact}</p>}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Gallery Tab */}
                  {activeTab === 'gallery' && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-3">Project Gallery</h3>
                      {project.images && project.images.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {project.images.map((img, index) => (
                            <div 
                              key={index} 
                              className="relative overflow-hidden rounded-lg aspect-square cursor-pointer group"
                              onClick={() => openLightbox(img.image_path)}
                            >
                              <img
                                src={img.image_path}
                                alt={`${project.title} image ${index + 1}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                                <i className="fas fa-search-plus text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity"></i>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">No gallery images available.</p>
                      )}
                    </div>
                  )}

                  {/* Donation Info Tab - With Copy Buttons */}
                  {activeTab === 'donate-info' && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-bold text-gray-800">
                          <i className="fas fa-university mr-2"></i> Donation Information
                        </h3>
                        <button
                          onClick={() => {
                            let text = '=== Donation Information ===\n\n';
                            if (project.account_holder_name) text += `Account Holder: ${project.account_holder_name}\n`;
                            if (project.account_number) text += `Account Number: ${project.account_number}\n`;
                            if (project.bank_name) text += `Bank: ${project.bank_name}\n`;
                            if (project.mobile_money_number) text += `Mobile Money: ${project.mobile_money_number}\n`;
                            if (project.paypal_email) text += `PayPal: ${project.paypal_email}\n`;
                            text += `\nProject: ${project.title}`;
                            copyToClipboard(text, 'all');
                          }}
                          className="text-sm text-[#2c5f2d] hover:text-[#1a3a1a] transition-colors"
                        >
                          <i className="fas fa-copy mr-1"></i> Copy All
                        </button>
                      </div>
                      <div className="space-y-4">
                        {project.account_holder_name && (
                          <div className="p-3 bg-gray-50 rounded-lg flex justify-between items-center group">
                            <div>
                              <p className="text-sm text-gray-500">Account Holder</p>
                              <p className="font-semibold">{project.account_holder_name}</p>
                            </div>
                            <button
                              onClick={() => copyToClipboard(project.account_holder_name, 'holder')}
                              className="text-gray-400 hover:text-[#2c5f2d] transition-colors"
                              title="Copy"
                            >
                              {copiedField === 'holder' ? (
                                <i className="fas fa-check text-green-500"></i>
                              ) : (
                                <i className="fas fa-copy"></i>
                              )}
                            </button>
                          </div>
                        )}
                        {project.account_number && (
                          <div className="p-3 bg-gray-50 rounded-lg flex justify-between items-center group">
                            <div>
                              <p className="text-sm text-gray-500">Account Number</p>
                              <p className="font-semibold font-mono">{project.account_number}</p>
                            </div>
                            <button
                              onClick={() => copyToClipboard(project.account_number, 'number')}
                              className="text-gray-400 hover:text-[#2c5f2d] transition-colors"
                              title="Copy"
                            >
                              {copiedField === 'number' ? (
                                <i className="fas fa-check text-green-500"></i>
                              ) : (
                                <i className="fas fa-copy"></i>
                              )}
                            </button>
                          </div>
                        )}
                        {project.bank_name && (
                          <div className="p-3 bg-gray-50 rounded-lg flex justify-between items-center group">
                            <div>
                              <p className="text-sm text-gray-500">Bank</p>
                              <p className="font-semibold">{project.bank_name}</p>
                            </div>
                            <button
                              onClick={() => copyToClipboard(project.bank_name, 'bank')}
                              className="text-gray-400 hover:text-[#2c5f2d] transition-colors"
                              title="Copy"
                            >
                              {copiedField === 'bank' ? (
                                <i className="fas fa-check text-green-500"></i>
                              ) : (
                                <i className="fas fa-copy"></i>
                              )}
                            </button>
                          </div>
                        )}
                        {project.mobile_money_number && (
                          <div className="p-3 bg-gray-50 rounded-lg flex justify-between items-center group">
                            <div>
                              <p className="text-sm text-gray-500">Mobile Money</p>
                              <p className="font-semibold">
                                {project.mobile_money_number}
                                {project.mobile_money_provider && ` (${project.mobile_money_provider})`}
                              </p>
                            </div>
                            <button
                              onClick={() => copyToClipboard(project.mobile_money_number, 'mobile')}
                              className="text-gray-400 hover:text-[#2c5f2d] transition-colors"
                              title="Copy"
                            >
                              {copiedField === 'mobile' ? (
                                <i className="fas fa-check text-green-500"></i>
                              ) : (
                                <i className="fas fa-copy"></i>
                              )}
                            </button>
                          </div>
                        )}
                        {/* PayPal Email - With Copy Button */}
                        {project.paypal_email && (
                          <div className="p-3 bg-gray-50 rounded-lg border-l-4 border-blue-500 flex justify-between items-center group">
                            <div>
                              <p className="text-sm text-gray-500 flex items-center gap-2">
                                <i className="fab fa-paypal text-blue-600"></i> PayPal
                              </p>
                              <p className="font-semibold text-blue-700">{project.paypal_email}</p>
                            </div>
                            <button
                              onClick={() => copyToClipboard(project.paypal_email, 'paypal')}
                              className="text-gray-400 hover:text-[#2c5f2d] transition-colors"
                              title="Copy"
                            >
                              {copiedField === 'paypal' ? (
                                <i className="fas fa-check text-green-500"></i>
                              ) : (
                                <i className="fas fa-copy"></i>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-4">
                        <i className="fas fa-info-circle mr-1"></i> 
                        Click the copy icon next to each field to copy the information.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Donation Form */}
            <div>
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-20">
                <h3 className="text-xl font-bold text-[#2c5f2d] mb-4">Support This Project</h3>
                
                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-[#2c5f2d] h-3 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 mt-1">
                    <span>{formatCurrency(project.raised_amount)} raised</span>
                    <span>Goal: {formatCurrency(project.goal_amount)}</span>
                  </div>
                </div>

                <form onSubmit={handleDonation}>
                  <label className="block font-semibold mb-2">Select Amount</label>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {[5000, 10000, 25000, 50000, 100000].map((amount) => (
                      <button
                        key={amount}
                        type="button"
                        className={`border-2 rounded-lg py-2 px-4 text-center transition-colors ${
                          selectedAmount === amount 
                            ? 'border-[#2c5f2d] bg-[#2c5f2d] text-white' 
                            : 'border-gray-300 hover:border-[#2c5f2d]'
                        }`}
                        onClick={() => {
                          setSelectedAmount(amount);
                          setDonationAmount('');
                        }}
                      >
                        {formatCurrency(amount)}
                      </button>
                    ))}
                    <button
                      type="button"
                      className={`border-2 rounded-lg py-2 px-4 text-center transition-colors ${
                        selectedAmount === 'custom' 
                          ? 'border-[#2c5f2d] bg-[#2c5f2d] text-white' 
                          : 'border-gray-300 hover:border-[#2c5f2d]'
                      }`}
                      onClick={() => {
                        setSelectedAmount('custom');
                        setDonationAmount('');
                      }}
                    >
                      Custom
                    </button>
                  </div>

                  {selectedAmount === 'custom' && (
                    <input
                      type="number"
                      placeholder="Enter amount in RWF"
                      value={donationAmount}
                      onChange={(e) => setDonationAmount(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-[#2c5f2d]"
                    />
                  )}

                  <button
                    type="submit"
                    className="w-full bg-[#ff6b35] text-white py-3 rounded-lg font-bold text-lg hover:bg-[#e55a2b] transition-colors"
                  >
                    <i className="fas fa-heart mr-2"></i> Donate Now
                  </button>
                </form>

                {/* Share Section */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-500 mb-2">Share this project:</p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')}
                      className="w-10 h-10 rounded-full bg-[#1877f2] text-white flex items-center justify-center hover:opacity-80 transition-opacity"
                    >
                      <i className="fab fa-facebook-f"></i>
                    </button>
                    <button 
                      onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(project.title)}&url=${encodeURIComponent(window.location.href)}`, '_blank')}
                      className="w-10 h-10 rounded-full bg-[#1da1f2] text-white flex items-center justify-center hover:opacity-80 transition-opacity"
                    >
                      <i className="fab fa-twitter"></i>
                    </button>
                    <button 
                      onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(project.title + ' - ' + window.location.href)}`, '_blank')}
                      className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center hover:opacity-80 transition-opacity"
                    >
                      <i className="fab fa-whatsapp"></i>
                    </button>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        alert('Link copied to clipboard!');
                      }}
                      className="w-10 h-10 rounded-full bg-gray-600 text-white flex items-center justify-center hover:opacity-80 transition-opacity"
                    >
                      <i className="fas fa-link"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}