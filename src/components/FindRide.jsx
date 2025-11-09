import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import rideService from '../services/rideService'

// Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1IjoiYW5kYW1hZXpyYSIsImEiOiJjbWM3djMyamcwMmxuMmxzYTFsMThpNTJwIn0.9H7kNoaCYW0Kiw0wzrLfhQ'

function FindRide() {
  const navigate = useNavigate()
  const [fromLocation, setFromLocation] = useState('')
  const [toLocation, setToLocation] = useState('')
  const [isMapExpanded, setIsMapExpanded] = useState(false)

  const [userLocation, setUserLocation] = useState(null)
  const [locationError, setLocationError] = useState(null)
  const [destinationLocation, setDestinationLocation] = useState(null)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [availableRides, setAvailableRides] = useState([])
  const [isLoadingRides, setIsLoadingRides] = useState(false)
  const [ridesError, setRidesError] = useState(null)
  
  const mapContainerRef = useRef()
  const mapRef = useRef()
  const markersRef = useRef([])

  // Fetch rides from database
  const fetchRides = async () => {
    setIsLoadingRides(true)
    setRidesError(null)
    try {
      const rides = await rideService.getActiveRides()
      // Transform database rides to match expected format
      const transformedRides = rides.map(ride => {
        let fromCoords = [32.582520, 0.347596] // Default Kampala coordinates
        let toCoords = [32.443606, 0.042068]   // Default Entebbe coordinates
        
        try {
          if (ride.pickupCoordinates) {
            const parsed = JSON.parse(ride.pickupCoordinates)
            if (Array.isArray(parsed) && parsed.length === 2 && !isNaN(parsed[0]) && !isNaN(parsed[1])) {
              fromCoords = parsed
            }
          }
        } catch (err) {
          console.warn('Invalid pickup coordinates:', ride.pickupCoordinates, err)
        }
        
        try {
          if (ride.dropoffCoordinates) {
            const parsed = JSON.parse(ride.dropoffCoordinates)
            if (Array.isArray(parsed) && parsed.length === 2 && !isNaN(parsed[0]) && !isNaN(parsed[1])) {
              toCoords = parsed
            }
          }
        } catch (err) {
          console.warn('Invalid dropoff coordinates:', ride.dropoffCoordinates, err)
        }

        return {
          id: ride.$id,
          from: ride.from,
          to: ride.to,
          driverName: ride.driverName,
          rating: 4.5, // Default rating - you may want to add this to database later
          price: parseInt(ride.price) || 0,
          coordinates: {
            from: fromCoords,
            to: toCoords
          },
          color: '#E6007A', // Default color
          vehicleType: ride.vehicleType,
          seats: ride.seats,
          date: ride.date,
          time: ride.time,
          description: ride.description
        }
      })
      setAvailableRides(transformedRides)
    } catch (error) {
      console.error('Failed to fetch rides:', error)
      setRidesError('Failed to load rides. Please try again.')
      setAvailableRides([])
    } finally {
      setIsLoadingRides(false)
    }
  }

  // Load rides on component mount
  useEffect(() => {
    fetchRides()
  }, [])

  const filteredRides = availableRides

  // Initialize map - default to user's current location when available
  useEffect(() => {
    if (!mapContainerRef.current) return

    let destroyed = false

    // Promise wrapper for geolocation with timeout
    const getCurrentPositionAsync = (options) =>
      new Promise((resolve, reject) => {
        if (!('geolocation' in navigator)) {
          reject({ code: -1, message: 'Geolocation unsupported' })
          return
        }
        navigator.geolocation.getCurrentPosition(resolve, reject, options)
      })

    const initMap = async () => {
      setIsGettingLocation(true)

      // Kampala fallback [lng, lat]
      let startCenter = [32.582520, 0.347596]
      let startZoom = 12

      try {
        const pos = await getCurrentPositionAsync({
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 0,
        })
        const { latitude, longitude } = pos.coords
        startCenter = [longitude, latitude]
        startZoom = 13
        setUserLocation([latitude, longitude])
        setLocationError(null)
      } catch (error) {
        console.warn('Initial geolocation error:', error)
        if (error && typeof error.code === 'number') {
          if (error.code === 1) {
            setLocationError('Location access denied. Please enable location in your browser settings or click the location button on the map.')
          } else if (error.code === 2) {
            setLocationError('Location unavailable. Using default location.')
          } else if (error.code === 3) {
            setLocationError('Location request timeout. Using default location.')
          } else {
            setLocationError('Unable to get your location. Using default location.')
          }
        } else {
          setLocationError('Geolocation is not supported by this browser.')
        }
      } finally {
        if (!destroyed && mapContainerRef.current) {
          mapRef.current = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: 'mapbox://styles/mapbox/streets-v12',
            center: startCenter,
            zoom: startZoom,
          })

          setupMapControls()
        }
        setIsGettingLocation(false)
      }
    }

    function setupMapControls() {
      // Add navigation control
      mapRef.current.addControl(new mapboxgl.NavigationControl(), 'top-right')

      // Add geolocate control to track user's location
      const geolocateControl = new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showUserHeading: true,
        showAccuracyCircle: true,
      })

      mapRef.current.addControl(geolocateControl, 'top-right')

      // Listen for geolocation events from the control
      geolocateControl.on('geolocate', (e) => {
        const { latitude, longitude } = e.coords
        setUserLocation([latitude, longitude])
        setLocationError(null)
      })

      geolocateControl.on('error', (e) => {
        console.warn('Geolocation control error:', e)
        if (e.code === 1) {
          setLocationError('Location access denied. Click "Allow" when prompted or check your browser settings.')
        }
      })
    }

    initMap()

    return () => {
      destroyed = true
      if (mapRef.current) {
        mapRef.current.remove()
      }
    }
  }, [])

  // Update markers and routes when data changes
  useEffect(() => {
    if (!mapRef.current) return

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []

    // Add user location marker
    if (userLocation) {
      const el = document.createElement('div')
      el.className = 'user-location-marker'
      el.style.width = '20px'
      el.style.height = '20px'
      el.style.background = '#3B82F6'
      el.style.border = '3px solid white'
      el.style.borderRadius = '50%'
      el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)'

      const marker = new mapboxgl.Marker(el)
        .setLngLat([userLocation[1], userLocation[0]])
        .setPopup(new mapboxgl.Popup().setHTML('<div><strong>Your Location</strong><br/>Current position</div>'))
        .addTo(mapRef.current)
      
      markersRef.current.push(marker)
    }

    // Add destination marker
    if (destinationLocation) {
      const el = document.createElement('div')
      el.innerHTML = '📍'
      el.style.fontSize = '24px'

      const marker = new mapboxgl.Marker(el)
        .setLngLat([destinationLocation[1], destinationLocation[0]])
        .setPopup(new mapboxgl.Popup().setHTML(`<div><strong>Destination</strong><br/>${toLocation}</div>`))
        .addTo(mapRef.current)
      
      markersRef.current.push(marker)
    }

    // Add ride markers and routes
    filteredRides.forEach(ride => {
      // Pickup marker (green)
      const pickupEl = document.createElement('div')
      pickupEl.style.width = '12px'
      pickupEl.style.height = '12px'
      pickupEl.style.background = '#10B981'
      pickupEl.style.border = '2px solid white'
      pickupEl.style.borderRadius = '50%'
      pickupEl.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)'

      const pickupMarker = new mapboxgl.Marker(pickupEl)
        .setLngLat(ride.coordinates.from)
        .setPopup(new mapboxgl.Popup().setHTML(`<div><strong>Pickup</strong><br/>${ride.from}<br/>${ride.driverName}</div>`))
        .addTo(mapRef.current)
      
      markersRef.current.push(pickupMarker)

      // Dropoff marker (red)
      const dropoffEl = document.createElement('div')
      dropoffEl.style.width = '12px'
      dropoffEl.style.height = '12px'
      dropoffEl.style.background = '#EF4444'
      dropoffEl.style.border = '2px solid white'
      dropoffEl.style.borderRadius = '50%'
      dropoffEl.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)'

      const dropoffMarker = new mapboxgl.Marker(dropoffEl)
        .setLngLat(ride.coordinates.to)
        .setPopup(new mapboxgl.Popup().setHTML(`<div><strong>Dropoff</strong><br/>${ride.to}<br/>${formatPrice(ride.price)}</div>`))
        .addTo(mapRef.current)
      
      markersRef.current.push(dropoffMarker)
    })
  }, [filteredRides, userLocation, destinationLocation, toLocation])

  const handleSearch = async () => {
    if (!fromLocation && !toLocation) {
      fetchRides() // Reload all rides if no search criteria
      return
    }

    setIsLoadingRides(true)
    setRidesError(null)
    try {
      let rides
      if (fromLocation || toLocation) {
        rides = await rideService.searchRides(fromLocation, toLocation)
      } else {
        rides = await rideService.getActiveRides()
      }
      
      // Transform database rides to match expected format
      const transformedRides = rides.map(ride => {
        let fromCoords = [32.582520, 0.347596] // Default Kampala coordinates
        let toCoords = [32.443606, 0.042068]   // Default Entebbe coordinates
        
        try {
          if (ride.pickupCoordinates) {
            const parsed = JSON.parse(ride.pickupCoordinates)
            if (Array.isArray(parsed) && parsed.length === 2 && !isNaN(parsed[0]) && !isNaN(parsed[1])) {
              fromCoords = parsed
            }
          }
        } catch (err) {
          console.warn('Invalid pickup coordinates:', ride.pickupCoordinates, err)
        }
        
        try {
          if (ride.dropoffCoordinates) {
            const parsed = JSON.parse(ride.dropoffCoordinates)
            if (Array.isArray(parsed) && parsed.length === 2 && !isNaN(parsed[0]) && !isNaN(parsed[1])) {
              toCoords = parsed
            }
          }
        } catch (err) {
          console.warn('Invalid dropoff coordinates:', ride.dropoffCoordinates, err)
        }

        return {
          id: ride.$id,
          from: ride.from,
          to: ride.to,
          driverName: ride.driverName,
          rating: 4.5, // Default rating - you may want to add this to database later
          price: parseInt(ride.price) || 0,
          coordinates: {
            from: fromCoords,
            to: toCoords
          },
          color: '#E6007A', // Default color
          vehicleType: ride.vehicleType,
          seats: ride.seats,
          date: ride.date,
          time: ride.time,
          description: ride.description
        }
      })
      setAvailableRides(transformedRides)
    } catch (error) {
      console.error('Failed to search rides:', error)
      setRidesError('Failed to search rides. Please try again.')
      setAvailableRides([])
    } finally {
      setIsLoadingRides(false)
    }
  }

  const handleRequestRide = (rideId) => {
    const ride = availableRides.find(r => r.id === rideId)
    if (!ride) return
    navigate('/payment', { state: { ride } })
  }

  const toggleMapExpansion = () => {
    setIsMapExpanded(!isMapExpanded)
    setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.resize()
      }
    }, 300)
  }





  const handleFromInputClick = () => {
    if (userLocation) {
      setFromLocation('Your Current Location')
    } else {
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
            setFromLocation('')
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
                <div className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                  <p className="font-medium">📍 Your Location:</p>
                  <p className="text-xs mt-1 text-gray-600">
                    Latitude: {userLocation[0].toFixed(6)}° | Longitude: {userLocation[1].toFixed(6)}°
                  </p>
                </div>
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

          {/* Mapbox Map Container */}
          <div 
            className={`transition-all duration-300 ease-in-out overflow-hidden ${
              isMapExpanded 
                ? 'h-80 sm:h-96 lg:h-[500px]'
                : 'h-32 sm:h-40 lg:h-48'
            }`}
          >
            <div 
              ref={mapContainerRef} 
              className="h-full w-full"
            />
            
            {/* Route Counter - removed since we don't filter routes anymore */}
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 md:items-end">
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
              className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-colors whitespace-nowrap w-full md:w-auto"
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
            {isLoadingRides && (
              <div className="flex items-center space-x-2 text-primary">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                <span className="text-sm">Loading rides...</span>
              </div>
            )}
          </div>

          {ridesError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2 text-red-700">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">{ridesError}</span>
              </div>
              <button
                onClick={fetchRides}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                Try again
              </button>
            </div>
          )}
          
          <div className="space-y-4">
            {!isLoadingRides && filteredRides.map((ride) => (
              <div 
                key={ride.id} 
                className="border border-gray-200 rounded-lg p-3 md:p-4 transition-all hover:shadow-md"
              >
                {/* Mobile Layout */}
                <div className="block md:hidden">
                  {/* Header: Route */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="text-gray-500">📍</span>
                      <span className="font-medium">{ride.from}</span>
                      <span className="text-gray-400">→</span>
                      <span className="font-medium">{ride.to}</span>
                    </div>
                    <div className="text-primary font-bold text-lg">
                      {formatPrice(ride.price)}
                    </div>
                  </div>

                  {/* Driver Info & Action Row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-600">
                          {ride.driverName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-sm">{ride.driverName}</div>
                        <div className="flex items-center space-x-1">
                          {renderStars(ride.rating)}
                          <span className="text-xs text-gray-500">({ride.rating})</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRequestRide(ride.id)
                      }}
                      className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-opacity-90 transition-colors text-sm"
                    >
                      Request
                    </button>
                  </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden md:block">
                  <div className="grid grid-cols-3 gap-4 items-center">
                    {/* Column 1: From/To */}
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
                    <div className="text-left">
                      <div className="font-semibold text-gray-800 mb-1">{ride.driverName}</div>
                      <div className="flex items-center space-x-1">
                        {renderStars(ride.rating)}
                        <span className="text-sm text-gray-600 ml-1">({ride.rating})</span>
                      </div>
                    </div>

                    {/* Column 3: Price and Request Button */}
                    <div className="text-right">
                      <div className="text-primary font-bold text-lg mb-2">
                        {formatPrice(ride.price)}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRequestRide(ride.id)
                        }}
                        className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-opacity-90 transition-colors"
                      >
                        Request Ride
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {!isLoadingRides && filteredRides.length === 0 && !ridesError && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No rides available at the moment.</p>
              <p className="text-gray-400 text-sm mt-2">Try adjusting your search criteria or refresh the page.</p>
              <button
                onClick={fetchRides}
                className="mt-4 bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-opacity-90 transition-colors"
              >
                Refresh Rides
              </button>
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
                  Tip: All available rides are shown on the map!
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
