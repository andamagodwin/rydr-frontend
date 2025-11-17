import { useEffect, useCallback } from 'react'
import contractService from '../services/contractService'

/**
 * Custom hook to listen for smart contract events
 * Automatically sets up and cleans up event listeners
 */
export function useContractEvents(options = {}) {
  const {
    onRideCreated,
    onRideBooked,
    onRideCompleted,
    onPaymentReleased,
    onRideCancelled
  } = options

  /**
   * Set up event listeners
   */
  useEffect(() => {
    const setupListeners = async () => {
      try {
        // Initialize provider if not already done
        if (!contractService.contract) {
          await contractService.initProvider()
        }

        // Set up RideCreated listener
        if (onRideCreated) {
          contractService.onRideCreated((data) => {
            console.log('🚗 New ride created:', data)
            onRideCreated(data)
          })
        }

        // Set up RideBooked listener
        if (onRideBooked) {
          contractService.onRideBooked((data) => {
            console.log('📦 Ride booked:', data)
            onRideBooked(data)
          })
        }

        // Set up RideCompleted listener
        if (onRideCompleted) {
          contractService.onRideCompleted((data) => {
            console.log('✅ Ride completed:', data)
            onRideCompleted(data)
          })
        }

        // Set up PaymentReleased listener
        if (onPaymentReleased) {
          contractService.onPaymentReleased((data) => {
            console.log('💰 Payment released:', data)
            onPaymentReleased(data)
          })
        }

        // Set up RideCancelled listener
        if (onRideCancelled) {
          contractService.onRideCancelled((data) => {
            console.log('❌ Ride cancelled:', data)
            onRideCancelled(data)
          })
        }

        console.log('✅ Contract event listeners set up successfully')
      } catch (error) {
        console.error('Failed to set up contract event listeners:', error)
      }
    }

    setupListeners()

    // Cleanup on unmount
    return () => {
      console.log('🧹 Cleaning up contract event listeners')
      contractService.removeAllListeners()
    }
  }, [onRideCreated, onRideBooked, onRideCompleted, onPaymentReleased, onRideCancelled])

  return {
    // Expose contractService methods if needed
    getRide: useCallback((rideId) => contractService.getRide(rideId), []),
    getAllActiveRides: useCallback(() => contractService.getAllActiveRides(), []),
    getRideCount: useCallback(() => contractService.getRideCount(), [])
  }
}

export default useContractEvents
