import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useWallet } from '../hooks/useWallet'

function Navbar() {
  const { selectedAccount, formatAddress, disconnectWallet } = useWallet()
  const [copied, setCopied] = useState(false)

  const copyAddress = () => {
    if (selectedAccount?.address) {
      navigator.clipboard.writeText(selectedAccount.address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

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
        <div className="hidden md:flex items-center text-sm space-x-8">
          <Link to="/" className="text-gray-700 hover:text-primary transition-colors ">
            Home
          </Link>
          <Link to="/find-ride" className="text-gray-700 hover:text-primary transition-colors">
            Find a Ride
          </Link>
          <Link to="/offer-ride" className="text-gray-700 hover:text-primary transition-colors">
            Offer a Ride
          </Link>
          
          {selectedAccount ? (
            <div className="flex items-center space-x-3">
              <div className="bg-primary/10 px-4 py-2 rounded-full">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">
                    {formatAddress(selectedAccount.address)}
                  </span>
                  <button
                    onClick={copyAddress}
                    className="text-gray-500 hover:text-primary transition-colors"
                    title={copied ? "Copied!" : "Copy address"}
                  >
                    {copied ? (
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
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
                <div className="flex items-center space-x-1">
                  <span className="text-xs font-medium text-gray-700">
                    {formatAddress(selectedAccount.address)}
                  </span>
                  <button
                    onClick={copyAddress}
                    className="text-gray-500 hover:text-primary transition-colors"
                    title={copied ? "Copied!" : "Copy address"}
                  >
                    {copied ? (
                      <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                </div>
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