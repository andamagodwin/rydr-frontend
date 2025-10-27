import React from 'react'
import { Link } from 'react-router-dom'
import { useWallet } from '../hooks/useWallet'

function Navbar() {
  const { selectedAccount, formatAddress, disconnectWallet } = useWallet()

  return (
    <nav className="shadow-sm border-b border-gray-100 px-6 py-4">
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
          
          {selectedAccount ? (
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 px-4 py-2 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">
                    {formatAddress(selectedAccount.address)}
                  </span>
                </div>
              </div>
              <button
                onClick={disconnectWallet}
                className="text-red-500 hover:text-red-700 transition-colors font-medium text-sm"
                title="Disconnect Wallet"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <Link to="/connect-wallet" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition-colors font-medium">
              Connect Wallet
            </Link>
          )}
        </div>

        {/* Mobile Connect Wallet Button */}
        <div className="md:hidden">
          {selectedAccount ? (
            <div className="flex items-center space-x-2">
              <div className="bg-green-100 px-3 py-1.5 rounded-lg">
                <span className="text-xs font-medium text-gray-700">
                  {formatAddress(selectedAccount.address)}
                </span>
              </div>
              <button
                onClick={disconnectWallet}
                className="text-red-500 hover:text-red-700 transition-colors text-xs"
              >
                ✕
              </button>
            </div>
          ) : (
            <Link to="/connect-wallet" className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors font-medium text-sm">
              Connect Wallet
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar