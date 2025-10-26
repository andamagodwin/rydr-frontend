import React from 'react'

function FindRide() {
  return (
    <div className="bg-white flex items-center justify-center py-20">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary mb-4">Find a Ride</h1>
        <p className="text-xl text-gray-600">Search for available rides in your area</p>
        <div className="mt-8">
          <button className="bg-primary text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-opacity-90 transition-colors">
            Coming Soon
          </button>
        </div>
      </div>
    </div>
  )
}

export default FindRide