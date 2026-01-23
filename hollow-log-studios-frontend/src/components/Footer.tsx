import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">About the Artist</h3>
            <p className="text-slate-300">
              Passionate artist creating unique paintings and illustrations that capture
              the beauty of nature and imagination. Offering commissioned artwork and
              published books for art enthusiasts.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-slate-300 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="text-slate-300 hover:text-white transition-colors">
                  Gallery
                </Link>
              </li>
              <li>
                <Link to="/commissions" className="text-slate-300 hover:text-white transition-colors">
                  Commissions
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-slate-300 hover:text-white transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/account" className="text-slate-300 hover:text-white transition-colors">
                  Account
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="text-slate-300 hover:text-white transition-colors font-semibold">
                  Admin Portal
                </Link>
              </li>

            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-slate-300">
              <li>Email: bethany@hollowlogstudios.com</li>
              <li>
                Instagram: 
                <a 
                  href="https://instagram.com/hollowlogstudios" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  @hollowlogstudios
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-700 mt-8 pt-8 text-center text-slate-400">
          <p className="mb-2">© {currentYear} Hollow Log Studios. All rights reserved.</p>
          <p className="text-sm">
            Designed and developed by{' '}
            <a 
              href="https://bartdev.org" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-slate-300 hover:text-white transition-colors"
            >
              Bartholomew Development
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
