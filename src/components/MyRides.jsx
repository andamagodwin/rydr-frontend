import React, { useState, useEffect } from 'react'
import { Car, User, Clock, MapPin, DollarSign, Calendar, Phone, AlertCircle } from 'lucide-react'
import useWalletStore from '../store/walletStore'
import rideService from '../services/rideService'
import contractService from '../services/contractService'

function MyRides() {
  const selectedAccount = useWalletStore((state) => state.selectedAccount)
  const isConnected = useWalletStore((state) => state.isConnected)
  
  const [activeTab, setActiveTab] = useState('offered') // 'offered' or 'booked'
  const [offeredRides, setOfferedRides] = useState([])
  const [bookedRides, setBookedRides] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)

  const fetchMyRides = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Fetch rides offered by this user
      const offered = await rideService.getRidesByDriver(selectedAccount.address)
      setOfferedRides(offered)

      // Fetch rides booked by this user (as passenger)
      const booked = await rideService.getRidesByPassenger(selectedAccount.address)
      setBookedRides(booked)

      console.log('Offered rides:', offered)
      console.log('Booked rides:', booked)
    } catch (err) {
      console.error('Failed to fetch rides:', err)
      setError('Failed to load your rides. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch rides when component mounts or wallet changes
  useEffect(() => {
    if (isConnected && selectedAccount) {
      fetchMyRides()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, selectedAccount])

  const handleMarkCompleted = async (appwriteId) => {
    if (!window.confirm('Mark this ride as completed? This will release payment to you.')) {
      return
    }

    setActionLoading(`complete-${appwriteId}`)
    try {
      const ride = offeredRides.find(r => r.$id === appwriteId)
      if (!ride || !ride.blockchainRideId) {
        throw new Error('Blockchain ride ID not found')
      }
      
      // Call smart contract to mark as completed
      await contractService.markCompleted(ride.blockchainRideId)
      
      // Refresh rides
      await fetchMyRides()
      
      alert('Ride marked as completed successfully!')
    } catch (err) {
      console.error('Failed to mark ride as completed:', err)
      alert(err.message || 'Failed to mark ride as completed')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReleasePayment = async (appwriteId) => {
    if (!window.confirm('Release payment to driver? This action cannot be undone.')) {
      return
    }

    setActionLoading(`release-${appwriteId}`)
    try {
      const ride = offeredRides.find(r => r.$id === appwriteId) || bookedRides.find(r => r.$id === appwriteId)
      if (!ride || !ride.blockchainRideId) {
        throw new Error('Blockchain ride ID not found')
      }
      
      await contractService.releasePayment(ride.blockchainRideId)
      
      // Refresh rides
      await fetchMyRides()
      
      alert('Payment released successfully!')
    } catch (err) {
      console.error('Failed to release payment:', err)
      alert(err.message || 'Failed to release payment')
    } finally {
      setActionLoading(null)
    }
  }

  const handleCancelRide = async (appwriteId) => {
    if (!window.confirm('Cancel this ride? If booked, the passenger will be refunded.')) {
      return
    }

    setActionLoading(`cancel-${appwriteId}`)
    try {
      const ride = offeredRides.find(r => r.$id === appwriteId)
      if (!ride || !ride.blockchainRideId) {
        throw new Error('Blockchain ride ID not found')
      }
      
      await contractService.cancelRide(ride.blockchainRideId)
      
      // Update Appwrite status
      await rideService.updateRideStatus(ride.$id, 'cancelled')
      
      // Refresh rides
      await fetchMyRides()
      
      alert('Ride cancelled successfully!')
    } catch (err) {
      console.error('Failed to cancel ride:', err)
      alert(err.message || 'Failed to cancel ride')
    } finally {
      setActionLoading(null)
    }
  }

  const RideCard = ({ ride, type }) => {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-4 border-l-4 border-primary">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <MapPin className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-gray-500">From</p>
                <p className="font-semibold">{ride.from}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-sm text-gray-500">To</p>
                <p className="font-semibold">{ride.to}</p>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
              ride.status === 'active' ? 'bg-green-100 text-green-800' :
              ride.status === 'booked' ? 'bg-blue-100 text-blue-800' :
              ride.status === 'completed' ? 'bg-gray-100 text-gray-800' :
              'bg-red-100 text-red-800'
            }`}>
              {ride.status.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Date</p>
              <p className="text-sm font-medium">{ride.date}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Time</p>
              <p className="text-sm font-medium">{ride.time}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Price</p>
              <p className="text-sm font-medium">{ride.price} DEV</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Seats</p>
              <p className="text-sm font-medium">{ride.seats}</p>
            </div>
          </div>
        </div>

        {/* Vehicle Info (for offered rides) */}
        {type === 'offered' && (
          <div className="bg-gray-50 rounded p-3 mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <Car className="w-4 h-4 text-gray-600" />
              <p className="text-sm font-semibold text-gray-700">Vehicle Details</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <p><span className="text-gray-500">Type:</span> {ride.vehicleType}</p>
              <p><span className="text-gray-500">Color:</span> {ride.vehicleColor}</p>
              <p><span className="text-gray-500">Make:</span> {ride.vehicleMake}</p>
              <p><span className="text-gray-500">Model:</span> {ride.vehicleModel}</p>
              <p className="col-span-2"><span className="text-gray-500">Plate:</span> {ride.registrationNumber}</p>
            </div>
          </div>
        )}

        {/* Description */}
        {ride.description && (
          <div className="mb-4">
            <p className="text-sm text-gray-600">{ride.description}</p>
          </div>
        )}

        {/* Actions */}
        {type === 'offered' && (
          <div className="flex space-x-2">
            {ride.status === 'booked' && (
              <button
                onClick={() => handleMarkCompleted(ride.$id)}
                disabled={actionLoading === `complete-${ride.$id}`}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                {actionLoading === `complete-${ride.$id}` ? 'Processing...' : 'Mark Completed'}
              </button>
            )}
            
            {ride.status === 'completed' && (
              <button
                onClick={() => handleReleasePayment(ride.$id)}
                disabled={actionLoading === `release-${ride.$id}`}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                {actionLoading === `release-${ride.$id}` ? 'Processing...' : 'Release Payment'}
              </button>
            )}

            {(ride.status === 'active' || ride.status === 'booked') && (
              <button
                onClick={() => handleCancelRide(ride.$id)}
                disabled={actionLoading === `cancel-${ride.$id}`}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                {actionLoading === `cancel-${ride.$id}` ? 'Cancelling...' : 'Cancel Ride'}
              </button>
            )}
          </div>
        )}

        {/* Blockchain TX Hash */}
        {ride.blockchainTxHash && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Blockchain TX: <span className="font-mono">{ride.blockchainTxHash.substring(0, 10)}...{ride.blockchainTxHash.substring(56)}</span>
            </p>
          </div>
        )}
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Wallet Not Connected</h2>
          <p className="text-gray-600">Please connect your wallet to view your rides</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">My Rides</h1>
          <p className="text-gray-600 mt-1">Manage your offered and booked rides</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex space-x-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('offered')}
            className={`pb-3 px-4 font-medium transition-colors ${
              activeTab === 'offered'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Rides I Offered ({offeredRides.length})
          </button>
          <button
            onClick={() => setActiveTab('booked')}
            className={`pb-3 px-4 font-medium transition-colors ${
              activeTab === 'booked'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Rides I Booked ({bookedRides.length})
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
            <button
              onClick={fetchMyRides}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Content */}
        {!isLoading && !error && (
          <div>
            {activeTab === 'offered' && (
              <div>
                {offeredRides.length === 0 ? (
                  <div className="text-center py-12">
                    <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No Rides Offered Yet</h3>
                    <p className="text-gray-500">Start offering rides to passengers</p>
                  </div>
                ) : (
                  offeredRides.map(ride => (
                    <RideCard key={ride.$id} ride={ride} type="offered" />
                  ))
                )}
              </div>
            )}

            {activeTab === 'booked' && (
              <div>
                {bookedRides.length === 0 ? (
                  <div className="text-center py-12">
                    <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No Rides Booked Yet</h3>
                    <p className="text-gray-500">Book a ride to get started</p>
                  </div>
                ) : (
                  bookedRides.map(ride => (
                    <RideCard key={ride.$id} ride={ride} type="booked" />
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyRides
