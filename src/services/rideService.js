import { databases, DATABASE_ID, RIDES_COLLECTION_ID } from '../config/appwrite'
import { ID, Query } from 'appwrite'

class RideService {
  /**
   * Create a new ride offer
   */
  async createRide(rideData) {
    try {
      const ride = await databases.createDocument(
        DATABASE_ID,
        RIDES_COLLECTION_ID,
        ID.unique(),
        {
          ...rideData,
          status: 'active'
        }
      )
      return ride
    } catch (error) {
      console.error('Error creating ride:', error)
      throw error
    }
  }

  /**
   * Get all active rides
   */
  async getActiveRides() {
    try {
      const rides = await databases.listDocuments(
        DATABASE_ID,
        RIDES_COLLECTION_ID,
        [
          Query.equal('status', 'active'),
          Query.orderDesc('$createdAt')
        ]
      )
      return rides.documents
    } catch (error) {
      console.error('Error fetching rides:', error)
      throw error
    }
  }

  /**
   * Get rides by driver wallet
   */
  async getRidesByDriver(walletAddress) {
    try {
      const rides = await databases.listDocuments(
        DATABASE_ID,
        RIDES_COLLECTION_ID,
        [
          Query.equal('driverWallet', walletAddress),
          Query.orderDesc('$createdAt')
        ]
      )
      return rides.documents
    } catch (error) {
      console.error('Error fetching driver rides:', error)
      throw error
    }
  }

  /**
   * Search rides by route
   */
  async searchRides(fromLocation, toLocation) {
    try {
      const rides = await databases.listDocuments(
        DATABASE_ID,
        RIDES_COLLECTION_ID,
        [
          Query.equal('status', 'active'),
          Query.search('from', fromLocation),
          Query.orderDesc('$createdAt')
        ]
      )
      
      // Filter by destination if provided
      if (toLocation) {
        return rides.documents.filter(ride => 
          ride.to.toLowerCase().includes(toLocation.toLowerCase())
        )
      }
      
      return rides.documents
    } catch (error) {
      console.error('Error searching rides:', error)
      throw error
    }
  }

  /**
   * Update ride status
   */
  async updateRideStatus(rideId, status) {
    try {
      const ride = await databases.updateDocument(
        DATABASE_ID,
        RIDES_COLLECTION_ID,
        rideId,
        { status }
      )
      return ride
    } catch (error) {
      console.error('Error updating ride:', error)
      throw error
    }
  }

  /**
   * Delete a ride
   */
  async deleteRide(rideId) {
    try {
      await databases.deleteDocument(
        DATABASE_ID,
        RIDES_COLLECTION_ID,
        rideId
      )
      return { success: true }
    } catch (error) {
      console.error('Error deleting ride:', error)
      throw error
    }
  }
}

export default new RideService()
