import React, { useState, useRef, useEffect } from 'react'
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Get Mapbox token from environment variables
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Custom marker icons
const createCustomIcon = (color, isPickup = true) => {
  const svgIcon = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="8" fill="${color}" stroke="white" stroke-width="3"/>
      <circle cx="12" cy="12" r="4" fill="white"/>
      ${isPickup ? '<circle cx="12" cy="12" r="2" fill="#10B981"/>' : '<circle cx="12" cy="12" r="2" fill="#EF4444"/>'}
    </svg>
  `
  return L.divIcon({
    html: svgIcon,
    className: 'custom-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  })
}

// Component to handle map updates
function MapUpdater({ center, zoom }) {
  const map = useMap()
  
  useEffect(() => {
    if (center && zoom) {
      map.setView(center, zoom)
    }
  }, [map, center, zoom])
  
  return null
}

function FindRide() {
  const [fromLocation, setFromLocation] = useState('')
  const [toLocation, setToLocation] = useState('')
  const [isMapExpanded, setIsMapExpanded] = useState(false)
  const [selectedRouteId, setSelectedRouteId] = useState(null)
  const [hoveredRideId, setHoveredRideId] = useState(null)
  const [userLocation, setUserLocation] = useState(null)
  const [mapCenter, setMapCenter] = useState([0.347596, 32.582520]) // Default to Kampala, Uganda
  const [mapZoom, setMapZoom] = useState(12)
  const [locationError, setLocationError] = useState(null)
  const [destinationLocation, setDestinationLocation] = useState(null)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const mapRef = useRef()

  // Mock data for available rides with Uganda coordinates (Kampala area)
  const availableRides = [
    {
      id: 1,
      from: 'City Center',
      to: 'Entebbe Airport',
      driverName: 'John Doe',
      rating: 4.8,
      price: 25000, // UGX
      coordinates: {
        from: [32.582520, 0.347596], // Kampala city center
        to: [32.443606, 0.042068]   // Entebbe Airport
      },
      color: '#E6007A' // Primary color
    },
    {
      id: 2,
      from: 'Makerere University',
      to: 'Garden City Mall',
      driverName: 'Sarah Nakato',
      rating: 4.9,
      price: 8000, // UGX
      coordinates: {
        from: [32.566910, 0.335110], // Makerere University
        to: [32.616940, 0.337250]   // Garden City Mall
      },
      color: '#10B981' // Green
    },
    {
      id: 3,
      from: 'Kampala',
      to: 'Mukono',
      driverName: 'Peter Ssali',
      rating: 4.7,
      price: 15000, // UGX
      coordinates: {
        from: [32.582520, 0.347596], // Kampala
        to: [32.755060, 0.353430]   // Mukono
      },
      color: '#3B82F6' // Blue
    },
    {
      id: 4,
      from: 'Ntinda',
      to: 'City Center',
      driverName: 'Grace Namuli',
      rating: 5.0,
      price: 7000, // UGX
      coordinates: {
        from: [32.615540, 0.364190], // Ntinda
        to: [32.582520, 0.347596]   // City Center
      },
      color: '#F59E0B' // Amber
    }
  ]

  const filteredRides = selectedRouteId 
    ? availableRides.filter(ride => ride.id === selectedRouteId)
    : availableRides

  // Geolocation effect
  useEffect(() => {
    const getUserLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords
            setUserLocation([latitude, longitude])
            setMapCenter([latitude, longitude])
            setMapZoom(13)
            setLocationError(null)
          },
          (error) => {
            console.warn('Geolocation error:', error)
            setLocationError('Unable to get your location. Using default location (Kampala).')
            // Keep default Kampala coordinates
          }
        )
      } else {
        setLocationError('Geolocation is not supported by this browser.')
      }
    }

    getUserLocation()
  }, [])

  const handleSearch = () => {
    // Search functionality to be implemented
    console.log('Searching rides from', fromLocation, 'to', toLocation)
    // Auto-center map on search results
    if (mapRef.current && availableRides.length > 0) {
      const bounds = L.latLngBounds(
        availableRides.flatMap(ride => [
          [ride.coordinates.from[1], ride.coordinates.from[0]],
          [ride.coordinates.to[1], ride.coordinates.to[0]]
        ])
      )
      mapRef.current.fitBounds(bounds, { padding: [20, 20] })
    }
  }

  const handleRequestRide = (rideId) => {
    // Request ride functionality to be implemented
    console.log('Requesting ride with ID:', rideId)
  }

  const toggleMapExpansion = () => {
    setIsMapExpanded(!isMapExpanded)
  }

  const handleRouteClick = (rideId) => {
    setSelectedRouteId(selectedRouteId === rideId ? null : rideId)
  }

  const handleRideHover = (rideId, isEntering) => {
    setHoveredRideId(isEntering ? rideId : null)
  }

  const handleFromInputClick = () => {
    if (userLocation) {
      // If we already have the user's location, use it
      setFromLocation('Your Current Location')
    } else {
      // Try to get the user's location
      setIsGettingLocation(true)
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords
            setUserLocation([latitude, longitude])
            setFromLocation('Your Current Location')
            setIsGettingLocation(false)
            setLocationError(null)
          },
          (error) => {
            console.warn('Geolocation error:', error)
            setFromLocation('') // Clear the input
            setIsGettingLocation(false)
            setLocationError('Unable to get your location. Please enter manually.')
          }
        )
      } else {
        setFromLocation('')
        setIsGettingLocation(false)
        setLocationError('Geolocation is not supported by this browser.')
      }
    }
  }

  // Simple geocoding simulation for Uganda locations
  const geocodeLocation = async (locationName) => {
    const ugandaLocations = {
      'kampala': [0.347596, 32.582520],
      'entebbe': [0.042068, 32.443606],
      'jinja': [0.431940, 33.204110],
      'mbale': [1.082220, 34.175640],
      'gulu': [2.771940, 32.299440],
      'mbarara': [-0.597500, 30.657220],
      'fort portal': [0.671110, 30.275280],
      'masaka': [-0.330556, 31.734167],
      'mukono': [0.353430, 32.755060],
      'makerere': [0.335110, 32.566910],
      'ntinda': [0.364190, 32.615540],
      'kololo': [0.325000, 32.592500],
      'nakawa': [0.347778, 32.627778],
      'kawempe': [0.399444, 32.562500],
    }

    const normalizedName = locationName.toLowerCase().trim()
    return ugandaLocations[normalizedName] || null
  }

  const handleToLocationChange = async (value) => {
    setToLocation(value)
    if (value.length > 2) {
      const coords = await geocodeLocation(value)
      if (coords) {
        setDestinationLocation(coords)
      } else {
        setDestinationLocation(null)
      }
    } else {
      setDestinationLocation(null)
    }
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

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0
    }).format(price)
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <style>{`
        .custom-marker {
          background: transparent !important;
          border: none !important;
        }
        .user-location-marker, .destination-marker {
          background: transparent !important;
          border: none !important;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 8px;
        }
        .leaflet-popup-tip {
          background: white;
        }
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }
      `}</style>
      <div className="max-w-6xl mx-auto px-4">
        {/* Header with Map */}
        <div className="bg-white rounded-lg shadow-md mb-8 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-6 pb-4 gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-2">Find a Ride</h1>
              {locationError && (
                <p className="text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-lg">
                  📍 {locationError}
                </p>
              )}
              {userLocation && !locationError && (
                <p className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-lg">
                  📍 Location detected - showing rides near you
                </p>
              )}
            </div>
            <button
              onClick={toggleMapExpansion}
              className="flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors"
            >
              <span className="text-gray-700 font-medium">
                {isMapExpanded ? 'Hide Map' : 'Area Map'}
              </span>
              <span className="text-gray-500">
                {isMapExpanded ? '▲' : '▼'}
              </span>
            </button>
          </div>

          {/* Map Container */}
          <div 
            className={`transition-all duration-300 ease-in-out overflow-hidden ${
              isMapExpanded 
                ? 'h-80 sm:h-96 lg:h-[500px]' // More height on desktop
                : 'h-32 sm:h-40 lg:h-48'      // Responsive collapsed height
            }`}
          >
            <div className="h-full w-full relative">
              <MapContainer
                ref={mapRef}
                center={mapCenter}
                zoom={mapZoom}
                style={{ height: '100%', width: '100%' }}
                zoomControl={isMapExpanded}
                attributionControl={false}
              >
                <MapUpdater center={mapCenter} zoom={mapZoom} />
                {/* Mapbox Tile Layer */}
                <TileLayer
                  url={`https://api.mapbox.com/styles/v1/mapbox/light-v11/tiles/{z}/{x}/{y}?access_token=${MAPBOX_TOKEN}`}
                  attribution='© <a href="https://www.mapbox.com/">Mapbox</a> © <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                />

                {/* User Location Marker */}
                {userLocation && (
                  <Marker
                    position={userLocation}
                    icon={L.divIcon({
                      html: `
                        <div style="
                          width: 20px; 
                          height: 20px; 
                          background: #3B82F6; 
                          border: 3px solid white; 
                          border-radius: 50%; 
                          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                          position: relative;
                        ">
                          <div style="
                            width: 40px; 
                            height: 40px; 
                            background: rgba(59, 130, 246, 0.2); 
                            border-radius: 50%; 
                            position: absolute; 
                            top: -13px; 
                            left: -13px;
                            animation: pulse 2s infinite;
                          "></div>
                        </div>
                      `,
                      className: 'user-location-marker',
                      iconSize: [20, 20],
                      iconAnchor: [10, 10],
                    })}
                  >
                    <Popup>
                      <div className="text-center">
                        <div className="font-semibold text-blue-600">Your Location</div>
                        <div className="text-sm text-gray-600">Current position</div>
                      </div>
                    </Popup>
                  </Marker>
                )}

                {/* Destination Marker */}
                {destinationLocation && (
                  <Marker
                    position={destinationLocation}
                    icon={L.divIcon({
                      html: `
                        <div style="
                          width: 24px; 
                          height: 24px; 
                          background: #EF4444; 
                          border: 3px solid white; 
                          border-radius: 50%; 
                          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                          display: flex;
                          align-items: center;
                          justify-content: center;
                          color: white;
                          font-size: 12px;
                          font-weight: bold;
                        ">📍</div>
                      `,
                      className: 'destination-marker',
                      iconSize: [24, 24],
                      iconAnchor: [12, 12],
                    })}
                  >
                    <Popup>
                      <div className="text-center">
                        <div className="font-semibold text-red-600">Destination</div>
                        <div>{toLocation}</div>
                        <div className="text-sm text-gray-600">Where you want to go</div>
                      </div>
                    </Popup>
                  </Marker>
                )}

                {/* Route Lines */}
                {availableRides.map((ride) => (
                  <Polyline
                    key={`route-${ride.id}`}
                    positions={[
                      [ride.coordinates.from[1], ride.coordinates.from[0]],
                      [ride.coordinates.to[1], ride.coordinates.to[0]]
                    ]}
                    color={
                      selectedRouteId === ride.id 
                        ? '#E6007A' 
                        : hoveredRideId === ride.id 
                        ? '#F472B6' 
                        : ride.color
                    }
                    weight={
                      selectedRouteId === ride.id 
                        ? 6 
                        : hoveredRideId === ride.id 
                        ? 5 
                        : 3
                    }
                    opacity={
                      selectedRouteId === ride.id 
                        ? 1 
                        : hoveredRideId === ride.id 
                        ? 0.9 
                        : 0.7
                    }
                    eventHandlers={{
                      click: () => handleRouteClick(ride.id),
                      mouseover: () => setHoveredRideId(ride.id),
                      mouseout: () => setHoveredRideId(null)
                    }}
                  />
                ))}

                {/* Pickup and Dropoff Markers */}
                {availableRides.map((ride) => (
                  <React.Fragment key={`markers-${ride.id}`}>
                    {/* Pickup Marker */}
                    <Marker
                      position={[ride.coordinates.from[1], ride.coordinates.from[0]]}
                      icon={createCustomIcon(
                        selectedRouteId === ride.id ? '#E6007A' : ride.color, 
                        true
                      )}
                    >
                      <Popup>
                        <div className="text-center">
                          <div className="font-semibold text-green-600">Pickup</div>
                          <div>{ride.from}</div>
                          <div className="text-sm text-gray-600">{ride.driverName}</div>
                        </div>
                      </Popup>
                    </Marker>
                    
                    {/* Dropoff Marker */}
                    <Marker
                      position={[ride.coordinates.to[1], ride.coordinates.to[0]]}
                      icon={createCustomIcon(
                        selectedRouteId === ride.id ? '#E6007A' : ride.color, 
                        false
                      )}
                    >
                      <Popup>
                        <div className="text-center">
                          <div className="font-semibold text-red-600">Dropoff</div>
                          <div>{ride.to}</div>
                          <div className="text-sm text-gray-600">{formatPrice(ride.price)}</div>
                        </div>
                      </Popup>
                    </Marker>
                  </React.Fragment>
                ))}
              </MapContainer>



              {/* Route Counter */}
              {selectedRouteId && (
                <div className="absolute top-4 right-4 bg-primary text-white rounded-lg px-3 py-1 text-sm font-medium">
                  Showing route {selectedRouteId}
                  <button 
                    onClick={() => setSelectedRouteId(null)}
                    className="ml-2 hover:text-gray-200"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label htmlFor="from" className="block text-sm font-medium text-gray-700 mb-2">
                From
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="from"
                  value={fromLocation}
                  onChange={(e) => setFromLocation(e.target.value)}
                  onClick={handleFromInputClick}
                  placeholder={isGettingLocation ? "Getting your location..." : "Click to use current location"}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors pr-10"
                  readOnly={isGettingLocation}
                />
                {isGettingLocation && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                  </div>
                )}
                {fromLocation === 'Your Current Location' && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">
                    📍
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1">
              <label htmlFor="to" className="block text-sm font-medium text-gray-700 mb-2">
                To
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="to"
                  value={toLocation}
                  onChange={(e) => handleToLocationChange(e.target.value)}
                  placeholder="Enter destination (e.g., Kampala, Entebbe)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors pr-10"
                />
                {destinationLocation && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500">
                    📍
                  </div>
                )}
              </div>
              {toLocation && !destinationLocation && toLocation.length > 2 && (
                <p className="text-xs text-gray-500 mt-1">
                  Try: Kampala, Entebbe, Jinja, Mbale, Gulu, Mbarara
                </p>
              )}
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
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Available Rides
            </h2>
          </div>
          
          <div className="space-y-4">
            {filteredRides.map((ride) => (
              <div 
                key={ride.id} 
                className={`border rounded-lg p-4 transition-all cursor-pointer ${
                  selectedRouteId === ride.id 
                    ? 'border-primary bg-primary bg-opacity-5 shadow-md' 
                    : hoveredRideId === ride.id
                    ? 'border-gray-300 shadow-md'
                    : 'border-gray-200 hover:shadow-md'
                }`}
                onMouseEnter={() => handleRideHover(ride.id, true)}
                onMouseLeave={() => handleRideHover(ride.id, false)}
                onClick={() => handleRouteClick(ride.id)}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  {/* Column 1: From/To without Dots */}
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-600 text-sm">From:</span>
                      <span className="font-medium">{ride.from}</span>
                    </div>
                    <div className="flex items-center space-x-2">
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
                      {formatPrice(ride.price)}
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

          {filteredRides.length === 0 && (
            <div className="text-center py-12">
              {selectedRouteId ? (
                <>
                  <p className="text-gray-500 text-lg">No rides found for the selected route.</p>
                  <button 
                    onClick={() => setSelectedRouteId(null)}
                    className="text-primary hover:text-opacity-80 text-sm mt-2 underline"
                  >
                    Show all rides
                  </button>
                </>
              ) : (
                <>
                  <p className="text-gray-500 text-lg">No rides available at the moment.</p>
                  <p className="text-gray-400 text-sm mt-2">Try adjusting your search criteria.</p>
                </>
              )}
            </div>
          )}

          {/* Map Interaction Hint */}
          {isMapExpanded && filteredRides.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2 text-blue-800">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">
                  Tip: Click on map routes or hover over ride cards to see connections!
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FindRide