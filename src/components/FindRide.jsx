import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Map } from 'lucide-react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import contractService from '../services/contractService'
import rideService from '../services/rideService'

// Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1IjoiYW5kYW1hZXpyYSIsImEiOiJjbWM3djMyamcwMmxuMmxzYTFsMThpNTJwIn0.9H7kNoaCYW0Kiw0wzrLfhQ'

function FindRide() {
  const navigate = useNavigate()
  const [fromLocation, setFromLocation] = useState('')
  const [toLocation, setToLocation] = useState('')

  const [userLocation, setUserLocation] = useState(null)
  const [locationError, setLocationError] = useState(null)
  const [destinationLocation, setDestinationLocation] = useState(null)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [availableRides, setAvailableRides] = useState([])
  const [isLoadingRides, setIsLoadingRides] = useState(false)
  const [ridesError, setRidesError] = useState(null)
  const [selectedRideId, setSelectedRideId] = useState(null)
  
  const mapContainerRef = useRef()
  const mapRef = useRef()
  const markersRef = useRef([])

  // Fetch rides from Appwrite (has coordinates) and verify with blockchain
  const fetchRides = async () => {
    setIsLoadingRides(true)
    setRidesError(null)
    try {
      // Get all active rides from Appwrite (includes coordinates and metadata)
      const appwriteRides = await rideService.getActiveRides()
      
      console.log('Fetched rides from Appwrite:', appwriteRides)
      
      // Transform to match expected format
      const transformedRides = appwriteRides.map(ride => {
        // Parse coordinates from "lat,lng" format
        const pickupCoords = ride.pickupCoordinates.split(',').map(Number) // [lat, lng]
        const dropoffCoords = ride.dropoffCoordinates.split(',').map(Number) // [lat, lng]
        
        return {
          id: ride.$id, // Appwrite document ID
          appwriteId: ride.$id,
          from: ride.from,
          to: ride.to,
          driverAddress: ride.driverWallet,
          driverName: ride.driverName || (ride.driverWallet.substring(0, 6) + '...' + ride.driverWallet.substring(38)),
          driverPhone: ride.driverPhone,
          vehicleType: ride.vehicleType,
          vehicleMake: ride.vehicleMake,
          vehicleModel: ride.vehicleModel,
          vehicleColor: ride.vehicleColor,
          registrationNumber: ride.registrationNumber,
          rating: 4.5, // Could be calculated from reviews
          price: parseFloat(ride.price),
          seats: ride.seats,
          date: ride.date,
          time: ride.time,
          description: ride.description,
          coordinates: {
            from: [pickupCoords[1], pickupCoords[0]], // [lng, lat]
            to: [dropoffCoords[1], dropoffCoords[0]]
          },
          color: '#E6007A',
          status: ride.status,
          blockchainTxHash: ride.blockchainTxHash
        }
      })
      
      setAvailableRides(transformedRides)
    } catch (error) {
      console.error('Failed to fetch rides:', error)
      
      // Check if it's a contract not found error
      if (error.message.includes('could not decode result data')) {
        setRidesError('Smart contract not found at the configured address. Please ensure your contract is deployed to Moonbase Alpha network and the address is correct in your .env file.')
      } else {
        setRidesError(error.message || 'Failed to load rides. Please try again.')
      }
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

  // Update markers when user location or destination changes
  useEffect(() => {
    if (!mapRef.current) return

    // Wait for map to be loaded before adding markers
    const addUserMarkers = () => {
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
    }

    // Check if map is already loaded
    if (mapRef.current.loaded()) {
      addUserMarkers()
    } else {
      mapRef.current.on('load', addUserMarkers)
    }
  }, [userLocation, destinationLocation, toLocation])

  const handleSearch = async () => {
    if (!fromLocation && !toLocation) {
      fetchRides() // Reload all rides if no search criteria
      return
    }

    setIsLoadingRides(true)
    setRidesError(null)
    try {
      // Get all active rides from blockchain
      const rides = await contractService.getAllActiveRides()
      
      // Filter by location if specified
      const filteredRides = rides.filter(ride => {
        const matchesFrom = !fromLocation || 
          ride.fromLocation.toLowerCase().includes(fromLocation.toLowerCase())
        const matchesTo = !toLocation || 
          ride.toLocation.toLowerCase().includes(toLocation.toLowerCase())
        return matchesFrom && matchesTo
      })
      
      // Transform blockchain rides to match expected format
      const transformedRides = filteredRides.map(ride => {
        let fromCoords = [32.582520, 0.347596] // Default Kampala coordinates [lng, lat]
        let toCoords = [32.443606, 0.042068]   // Default Entebbe coordinates [lng, lat]
        
        return {
          id: ride.id,
          from: ride.fromLocation,
          to: ride.toLocation,
          driverAddress: ride.driver,
          driverName: ride.driver.substring(0, 6) + '...' + ride.driver.substring(38),
          rating: 4.5,
          price: parseFloat(ride.price),
          priceWei: ride.priceWei,
          coordinates: {
            from: fromCoords,
            to: toCoords
          },
          color: '#E6007A',
          status: ride.status,
          statusName: ride.statusName
        }
      })
      
      setAvailableRides(transformedRides)
    } catch (error) {
      console.error('Failed to search rides:', error)
      setRidesError(error.message || 'Failed to search rides. Please try again.')
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

  const viewRideOnMap = async (rideId) => {
    const ride = availableRides.find(r => r.id === rideId)
    if (!ride || !mapRef.current) return

    setSelectedRideId(rideId)

    const from = `${ride.coordinates.from[0]},${ride.coordinates.from[1]}`
    const to = `${ride.coordinates.to[0]},${ride.coordinates.to[1]}`
    
    try {
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${from};${to}?geometries=geojson&overview=full&access_token=${mapboxgl.accessToken}`
      const response = await fetch(url)
      const data = await response.json()
      
      if (data.routes && data.routes.length > 0) {
        const routeGeometry = data.routes[0].geometry

        // Remove existing selected route layer if any
        if (mapRef.current.getLayer('selected-route-line')) {
          mapRef.current.removeLayer('selected-route-line')
        }
        if (mapRef.current.getLayer('selected-route-outline')) {
          mapRef.current.removeLayer('selected-route-outline')
        }
        if (mapRef.current.getSource('selected-route')) {
          mapRef.current.removeSource('selected-route')
        }

        // Clear existing markers (except user location marker)
        const userLocationMarker = markersRef.current.find(m => 
          m.getElement()?.className?.includes('user-location-marker')
        )
        markersRef.current.forEach(marker => marker.remove())
        markersRef.current = []
        
        // Re-add user location marker if it exists
        if (userLocationMarker) {
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

        // Add pickup marker for selected ride (green, larger)
        const pickupEl = document.createElement('div')
        pickupEl.style.width = '20px'
        pickupEl.style.height = '20px'
        pickupEl.style.background = '#10B981'
        pickupEl.style.border = '3px solid white'
        pickupEl.style.borderRadius = '50%'
        pickupEl.style.boxShadow = '0 3px 6px rgba(0,0,0,0.4)'

        const pickupMarker = new mapboxgl.Marker(pickupEl)
          .setLngLat(ride.coordinates.from)
          .setPopup(new mapboxgl.Popup({ offset: 20 }).setHTML(`
            <div style="padding: 6px;">
              <strong style="color: #10B981; font-size: 14px;">📍 Pickup</strong><br/>
              <span style="font-size: 13px; font-weight: 600;">${ride.from}</span><br/>
              <span style="font-size: 11px; color: #666;">Driver: ${ride.driverName}</span><br/>
              <span style="font-size: 11px; color: #666;">Time: ${ride.time}</span>
            </div>
          `))
          .addTo(mapRef.current)
        
        markersRef.current.push(pickupMarker)

        // Add dropoff marker for selected ride (red, larger)
        const dropoffEl = document.createElement('div')
        dropoffEl.style.width = '20px'
        dropoffEl.style.height = '20px'
        dropoffEl.style.background = '#EF4444'
        dropoffEl.style.border = '3px solid white'
        dropoffEl.style.borderRadius = '50%'
        dropoffEl.style.boxShadow = '0 3px 6px rgba(0,0,0,0.4)'

        const dropoffMarker = new mapboxgl.Marker(dropoffEl)
          .setLngLat(ride.coordinates.to)
          .setPopup(new mapboxgl.Popup({ offset: 20 }).setHTML(`
            <div style="padding: 6px;">
              <strong style="color: #EF4444; font-size: 14px;">🎯 Dropoff</strong><br/>
              <span style="font-size: 13px; font-weight: 600;">${ride.to}</span><br/>
              <span style="font-size: 12px; color: #E6007A; font-weight: bold;">${formatPrice(ride.price)}</span>
            </div>
          `))
          .addTo(mapRef.current)
        
        markersRef.current.push(dropoffMarker)

        // Add selected route source
        mapRef.current.addSource('selected-route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: routeGeometry
          }
        })

        // Add selected route outline (thicker, darker)
        mapRef.current.addLayer({
          id: 'selected-route-outline',
          type: 'line',
          source: 'selected-route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#000000',
            'line-width': 6,
            'line-opacity': 0.4
          }
        })

        // Add selected route line (highlighted)
        mapRef.current.addLayer({
          id: 'selected-route-line',
          type: 'line',
          source: 'selected-route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#FFD700', // Gold color for selected route
            'line-width': 4,
            'line-opacity': 1
          }
        })

        // Fit map to selected route
        const coordinates = routeGeometry.coordinates
        const bounds = coordinates.reduce((bounds, coord) => {
          return bounds.extend(coord)
        }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]))

        mapRef.current.fitBounds(bounds, {
          padding: 80,
          maxZoom: 14
        })
      }
    } catch (error) {
      console.error('Failed to fetch route:', error)
    }
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
    return `${parseFloat(price).toFixed(4)} ETH`
  }

  return (
    <div className="bg-gray-50 h-screen overflow-hidden pt-6">
      <div className="relative h-full">
        {/* Map Section - Left Side */}
        <div className="relative h-64 md:h-full md:mr-[33.3333%]">
          <div ref={mapContainerRef} className="h-full w-full" />

          {/* Floating Search Bar (inside map overlay) */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 w-11/12 md:w-2/3 lg:w-1/2 max-w-2xl">
            <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 p-3">
              <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
                <div className="flex-1 min-w-0">
                  <label htmlFor="from" className="block text-xs font-medium text-gray-700 mb-1">From</label>
                  <div className="relative">
                    <input
                      type="text"
                      id="from"
                      value={fromLocation}
                      onChange={(e) => setFromLocation(e.target.value)}
                      onClick={handleFromInputClick}
                      placeholder={isGettingLocation ? "Getting location..." : "Your location"}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors pr-8 text-sm"
                      readOnly={isGettingLocation}
                    />
                    {isGettingLocation && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      </div>
                    )}
                    {fromLocation === 'Your Current Location' && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 text-green-500 text-sm">📍</div>
                    )}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <label htmlFor="to" className="block text-xs font-medium text-gray-700 mb-1">To</label>
                  <div className="relative">
                    <input
                      type="text"
                      id="to"
                      value={toLocation}
                      onChange={(e) => handleToLocationChange(e.target.value)}
                      placeholder="Destination"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors pr-8 text-sm"
                    />
                    {destinationLocation && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 text-red-500 text-sm">📍</div>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleSearch}
                  className="bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-opacity-90 transition-colors whitespace-nowrap text-sm shadow-md"
                >
                  Search
                </button>
              </div>
            </div>
          </div>

          {/* Map Controls Overlay */}
          {userLocation && !locationError && (
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg text-xs">
              <p className="font-medium text-green-600">📍 Your Location</p>
              <p className="text-gray-600 mt-1">{userLocation[0].toFixed(4)}°, {userLocation[1].toFixed(4)}°</p>
            </div>
          )}
        </div>

        {/* Rides Sidebar - Right Side (fixed on desktop) */}
        <div className="w-full md:w-1/3 bg-white border-l border-gray-200 flex flex-col md:fixed md:top-0 md:right-0 md:h-screen">
          {/* Fixed Header */}
          <div className="bg-white border-b border-gray-200 p-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">
                Available Rides
                {!isLoadingRides && filteredRides.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({filteredRides.length})
                  </span>
                )}
              </h2>
              {isLoadingRides && (
                <div className="flex items-center space-x-2 text-primary">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                </div>
              )}
            </div>
          </div>

          {/* Fixed Error Message */}
          {ridesError && (
            <div className="m-4 p-4 bg-red-50 border border-red-200 rounded-lg flex-shrink-0">
              <div className="flex items-start space-x-2 text-red-700 mb-2">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-semibold mb-1">Contract Connection Error</p>
                  <p className="text-xs">{ridesError}</p>
                  {ridesError.includes('contract not found') && (
                    <div className="mt-3 text-xs space-y-2">
                      <p className="font-medium">Please verify:</p>
                      <ol className="list-decimal list-inside space-y-1 text-gray-700 ml-2">
                        <li>Your contract is deployed to <span className="font-mono bg-white px-1 rounded">Moonbase Alpha (Chain ID: 1287)</span></li>
                        <li>Check contract on <a 
                          href={`https://moonbase.moonscan.io/address/${import.meta.env.VITE_CONTRACT_ADDRESS || '0x3FaB021c51812af385ee95621b24Ce3A1e6ADc14'}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline font-mono"
                        >Moonscan</a></li>
                        <li>Update <span className="font-mono bg-white px-1 rounded">VITE_CONTRACT_ADDRESS</span> in your .env file</li>
                      </ol>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={fetchRides}
                className="mt-3 px-3 py-1.5 text-xs bg-red-100 text-red-700 hover:bg-red-200 rounded transition-colors"
              >
                Retry Connection
              </button>
            </div>
          )}

          {/* Scrollable Rides List */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-3">
            {!isLoadingRides && filteredRides.map((ride) => (
              <div 
                key={ride.id} 
                className={`border rounded-lg p-3 transition-all cursor-pointer ${
                  selectedRideId === ride.id 
                    ? 'border-yellow-400 bg-yellow-50 shadow-lg' 
                    : 'border-gray-200 hover:border-primary hover:shadow-md'
                }`}
                onClick={() => viewRideOnMap(ride.id)}
              >
                {/* Route Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2 text-xs">
                    <span className="text-gray-500">📍</span>
                    <span className="font-medium text-gray-700">{ride.from}</span>
                    <span className="text-gray-400">→</span>
                    <span className="font-medium text-gray-700">{ride.to}</span>
                  </div>
                </div>

                {/* Driver Info */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-medium text-gray-600">
                        {ride.driverName.charAt(0)}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-sm text-gray-800 truncate">{ride.driverName}</div>
                      <div className="flex items-center space-x-1">
                        {renderStars(ride.rating)}
                        <span className="text-xs text-gray-500">({ride.rating})</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-primary font-bold text-base flex-shrink-0 ml-2">
                    {formatPrice(ride.price)}
                  </div>
                </div>

                {/* Date, Time, Seats */}
                <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
                  <span>🗓️ {ride.date}</span>
                  <span>🕐 {ride.time}</span>
                  <span>💺 {ride.seats} seats</span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      viewRideOnMap(ride.id)
                    }}
                    className={`flex-1 border-2 px-3 py-2 rounded-lg font-medium transition-colors text-xs flex items-center justify-center gap-1 ${
                      selectedRideId === ride.id
                        ? 'border-yellow-500 bg-yellow-500 text-white'
                        : 'border-primary text-primary hover:bg-primary hover:text-white'
                    }`}
                  >
                    <Map size={14} />
                    {selectedRideId === ride.id ? 'Viewing' : 'View Map'}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRequestRide(ride.id)
                    }}
                    className="flex-1 bg-primary text-white px-3 py-2 rounded-lg font-medium hover:bg-opacity-90 transition-colors text-xs"
                  >
                    Request
                  </button>
                </div>
              </div>
            ))}

            {/* Empty State */}
            {!isLoadingRides && filteredRides.length === 0 && !ridesError && (
              <div className="text-center py-12 px-4">
                <div className="text-gray-400 text-5xl mb-3">🚗</div>
                <p className="text-gray-500 font-medium">No rides available</p>
                <p className="text-gray-400 text-sm mt-2">Try adjusting your search criteria</p>
                <button
                  onClick={fetchRides}
                  className="mt-4 bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-opacity-90 transition-colors text-sm"
                >
                  Refresh Rides
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
  )
}

export default FindRide
