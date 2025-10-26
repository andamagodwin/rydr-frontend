import React from 'react'
import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <img src="/rydr-logo.png" alt="Rydr" className="h-8 w-auto" />
          </Link>
        </div>
        
        {/* Navigation Items */}
        <div className="hidden md:flex items-center space-x-8">
          <Link to="/" className="text-gray-700 hover:text-primary transition-colors font-medium">
            Home
          </Link>
          <Link to="/find-ride" className="text-gray-700 hover:text-primary transition-colors font-medium">
            Find a Ride
          </Link>
          <Link to="/offer-ride" className="text-gray-700 hover:text-primary transition-colors font-medium">
            Offer a Ride
          </Link>
          <Link to="/connect-wallet" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition-colors font-medium">
            Connect Wallet
          </Link>
        </div>

        {/* Mobile Connect Wallet Button */}
        <div className="md:hidden">
          <Link to="/connect-wallet" className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors font-medium text-sm">
            Connect Wallet
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar