import React from 'react';
import { Menu, User as UserIcon, LogOut } from 'lucide-react';
import { User } from '../services/api';

interface HeaderProps {
  user: User;
  onLogout: () => void;
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, onMenuClick }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 fixed w-full top-0 z-30">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side */}
          <div className="flex items-center">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              aria-label="Open sidebar"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <div className="flex items-center ml-4 lg:ml-0">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-primary-600">HarvestIQ</h1>
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <UserIcon className="h-5 w-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-700 hidden sm:block">
                  {user.name}
                </span>
                <span className="text-xs text-gray-500 hidden sm:block">
                  ({user.role})
                </span>
              </div>
              
              <button
                onClick={onLogout}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                aria-label="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;