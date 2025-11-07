import { account, databases, DATABASE_ID, USERS_COLLECTION_ID } from '../config/appwrite'
import { ID, Query } from 'appwrite'

class AuthService {
  /**
   * Create a session using wallet address
   * This uses Appwrite's anonymous session + custom user document
   */
  async loginWithWallet(walletAddress, walletName = 'Unnamed Account') {
    try {
      // Check if there's an active session
      try {
        const currentSession = await account.get()
        if (currentSession) {
          // Update or verify user document
          return await this.getOrCreateUserDocument(walletAddress, walletName, currentSession.$id)
        }
      } catch {
        // No active session, continue to create one
      }

      // Create anonymous session
      const session = await account.createAnonymousSession()
      
      // Create or get user document with wallet address
      const user = await this.getOrCreateUserDocument(walletAddress, walletName, session.userId)
      
      return {
        session,
        user,
        success: true
      }
    } catch (error) {
      console.error('Wallet login error:', error)
      throw error
    }
  }

  /**
   * Get or create user document in database
   */
  async getOrCreateUserDocument(walletAddress, walletName, userId) {
    try {
      // Check if user already exists by wallet address
      const users = await databases.listDocuments(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        [Query.equal('walletAddress', walletAddress)]
      )

      if (users.documents.length > 0) {
        // User exists, update session info if needed
        const existingUser = users.documents[0]
        await databases.updateDocument(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          existingUser.$id,
          {
            lastLogin: new Date().toISOString(),
            sessionId: userId
          }
        )
        return existingUser
      }

      // Create new user document
      const newUser = await databases.createDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        ID.unique(),
        {
          walletAddress,
          walletName,
          sessionId: userId,
          lastLogin: new Date().toISOString()
        }
      )

      return newUser
    } catch (error) {
      console.error('Error managing user document:', error)
      throw error
    }
  }

  /**
   * Get current session
   */
  async getCurrentSession() {
    try {
      const session = await account.get()
      return session
    } catch {
      return null
    }
  }

  /**
   * Get user by wallet address
   */
  async getUserByWallet(walletAddress) {
    try {
      const users = await databases.listDocuments(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        [Query.equal('walletAddress', walletAddress)]
      )

      return users.documents.length > 0 ? users.documents[0] : null
    } catch (error) {
      console.error('Error fetching user:', error)
      return null
    }
  }

  /**
   * Logout user
   */
  async logout() {
    try {
      await account.deleteSession('current')
      return { success: true }
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated() {
    try {
      await account.get()
      return true
    } catch {
      return false
    }
  }
}

export default new AuthService()
