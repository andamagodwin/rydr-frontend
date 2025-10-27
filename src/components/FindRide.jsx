import React, { useState } from 'react'

function FindRide() {
  const [fromLocation, setFromLocation] = useState('')
  const [toLocation, setToLocation] = useState('')

  // Mock data for available rides
  const availableRides = [
    {
      id: 1,
      from: 'Downtown',
      to: 'Airport',
      driverName: 'John Doe',
      rating: 4.8,
      price: 25.00
    },
    {
      id: 2,
      from: 'University',
      to: 'Mall',
      driverName: 'Sarah Smith',
      rating: 4.9,
      price: 15.50
    },
    {
      id: 3,
      from: 'City Center',
      to: 'Suburbs',
      driverName: 'Mike Johnson',
      rating: 4.7,
      price: 32.00
    },
    {
      id: 4,
      from: 'Beach',
      to: 'Downtown',
      driverName: 'Emily Davis',
      rating: 5.0,
      price: 18.75
    }
  ]

  const handleSearch = () => {
    // Search functionality to be implemented
    console.log('Searching rides from', fromLocation, 'to', toLocation)
  }

  const handleRequestRide = (rideId) => {
    // Request ride functionality to be implemented
    console.log('Requesting ride with ID:', rideId)
  }

  const renderStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="text-yellow-400">★</span>)
    }

    if (hasHalfStar) {
      stars.push(<span key="half" className="text-yellow-400">☆</span>)
    }

    const emptyStars = 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="text-gray-300">☆</span>)
    }

    return stars
  }

  const renderPriceDots = (price) => {
    const dots = Math.min(Math.floor(price / 10) + 1, 5) // Simple logic for dots based on price
    return Array(dots).fill('•').join('')
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Find a Ride</h1>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label htmlFor="from" className="block text-sm font-medium text-gray-700 mb-2">
                From
              </label>
              <input
                type="text"
                id="from"
                value={fromLocation}
                onChange={(e) => setFromLocation(e.target.value)}
                placeholder="Enter pickup location"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="to" className="block text-sm font-medium text-gray-700 mb-2">
                To
              </label>
              <input
                type="text"
                id="to"
                value={toLocation}
                onChange={(e) => setToLocation(e.target.value)}
                placeholder="Enter destination"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
              />
            </div>
            <button
              onClick={handleSearch}
              className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-colors whitespace-nowrap"
            >
              Search
            </button>
          </div>
        </div>

        {/* Available Rides Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Available Rides</h2>
          
          <div className="space-y-4">
            {availableRides.map((ride) => (
              <div key={ride.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  {/* Column 1: From/To */}
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-gray-600 text-sm">From:</span>
                      <span className="font-medium">{ride.from}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-gray-600 text-sm">To:</span>
                      <span className="font-medium">{ride.to}</span>
                    </div>
                  </div>

                  {/* Column 2: Driver Name and Rating */}
                  <div className="text-center md:text-left">
                    <div className="font-semibold text-gray-800 mb-1">{ride.driverName}</div>
                    <div className="flex items-center justify-center md:justify-start space-x-1">
                      {renderStars(ride.rating)}
                      <span className="text-sm text-gray-600 ml-1">({ride.rating})</span>
                    </div>
                  </div>

                  {/* Column 3: Price and Request Button */}
                  <div className="text-center md:text-right">
                    <div className="text-primary font-bold text-lg mb-2">
                      {renderPriceDots(ride.price)} ${ride.price.toFixed(2)}
                    </div>
                    <button
                      onClick={() => handleRequestRide(ride.id)}
                      className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-opacity-90 transition-colors"
                    >
                      Request Ride
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {availableRides.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No rides available at the moment.</p>
              <p className="text-gray-400 text-sm mt-2">Try adjusting your search criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FindRide