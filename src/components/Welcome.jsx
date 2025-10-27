import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Particles from './Particles'
import Lottie from 'lottie-react'

function Welcome() {
  const [carAnimation, setCarAnimation] = useState(null)

  useEffect(() => {
    fetch('/animations/car-driving-on-road.json')
      .then(response => response.json())
      .then(data => setCarAnimation(data))
      .catch(error => console.error('Error loading animation:', error))
  }, [])
  return (
    <div className="bg-white rounded-b-xl">
      {/* Hero Section */}
      <section className="py-12 md:py-20 px-6 relative overflow-hidden">
        {/* Particle Background */}
        <div className="absolute inset-0 w-full h-full pointer-events-none">
          <Particles
            particleColors={['#E6007A', '#ffffff']}
            particleCount={200}
            particleSpread={10}
            speed={0.1}
            particleBaseSize={100}
            moveParticlesOnHover={true}
            alphaParticles={false}
            disableRotation={false}
          />
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">{/* Right - Hero Image - Hidden on mobile */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Right - Hero Image - Hidden on mobile */}
            <div className="relative hidden lg:block">
              <img 
                src="/car-driving-pana.svg" 
                alt="Car Driving" 
                className="w-full h-auto"
              />
            </div>
            {/* Left - Hero Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-7xl font-bold text-black leading-tight">
                  Ride Together, 
                  <span className="text-primary"> Earn Together</span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Peer-to-peer ride-sharing platform powered by Polkadot.
                </p>
              </div>
              
              <div className="flex flex-row gap-3 md:gap-4">
                <Link to="/find-ride" className="flex-1 bg-primary text-white px-1 md:px-8 py-1 md:py-4 rounded-full text-sm md:text-lg font-semibold hover:bg-opacity-90 transition-colors text-center">
                  Find a Ride
                </Link>
                <Link to="/offer-ride" className="flex-1 border-2 border-primary text-primary px-2 md:px-8 py-3 md:py-4 rounded-full text-sm md:text-lg font-semibold hover:bg-primary hover:text-white transition-colors text-center">
                  Offer a Ride
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Real-Time Maps Section */}
      <section className="py-12 md:py-20 px-6 bg-gradient-to-br from-primary/5 to-pink-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left - Content */}
            <div className="order-1 lg:order-1 space-y-6">
              <div className="space-y-4">
                <h2 className="text-3xl md:text-5xl font-bold text-black leading-tight">
                  Real-Time Navigation & 
                  <span className="text-primary"> Live Tracking</span>
                </h2>
                <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
                  Experience seamless rides with our advanced real-time mapping technology. Track your driver's location, get accurate ETAs, and navigate with confidence.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary bg-opacity-10 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-black mb-1">Live GPS Tracking</h3>
                    <p className="text-gray-600">Track your ride in real-time and share your trip with friends and family</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary bg-opacity-10 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-black mb-1">Smart Route Optimization</h3>
                    <p className="text-gray-600">AI-powered routing finds the fastest and most efficient paths</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary bg-opacity-10 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-black mb-1">Accurate ETA</h3>
                    <p className="text-gray-600">Get precise arrival times based on real traffic conditions</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right - Animation */}
            <div className="order-2 lg:order-2">
              <div className="w-full max-w-lg mx-auto">
                {carAnimation && (
                  <Lottie 
                    animationData={carAnimation}
                    loop={true}
                    className="w-full h-auto"
                  />
                )}
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