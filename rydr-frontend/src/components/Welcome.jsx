import React from 'react'
import { Link } from 'react-router-dom'

function Welcome() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="py-12 md:py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Right - Hero Image - Hidden on mobile */}
            <div className="relative hidden lg:block">
              <div className="bg-gradient-to-br from-primary to-pink-600 rounded-2xl p-2 shadow-xl">
                <div className="bg-white rounded-xl p-3 text-center">
                  <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-24 h-24 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m6.75 4.5v-3.375a1.125 1.125 0 011.125-1.125h2.25a1.125 1.125 0 011.125 1.125v3.375m-6 0h4.5m0-4.5h2.25a1.125 1.125 0 011.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125s-1.125.504-1.125 1.125v1.5h-9V9.375c0-.621.504-1.125 1.125-1.125s1.125.504 1.125 1.125v1.5" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-black mb-2">Smart Ride Matching</h3>
                  <p className="text-gray-600">AI-powered matching system for the perfect ride experience</p>
                </div>
              </div>
            </div>
            {/* Left - Hero Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-7xl font-bold text-black leading-tight">
                  Your Ride, 
                  <span className="text-primary"> Your Rules</span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Peer-to-peer ride-sharing platform powered by Polkadot.
                </p>
              </div>
              
              <div className="flex flex-row gap-3 md:gap-4">
                <Link to="/find-ride" className="flex-1 bg-primary text-white px-4 md:px-8 py-3 md:py-4 rounded-lg text-sm md:text-lg font-semibold hover:bg-opacity-90 transition-colors text-center">
                  Find a Ride
                </Link>
                <Link to="/offer-ride" className="flex-1 border-2 border-primary text-primary px-4 md:px-8 py-3 md:py-4 rounded-lg text-sm md:text-lg font-semibold hover:bg-primary hover:text-white transition-colors text-center">
                  Offer a Ride
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Content Section */}
      <section className="py-12 md:py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 md:mb-16">
            <h2 className="text-2xl md:text-4xl font-bold text-black mb-2 md:mb-4">How It Works</h2>
            <p className="text-sm md:text-xl text-gray-600">Experience the future of ride sharing with blockchain security</p>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-3 gap-3 md:gap-8">
            <div className="bg-white p-3 md:p-8 rounded-xl shadow-sm text-center">
              <div className="w-8 h-8 md:w-16 md:h-16 bg-primary bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-4">
                <svg className="w-4 h-4 md:w-8 md:h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                </svg>
              </div>
              <h3 className="text-xs md:text-xl text-black mb-1 md:mb-2">Post Your Trip</h3>
            </div>

            <div className="bg-white p-3 md:p-8 rounded-xl shadow-sm text-center">
              <div className="w-8 h-8 md:w-16 md:h-16 bg-primary bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-4">
                <svg className="w-4 h-4 md:w-8 md:h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xs md:text-xl text-black mb-1 md:mb-2">Escrow Locks Tokens</h3>
            </div>

            <div className="bg-white p-3 md:p-8 rounded-xl shadow-sm text-center">
              <div className="w-8 h-8 md:w-16 md:h-16 bg-primary bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-4">
                <svg className="w-4 h-4 md:w-8 md:h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <h3 className="text-xs md:text-xl text-black mb-1 md:mb-2">Complete and Rate</h3>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Welcome