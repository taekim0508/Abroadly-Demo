// Contributors:
// Cursor AI Assistant - Footer component

import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <img 
                src="/logo_just_globe.png" 
                alt="Abroadly Globe" 
                className="h-10 w-10"
              />
              <span className="text-2xl font-bold logo-text">Abroadly</span>
            </Link>
            <p className="text-gray-400 text-sm">
              Peer-verified study abroad experiences. Discover programs, explore places, and plan trips with authentic student reviews.
            </p>
          </div>

          {/* Navigation */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Explore</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/programs" className="text-gray-400 hover:text-white transition">
                  Programs
                </Link>
              </li>
              <li>
                <Link to="/places" className="text-gray-400 hover:text-white transition">
                  Places
                </Link>
              </li>
              <li>
                <Link to="/trips" className="text-gray-400 hover:text-white transition">
                  Trips
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Account</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/auth" className="text-gray-400 hover:text-white transition">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-gray-400 hover:text-white transition">
                  Profile
                </Link>
              </li>
              <li>
                <Link to="/bookmarks" className="text-gray-400 hover:text-white transition">
                  Bookmarks
                </Link>
              </li>
              <li>
                <Link to="/messages" className="text-gray-400 hover:text-white transition">
                  Messages
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © {currentYear} Abroadly. All rights reserved.
          </p>
          <p className="text-gray-500 text-sm mt-2 sm:mt-0">
            Made at Vanderbilt University
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

