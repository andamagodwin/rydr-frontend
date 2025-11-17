import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useWallet } from '../hooks/useWallet'
import { usePolkadotWallet } from '../hooks/usePolkadotWallet'

function Navbar() {
  const { selectedAccount: ethAccount, formatAddress: ethFormatAddress, disconnectWallet: disconnectEth } = useWallet()
  const { selectedAccount: polkadotAccount, formatAddress: polkadotFormatAddress, disconnectWallet: disconnectPolkadot, connectWallet: connectPolkadot, isConnecting } = usePolkadotWallet()
  
  const [copied, setCopied] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [walletMenuOpen, setWalletMenuOpen] = useState(false)
  const location = useLocation()

  // Check if any wallet is connected
  const isConnected = !!(ethAccount || polkadotAccount)
  const selectedAccount = polkadotAccount || ethAccount
  const walletType = polkadotAccount ? 'Polkadot' : ethAccount ? 'MetaMask' : null
  const formatAddress = polkadotAccount ? polkadotFormatAddress : ethFormatAddress

  const copyAddress = () => {
    const address = polkadotAccount?.ethAddress || ethAccount?.address
    if (address) {
      navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleDisconnect = () => {
    disconnectEth()
    disconnectPolkadot()
    setWalletMenuOpen(false)
  }

  const handleConnectPolkadot = async () => {
    try {
      await connectPolkadot()
      setWalletMenuOpen(false)
    } catch (err) {
      console.error('Failed to connect Polkadot wallet:', err)
    }
  }

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  const isActivePage = (path) => {
    return location.pathname === path
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center" onClick={closeMobileMenu}>
              <img src="/rydr-logo.png" alt="Rydr" className="h-8 w-auto" />
            </Link>
          </div>
        
        {/* Navigation Items */}
        <div className="hidden md:flex items-center text-sm space-x-8">
          <Link to="/" className="group relative w-max">
            <span className="text-gray-700 hover:text-primary transition-colors">Home</span>
            <span className="absolute -bottom-1 left-1/2 w-0 transition-all h-0.5 bg-primary group-hover:w-3/6"></span>
            <span className="absolute -bottom-1 right-1/2 w-0 transition-all h-0.5 bg-primary group-hover:w-3/6"></span>
          </Link>
          <Link to="/find-ride" className="group relative w-max">
            <span className="text-gray-700 hover:text-primary transition-colors">Find a Ride</span>
            <span className="absolute -bottom-1 left-1/2 w-0 transition-all h-0.5 bg-primary group-hover:w-3/6"></span>
            <span className="absolute -bottom-1 right-1/2 w-0 transition-all h-0.5 bg-primary group-hover:w-3/6"></span>
          </Link>
          <Link to="/offer-ride" className="group relative w-max">
            <span className="text-gray-700 hover:text-primary transition-colors">Offer a Ride</span>
            <span className="absolute -bottom-1 left-1/2 w-0 transition-all h-0.5 bg-primary group-hover:w-3/6"></span>
            <span className="absolute -bottom-1 right-1/2 w-0 transition-all h-0.5 bg-primary group-hover:w-3/6"></span>
          </Link>
          <Link to="/my-rides" className="group relative w-max">
            <span className="text-gray-700 hover:text-primary transition-colors">My Rides</span>
            <span className="absolute -bottom-1 left-1/2 w-0 transition-all h-0.5 bg-primary group-hover:w-3/6"></span>
            <span className="absolute -bottom-1 right-1/2 w-0 transition-all h-0.5 bg-primary group-hover:w-3/6"></span>
          </Link>
          
          {selectedAccount ? (
            <div className="flex items-center space-x-3">
              <div className="bg-primary/10 px-4 py-2 rounded-full">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">
                    {formatAddress(polkadotAccount?.ethAddress || ethAccount?.address)}
                  </span>
                  {walletType && (
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                      walletType === 'Polkadot' ? 'bg-pink-100 text-pink-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {walletType}
                    </span>
                  )}
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
                onClick={handleDisconnect}
                className="text-red-500 hover:text-red-700 transition-colors font-medium text-sm"
                title="Disconnect Wallet"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={() => setWalletMenuOpen(!walletMenuOpen)}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-primary to-pink-600 text-white rounded-lg hover:shadow-lg transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Connect Wallet
              </button>

              {walletMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                  <button
                    onClick={handleConnectPolkadot}
                    disabled={isConnecting}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors disabled:opacity-50"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-lg">◉</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">Polkadot Wallet</div>
                      <div className="text-xs text-gray-500">SubWallet, Talisman, Polkadot.js</div>
                    </div>
                  </button>

                  <div className="border-t border-gray-200 my-2"></div>

                  <Link
                    to="/connect-wallet"
                    onClick={() => setWalletMenuOpen(false)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-yellow-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-lg">M</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">MetaMask</div>
                      <div className="text-xs text-gray-500">Ethereum wallet for EVM transactions</div>
                    </div>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center space-x-3">
          {/* Mobile wallet indicator */}
          {selectedAccount ? (
            <div className="bg-primary/10 px-2 py-1 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-xs font-medium text-gray-700">
                  {formatAddress(polkadotAccount?.ethAddress || ethAccount?.address)}
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
                <button
                  onClick={handleDisconnect}
                  className="text-red-500 hover:text-red-700 transition-colors"
                  title="Disconnect Wallet"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => setWalletMenuOpen(!walletMenuOpen)}
              className="bg-primary text-white px-2 py-1 rounded text-xs font-medium"
            >
              Connect
            </button>
          )}
          
          {/* Hamburger Button */}
          <button
            onClick={toggleMobileMenu}
            className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary hover:bg-gray-100 transition-colors"
            aria-expanded="false"
          >
            <span className="sr-only">Open main menu</span>
            <div className="w-6 h-6 flex flex-col justify-center items-center">
              <span className={`bg-current block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${mobileMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-0.5'}`}></span>
              <span className={`bg-current block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm my-0.5 ${mobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
              <span className={`bg-current block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${mobileMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-0.5'}`}></span>
            </div>
          </button>
        </div>
      </div>
    </nav>

    {/* Mobile Menu Overlay */}
    <div className={`fixed inset-0 z-40 md:hidden transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={closeMobileMenu}></div>
      
      {/* Mobile Menu Panel */}
      <div className={`fixed top-0 right-0 h-auto w-64 max-w-sm bg-white/90 backdrop-blur-md shadow-xl transform transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <img src="/rydr-logo.png" alt="Rydr" className="h-8 w-auto" />
            <button
              onClick={closeMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Mobile Menu Items */}
          <div className="px-4 py-6 space-y-4">
            <Link
              to="/"
              onClick={closeMobileMenu}
              className={`flex items-center space-x-3 px-4 py-3 transition-colors ${isActivePage('/') ? 'text-primary' : 'text-gray-700 hover:text-primary'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="group relative w-max font-medium">
                Home
                <span className={`absolute -bottom-1 left-1/2 transition-all h-0.5 bg-primary ${isActivePage('/') ? 'w-3/6' : 'w-0 group-hover:w-3/6'}`}></span>
                <span className={`absolute -bottom-1 right-1/2 transition-all h-0.5 bg-primary ${isActivePage('/') ? 'w-3/6' : 'w-0 group-hover:w-3/6'}`}></span>
              </span>
            </Link>
            
            <Link
              to="/find-ride"
              onClick={closeMobileMenu}
              className={`flex items-center space-x-3 px-4 py-3 transition-colors ${isActivePage('/find-ride') ? 'text-primary' : 'text-gray-700 hover:text-primary'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="group relative w-max font-medium">
                Find a Ride
                <span className={`absolute -bottom-1 left-1/2 transition-all h-0.5 bg-primary ${isActivePage('/find-ride') ? 'w-3/6' : 'w-0 group-hover:w-3/6'}`}></span>
                <span className={`absolute -bottom-1 right-1/2 transition-all h-0.5 bg-primary ${isActivePage('/find-ride') ? 'w-3/6' : 'w-0 group-hover:w-3/6'}`}></span>
              </span>
            </Link>
            
            <Link
              to="/offer-ride"
              onClick={closeMobileMenu}
              className={`flex items-center space-x-3 px-4 py-3 transition-colors ${isActivePage('/offer-ride') ? 'text-primary' : 'text-gray-700 hover:text-primary'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="group relative w-max font-medium">
                Offer a Ride
                <span className={`absolute -bottom-1 left-1/2 transition-all h-0.5 bg-primary ${isActivePage('/offer-ride') ? 'w-3/6' : 'w-0 group-hover:w-3/6'}`}></span>
                <span className={`absolute -bottom-1 right-1/2 transition-all h-0.5 bg-primary ${isActivePage('/offer-ride') ? 'w-3/6' : 'w-0 group-hover:w-3/6'}`}></span>
              </span>
            </Link>

            <Link
              to="/my-rides"
              onClick={closeMobileMenu}
              className={`flex items-center space-x-3 px-4 py-3 transition-colors ${isActivePage('/my-rides') ? 'text-primary' : 'text-gray-700 hover:text-primary'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="group relative w-max font-medium">
                My Rides
                <span className={`absolute -bottom-1 left-1/2 transition-all h-0.5 bg-primary ${isActivePage('/my-rides') ? 'w-3/6' : 'w-0 group-hover:w-3/6'}`}></span>
                <span className={`absolute -bottom-1 right-1/2 transition-all h-0.5 bg-primary ${isActivePage('/my-rides') ? 'w-3/6' : 'w-0 group-hover:w-3/6'}`}></span>
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  </>
  )
}

export default Navbar