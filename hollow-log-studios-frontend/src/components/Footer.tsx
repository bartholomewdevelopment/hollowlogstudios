import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#1a3320] text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">About the Artist</h3>
            <p className="text-green-200">
              Bethany brings diverse cultures and magical worlds to life through
              exquisite watercolor paintings, custom illustrations, and breathtaking
              murals. Commissions open — originals and prints available.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-green-200 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="text-green-200 hover:text-white transition-colors">
                  Shop
                </Link>
              </li>
              <li>
                <Link to="/commissions" className="text-green-200 hover:text-white transition-colors">
                  Commissions
                </Link>
              </li>
              <li>
                <Link to="/pebblewick" className="text-green-200 hover:text-white transition-colors">
                  Pebblewick
                </Link>
              </li>
              <li>
                <Link to="/cryptids" className="text-green-200 hover:text-white transition-colors">
                  Cryptids
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-green-200 hover:text-white transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/account" className="text-green-200 hover:text-white transition-colors">
                  Account
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-green-200">
              <li>
                <a
                  href="mailto:bethany@hollowlogstudios.com"
                  className="hover:text-white transition-colors"
                >
                  bethany@hollowlogstudios.com
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com/hollowlogstudios"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Instagram: @hollowlogstudios
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-green-800 mt-8 pt-8 text-center text-green-300">
          <p className="mb-2">© {currentYear} Hollow Log Studios. All rights reserved.</p>
          <p className="text-sm">
            Designed and developed by{' '}
            <a
              href="https://bartdev.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-200 hover:text-white transition-colors"
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
