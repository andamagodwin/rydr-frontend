import React from 'react'

function OfferRide() {
  return (
    <div className="bg-white flex items-center justify-center py-20">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary mb-4">Offer a Ride</h1>
        <p className="text-xl text-gray-600">Share your ride and earn rewards</p>
        <div className="mt-8">
          <button className="bg-primary text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-opacity-90 transition-colors">
            Coming Soon
          </button>
        </div>
      </div>
    </div>
  )
}

export default OfferRide