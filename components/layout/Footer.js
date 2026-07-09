import Link from 'next/link';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-8 bg-[#102b12] text-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ff6b35]">
                <i className="fas fa-hands-helping"></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold">THOFA</h3>
                <p className="text-sm text-green-100">Bringing Hope Closer to Africa</p>
              </div>
            </div>
            <p className="max-w-sm text-sm leading-6 text-gray-300">
              We support education, healthcare, water access, and emergency relief programs that help communities thrive across Africa.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link href="/" className="transition hover:text-white">Home</Link></li>
              <li><Link href="/projects" className="transition hover:text-white">Projects</Link></li>
              <li><Link href="/volunteer" className="transition hover:text-white">Volunteer</Link></li>
              <li><Link href="/news" className="transition hover:text-white">News</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Contact</h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-start gap-2"><i className="fas fa-phone mt-1"></i><span>{process.env.NEXT_PUBLIC_ORG_PHONE1 || '+250784109571'}</span></li>
              <li className="flex items-start gap-2"><i className="fas fa-envelope mt-1"></i><span>{process.env.NEXT_PUBLIC_ORG_EMAIL || 'tumurihafingo@gmail.com'}</span></li>
              <li className="flex items-start gap-2"><i className="fas fa-map-marker-alt mt-1"></i><span>{process.env.NEXT_PUBLIC_ORG_ADDRESS || 'Kigali, Rwanda'}</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-4 text-center text-sm text-gray-400">
          <p>&copy; {currentYear} {process.env.NEXT_PUBLIC_ORG_NAME || 'Tumuri Hafi Organization For Africa'}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;