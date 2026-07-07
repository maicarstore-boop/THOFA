import Link from 'next/link';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-[#1a3a1a] text-white py-8 mt-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">THOFA</h3>
            <p className="text-gray-300">Bringing Hope Closer to Africa</p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="text-gray-300 hover:text-white">Home</Link></li>
              <li><Link href="/projects" className="text-gray-300 hover:text-white">Projects</Link></li>
              <li><Link href="/volunteer" className="text-gray-300 hover:text-white">Volunteer</Link></li>
              <li><Link href="/news" className="text-gray-300 hover:text-white">News</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Contact</h3>
            <ul className="space-y-2 text-gray-300">
              <li><i className="fas fa-phone mr-2"></i> {process.env.NEXT_PUBLIC_ORG_PHONE1 || '+250788499920'}</li>
              <li><i className="fas fa-envelope mr-2"></i> {process.env.NEXT_PUBLIC_ORG_EMAIL || 'info@thofa.org'}</li>
              <li><i className="fas fa-map-marker-alt mr-2"></i> {process.env.NEXT_PUBLIC_ORG_ADDRESS || 'Kigali, Rwanda'}</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-4 text-center text-gray-400">
          <p>&copy; {currentYear} {process.env.NEXT_PUBLIC_ORG_NAME || 'Tumuri Hafi Organization For Africa'}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;