import React, { useState, useRef, useEffect } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

// Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1IjoiYW5kYW1hZXpyYSIsImEiOiJjbWM3djMyamcwMmxuMmxzYTFsMThpNTJwIn0.9H7kNoaCYW0Kiw0wzrLfhQ'

// Generate UUID v4 for session token
const generateSessionToken = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

function OfferRide() {
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    date: '',
    time: '',
    seats: '1',
    price: '',
    description: ''
  })
  const [pickupLocation, setPickupLocation] = useState(null)
  const [dropoffLocation, setDropoffLocation] = useState(null)
  const [locationError, setLocationError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Autocomplete state
  const [fromSuggestions, setFromSuggestions] = useState([])
  const [toSuggestions, setToSuggestions] = useState([])
  const [showFromDropdown, setShowFromDropdown] = useState(false)
  const [showToDropdown, setShowToDropdown] = useState(false)
  const [sessionToken] = useState(generateSessionToken())

  const mapContainerRef = useRef()
  const mapRef = useRef()
  const pickupMarkerRef = useRef()
  const dropoffMarkerRef = useRef()
  const fromInputRef = useRef()
  const toInputRef = useRef()

  // Initialize map (run once)
  useEffect(() => {
    if (!mapContainerRef.current) return

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [32.582520, 0.347596], // Kampala default
      zoom: 12
    })

    // Add navigation control
    mapRef.current.addControl(new mapboxgl.NavigationControl(), 'top-right')

    // Add geolocate control
    const geolocateControl = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true,
      showUserHeading: true,
      showAccuracyCircle: true
    })
    
    mapRef.current.addControl(geolocateControl, 'top-right')

    // Try to get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          mapRef.current.flyTo({
            center: [longitude, latitude],
            zoom: 13,
            duration: 2000
          })
          setLocationError(null)
        },
        (error) => {
          console.warn('Geolocation error:', error)
          setLocationError('Location access denied. You can still manually select pickup and dropoff points on the map.')
        }
      )
    }

    // Click on map to set pickup/dropoff locations
    mapRef.current.on('click', (e) => {
      const { lng, lat } = e.lngLat

      // If pickup marker not set, set pickup
      if (!pickupMarkerRef.current) {
        setPickupLocation([lng, lat])
        
        // Add pickup marker
        if (pickupMarkerRef.current) {
          pickupMarkerRef.current.remove()
        }
        
        const el = document.createElement('div')
        el.style.width = '30px'
        el.style.height = '30px'
        el.style.background = '#10B981'
        el.style.border = '3px solid white'
        el.style.borderRadius = '50%'
        el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)'
        el.style.cursor = 'pointer'

        pickupMarkerRef.current = new mapboxgl.Marker(el)
          .setLngLat([lng, lat])
          .setPopup(new mapboxgl.Popup().setHTML('<strong>Pickup Location</strong>'))
          .addTo(mapRef.current)
      }
      // If pickup exists but dropoff marker not set, set dropoff
      else if (!dropoffMarkerRef.current) {
        setDropoffLocation([lng, lat])
        
        // Add dropoff marker
        if (dropoffMarkerRef.current) {
          dropoffMarkerRef.current.remove()
        }
        
        const el = document.createElement('div')
        el.style.width = '30px'
        el.style.height = '30px'
        el.style.background = '#EF4444'
        el.style.border = '3px solid white'
        el.style.borderRadius = '50%'
        el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)'
        el.style.cursor = 'pointer'

        dropoffMarkerRef.current = new mapboxgl.Marker(el)
          .setLngLat([lng, lat])
          .setPopup(new mapboxgl.Popup().setHTML('<strong>Dropoff Location</strong>'))
          .addTo(mapRef.current)
      }
    })

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
      }
    }
  }, [])

  // Debounced search for location suggestions
  useEffect(() => {
    const searchLocations = async (query, isFromField) => {
      if (query.length < 3) {
        if (isFromField) {
          setFromSuggestions([])
          setShowFromDropdown(false)
        } else {
          setToSuggestions([])
          setShowToDropdown(false)
        }
        return
      }

      try {
        const response = await fetch(
          `https://api.mapbox.com/search/searchbox/v1/suggest?q=${encodeURIComponent(query)}&access_token=${mapboxgl.accessToken}&session_token=${sessionToken}&limit=5&proximity=32.582520,0.347596&country=UG`
        )
        
        if (!response.ok) throw new Error('Search failed')
        
        const data = await response.json()
        
        if (isFromField) {
          setFromSuggestions(data.suggestions || [])
          setShowFromDropdown(true)
        } else {
          setToSuggestions(data.suggestions || [])
          setShowToDropdown(true)
        }
      } catch (error) {
        console.error('Location search error:', error)
      }
    }

    const timeoutId = setTimeout(() => {
      if (formData.from) {
        searchLocations(formData.from, true)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [formData.from, sessionToken])

  useEffect(() => {
    const searchLocations = async (query) => {
      if (query.length < 3) {
        setToSuggestions([])
        setShowToDropdown(false)
        return
      }

      try {
        const response = await fetch(
          `https://api.mapbox.com/search/searchbox/v1/suggest?q=${encodeURIComponent(query)}&access_token=${mapboxgl.accessToken}&session_token=${sessionToken}&limit=5&proximity=32.582520,0.347596&country=UG`
        )
        
        if (!response.ok) throw new Error('Search failed')
        
        const data = await response.json()
        setToSuggestions(data.suggestions || [])
        setShowToDropdown(true)
      } catch (error) {
        console.error('Location search error:', error)
      }
    }

    const timeoutId = setTimeout(() => {
      if (formData.to) {
        searchLocations(formData.to)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [formData.to, sessionToken])

  // Retrieve full location details and coordinates
  const retrieveLocation = async (mapboxId, isFromField) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/search/searchbox/v1/retrieve/${mapboxId}?access_token=${mapboxgl.accessToken}&session_token=${sessionToken}`
      )
      
      if (!response.ok) throw new Error('Retrieve failed')
      
      const data = await response.json()
      const feature = data.features[0]
      
      if (feature && feature.geometry && feature.geometry.coordinates) {
        const [lng, lat] = feature.geometry.coordinates
        
        if (isFromField) {
          setPickupLocation([lng, lat])
          
          // Add pickup marker
          if (pickupMarkerRef.current) {
            pickupMarkerRef.current.remove()
          }
          
          const el = document.createElement('div')
          el.style.width = '30px'
          el.style.height = '30px'
          el.style.background = '#10B981'
          el.style.border = '3px solid white'
          el.style.borderRadius = '50%'
          el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)'
          el.style.cursor = 'pointer'

          pickupMarkerRef.current = new mapboxgl.Marker(el)
            .setLngLat([lng, lat])
            .setPopup(new mapboxgl.Popup().setHTML(`<strong>Pickup Location</strong><br/>${feature.properties.name || formData.from}`))
            .addTo(mapRef.current)
          
          // Center map on pickup
          mapRef.current.flyTo({ center: [lng, lat], zoom: 13, duration: 1500 })
        } else {
          setDropoffLocation([lng, lat])
          
          // Add dropoff marker
          if (dropoffMarkerRef.current) {
            dropoffMarkerRef.current.remove()
          }
          
          const el = document.createElement('div')
          el.style.width = '30px'
          el.style.height = '30px'
          el.style.background = '#EF4444'
          el.style.border = '3px solid white'
          el.style.borderRadius = '50%'
          el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)'
          el.style.cursor = 'pointer'

          dropoffMarkerRef.current = new mapboxgl.Marker(el)
            .setLngLat([lng, lat])
            .setPopup(new mapboxgl.Popup().setHTML(`<strong>Dropoff Location</strong><br/>${feature.properties.name || formData.to}`))
            .addTo(mapRef.current)
          
          // If both locations set, fit map to show both
          if (pickupLocation) {
            const bounds = new mapboxgl.LngLatBounds()
            bounds.extend(pickupLocation)
            bounds.extend([lng, lat])
            mapRef.current.fitBounds(bounds, { padding: 100, duration: 1500 })
          } else {
            mapRef.current.flyTo({ center: [lng, lat], zoom: 13, duration: 1500 })
          }
        }
      }
    } catch (error) {
      console.error('Location retrieve error:', error)
    }
  }

  const handleSuggestionClick = (suggestion, isFromField) => {
    // Use the full name or combine with place_formatted for clarity
    const locationName = suggestion.name

    
    if (isFromField) {
      setFormData(prev => ({ ...prev, from: locationName }))
      setShowFromDropdown(false)
      setFromSuggestions([])
      if (fromInputRef.current) fromInputRef.current.blur()
    } else {
      setFormData(prev => ({ ...prev, to: locationName }))
      setShowToDropdown(false)
      setToSuggestions([])
      if (toInputRef.current) toInputRef.current.blur()
    }
    
    // Retrieve full details and coordinates
    retrieveLocation(suggestion.mapbox_id, isFromField)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const resetLocations = () => {
    setPickupLocation(null)
    setDropoffLocation(null)
    if (pickupMarkerRef.current) {
      pickupMarkerRef.current.remove()
      pickupMarkerRef.current = null
    }
    if (dropoffMarkerRef.current) {
      dropoffMarkerRef.current.remove()
      dropoffMarkerRef.current = null
    }
    // Clear any existing route from the map
    if (mapRef.current) {
      try {
        if (mapRef.current.getLayer('route-outline')) {
          mapRef.current.removeLayer('route-outline')
        }
        if (mapRef.current.getLayer('route-line')) {
          mapRef.current.removeLayer('route-line')
        }
        if (mapRef.current.getSource('route')) {
          mapRef.current.removeSource('route')
        }
      } catch {
        // no-op
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!pickupLocation || !dropoffLocation) {
      alert('Please select both pickup and dropoff locations on the map')
      return
    }

    setIsSubmitting(true)

    // Prepare ride data
    const rideData = {
      ...formData,
      pickupCoordinates: pickupLocation,
      dropoffCoordinates: dropoffLocation,
      createdAt: new Date().toISOString()
    }

    console.log('Submitting ride offer:', rideData)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      alert('Ride posted successfully! 🎉')
      
      // Reset form
      setFormData({
        from: '',
        to: '',
        date: '',
        time: '',
        seats: '1',
        price: '',
        description: ''
      })
      resetLocations()
    }, 1500)
  }

  // Draw or update route between pickup and dropoff using Mapbox Directions API
  useEffect(() => {
    const drawStraightLineFallback = () => {
      if (!mapRef.current || !pickupLocation || !dropoffLocation) return
      const routeGeoJSON = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: [
                pickupLocation, // [lng, lat]
                dropoffLocation,
              ],
            },
          },
        ],
      }

      if (mapRef.current.getSource('route')) {
        mapRef.current.getSource('route').setData(routeGeoJSON)
      } else {
        mapRef.current.addSource('route', { type: 'geojson', data: routeGeoJSON })
        // Outline (casing)
        mapRef.current.addLayer({
          id: 'route-outline',
          type: 'line',
          source: 'route',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': '#000000', 'line-width': 6, 'line-opacity': 0.15 },
        })
        // Main route line
        mapRef.current.addLayer({
          id: 'route-line',
          type: 'line',
          source: 'route',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': '#E6007A', 'line-width': 4 },
        })
      }

      // Fit map to show both points clearly
      const bounds = new mapboxgl.LngLatBounds()
      bounds.extend(pickupLocation)
      bounds.extend(dropoffLocation)
      mapRef.current.fitBounds(bounds, { padding: 80, duration: 800 })
    }

    const fetchAndDrawRoute = async () => {
      if (!pickupLocation || !dropoffLocation || !mapRef.current) return
      try {
        const from = `${pickupLocation[0]},${pickupLocation[1]}`
        const to = `${dropoffLocation[0]},${dropoffLocation[1]}`
        const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${from};${to}?geometries=geojson&overview=full&access_token=${mapboxgl.accessToken}`
        const res = await fetch(url)
        if (!res.ok) throw new Error('Directions request failed')
        const data = await res.json()
        const route = data?.routes?.[0]?.geometry
        if (!route) throw new Error('No route geometry')

        const routeGeoJSON = {
          type: 'FeatureCollection',
          features: [
            { type: 'Feature', geometry: route },
          ],
        }

        if (mapRef.current.getSource('route')) {
          mapRef.current.getSource('route').setData(routeGeoJSON)
        } else {
          mapRef.current.addSource('route', { type: 'geojson', data: routeGeoJSON })
          // Outline (casing)
          mapRef.current.addLayer({
            id: 'route-outline',
            type: 'line',
            source: 'route',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: { 'line-color': '#000000', 'line-width': 6, 'line-opacity': 0.15 },
          })
          // Main route line (brand color)
          mapRef.current.addLayer({
            id: 'route-line',
            type: 'line',
            source: 'route',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: { 'line-color': '#E6007A', 'line-width': 4 },
          })
        }

        // Fit map to the full route bounds for a better view
        const bounds = new mapboxgl.LngLatBounds()
        route.coordinates.forEach(([lng, lat]) => bounds.extend([lng, lat]))
        mapRef.current.fitBounds(bounds, { padding: 80, duration: 800 })
      } catch (err) {
        console.warn('Directions API failed, drawing straight line fallback:', err)
        drawStraightLineFallback()
      }
    }

    // If both locations set, draw route; otherwise clear route
    if (pickupLocation && dropoffLocation) {
      // Ensure map style is loaded before adding sources/layers
      if (mapRef.current && typeof mapRef.current.isStyleLoaded === 'function' && !mapRef.current.isStyleLoaded()) {
        const onLoad = () => fetchAndDrawRoute()
        mapRef.current.once ? mapRef.current.once('load', onLoad) : mapRef.current.on('load', onLoad)
      } else {
        fetchAndDrawRoute()
      }
    } else {
      // Clear route if one or both points are missing
      if (mapRef.current) {
        try {
          if (mapRef.current.getLayer('route-outline')) {
            mapRef.current.removeLayer('route-outline')
          }
          if (mapRef.current.getLayer('route-line')) {
            mapRef.current.removeLayer('route-line')
          }
          if (mapRef.current.getSource('route')) {
            mapRef.current.removeSource('route')
          }
        } catch {
          // no-op
        }
      }
    }
  }, [pickupLocation, dropoffLocation])

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-2">Offer a Ride</h1>
          <p className="text-gray-600">Share your journey and earn rewards while helping others</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Ride Details</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* From Location */}
              <div className="relative">
                <label htmlFor="from" className="block text-sm font-medium text-gray-700 mb-2">
                  From (Pickup Location) *
                </label>
                <input
                  ref={fromInputRef}
                  type="text"
                  id="from"
                  name="from"
                  value={formData.from}
                  onChange={handleInputChange}
                  onFocus={() => formData.from.length >= 3 && setShowFromDropdown(true)}
                  onBlur={() => setTimeout(() => setShowFromDropdown(false), 200)}
                  placeholder="Type to search location..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                  required
                  autoComplete="off"
                />
                
                {/* Autocomplete Dropdown for From */}
                {showFromDropdown && fromSuggestions.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {fromSuggestions.map((suggestion) => (
                      <div
                        key={suggestion.mapbox_id}
                        onMouseDown={() => handleSuggestionClick(suggestion, true)}
                        className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium text-gray-900">{suggestion.name}</div>
                        {suggestion.place_formatted && (
                          <div className="text-xs text-gray-500 mt-1">{suggestion.place_formatted}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                <p className="text-xs text-gray-500 mt-1">
                  {pickupLocation ? '✓ Pickup point marked on map' : 'Type at least 3 characters to search'}
                </p>
              </div>

              {/* To Location */}
              <div className="relative">
                <label htmlFor="to" className="block text-sm font-medium text-gray-700 mb-2">
                  To (Dropoff Location) *
                </label>
                <input
                  ref={toInputRef}
                  type="text"
                  id="to"
                  name="to"
                  value={formData.to}
                  onChange={handleInputChange}
                  onFocus={() => formData.to.length >= 3 && setShowToDropdown(true)}
                  onBlur={() => setTimeout(() => setShowToDropdown(false), 200)}
                  placeholder="Type to search location..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                  required
                  autoComplete="off"
                />
                
                {/* Autocomplete Dropdown for To */}
                {showToDropdown && toSuggestions.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {toSuggestions.map((suggestion) => (
                      <div
                        key={suggestion.mapbox_id}
                        onMouseDown={() => handleSuggestionClick(suggestion, false)}
                        className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium text-gray-900">{suggestion.name}</div>
                        {suggestion.place_formatted && (
                          <div className="text-xs text-gray-500 mt-1">{suggestion.place_formatted}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                <p className="text-xs text-gray-500 mt-1">
                  {dropoffLocation ? '✓ Dropoff point marked on map' : 'Type at least 3 characters to search'}
                </p>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                    Time *
                  </label>
                  <input
                    type="time"
                    id="time"
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Seats and Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="seats" className="block text-sm font-medium text-gray-700 mb-2">
                    Available Seats *
                  </label>
                  <select
                    id="seats"
                    name="seats"
                    value={formData.seats}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                    required
                  >
                    <option value="1">1 Seat</option>
                    <option value="2">2 Seats</option>
                    <option value="3">3 Seats</option>
                    <option value="4">4 Seats</option>
                    <option value="5">5+ Seats</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                    Price per Seat (UGX) *
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="e.g., 15000"
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Information (Optional)
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Any preferences or additional details about your ride..."
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors resize-none"
                />
              </div>

              {/* Reset Locations Button */}
              {(pickupLocation || dropoffLocation) && (
                <button
                  type="button"
                  onClick={resetLocations}
                  className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Reset Map Locations
                </button>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !pickupLocation || !dropoffLocation}
                className={`w-full px-6 py-4 rounded-lg font-semibold text-lg transition-colors ${
                  isSubmitting || !pickupLocation || !dropoffLocation
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-primary text-white hover:bg-opacity-90'
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Posting Ride...
                  </span>
                ) : (
                  'Post Ride'
                )}
              </button>
            </form>
          </div>

          {/* Right Column - Map */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Select Route on Map</h2>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow"></div>
                  <span className="text-gray-600">Click to set pickup location</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow"></div>
                  <span className="text-gray-600">Click to set dropoff location</span>
                </div>
              </div>
              {locationError && (
                <p className="text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg mt-3">
                  ℹ️ {locationError}
                </p>
              )}
            </div>
            
            <div className="h-[600px] relative">
              <div ref={mapContainerRef} className="h-full w-full" />
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">How it works</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Fill in your ride details including date, time, and available seats</li>
                <li>• Click on the map to mark your pickup (green) and dropoff (red) locations</li>
                <li>• Set a fair price per seat for your passengers</li>
                <li>• Your ride will be visible to users searching for rides on this route</li>
                <li>• Payments are securely handled through smart contracts on Polkadot blockchain</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OfferRide