import { ethers } from 'ethers'
import { RYDR_CONTRACT_ABI, RYDR_CONTRACT_ADDRESS, RPC_URL, RideStatus, CHAIN_ID } from '../config/contract'
import useWalletStore from '../store/walletStore'

/**
 * RydrRide Smart Contract Service
 * Provides all blockchain interaction functions for the ride-sharing platform
 * Supports both MetaMask and Polkadot wallets (SubWallet, Talisman)
 */

class ContractService {
  constructor() {
    this.contract = null
    this.provider = null
    this.signer = null
    this.eventListeners = new Map()
  }

  /**
   * Initialize contract with provider (read-only)
   */
  async initProvider() {
    try {
      this.provider = new ethers.JsonRpcProvider(RPC_URL)
      this.contract = new ethers.Contract(
        RYDR_CONTRACT_ADDRESS,
        RYDR_CONTRACT_ABI,
        this.provider
      )
      return true
    } catch (error) {
      console.error('Failed to initialize provider:', error)
      throw new Error('Could not connect to blockchain network')
    }
  }

  /**
   * Switch to Moonbase Alpha network (Chain ID 1287)
   */
  async switchToMoonbaseAlpha(provider) {
    try {
      const chainIdHex = '0x' + CHAIN_ID.toString(16) // Convert 1287 to 0x507
      
      console.log(`🔄 Switching to Moonbase Alpha (Chain ID: ${CHAIN_ID})...`)
      
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainIdHex }],
      })
      
      console.log('✅ Network switched to Moonbase Alpha')
    } catch (switchError) {
      // This error code indicates that the chain has not been added to the wallet
      if (switchError.code === 4902) {
        try {
          console.log('📝 Adding Moonbase Alpha network...')
          
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x' + CHAIN_ID.toString(16),
                chainName: 'Moonbase Alpha',
                nativeCurrency: {
                  name: 'DEV',
                  symbol: 'DEV',
                  decimals: 18,
                },
                rpcUrls: ['https://rpc.api.moonbase.moonbeam.network'],
                blockExplorerUrls: ['https://moonbase.moonscan.io/'],
              },
            ],
          })
          
          console.log('✅ Moonbase Alpha network added')
        } catch (addError) {
          console.error('Failed to add Moonbase Alpha network:', addError)
          throw addError
        }
      } else {
        console.error('Failed to switch network:', switchError)
        throw switchError
      }
    }
  }

  /**
   * Initialize contract with signer (for transactions)
   * Supports both MetaMask and Polkadot wallets
   */
  async initSigner() {
    try {
      // Check which wallet is connected via Zustand store
      const { selectedAccount } = useWalletStore.getState()
      
      let ethereumProvider = window.ethereum
      
      // If Polkadot wallet is connected, we need to use its specific provider
      if (selectedAccount?.meta?.source === 'polkadot') {
        console.log('🔷 Polkadot wallet detected, looking for EVM provider...')
        
        // When multiple wallets are installed, window.ethereum might point to MetaMask
        // We need to find the Polkadot wallet's provider specifically
        
        // SubWallet injects as window.SubWallet or in window.ethereum.providers array
        if (window.SubWallet) {
          ethereumProvider = window.SubWallet
          console.log('✅ Using SubWallet provider')
        } 
        // Check if ethereum.providers exists (for multiple wallet support)
        else if (window.ethereum?.providers && Array.isArray(window.ethereum.providers)) {
          // Look for SubWallet or Talisman in providers array
          const subwallet = window.ethereum.providers.find(p => p.isSubWallet)
          const talisman = window.ethereum.providers.find(p => p.isTalisman)
          
          if (subwallet) {
            ethereumProvider = subwallet
            console.log('✅ Using SubWallet from providers array')
          } else if (talisman) {
            ethereumProvider = talisman
            console.log('✅ Using Talisman from providers array')
          }
        }
        
        if (!ethereumProvider) {
          throw new Error('Please ensure your Polkadot wallet is set as the default wallet in your browser, or disable MetaMask temporarily')
        }
        
        // Ensure SubWallet is on Moonbase Alpha network
        await this.switchToMoonbaseAlpha(ethereumProvider)
      } else {
        console.log('🦊 Using MetaMask/Ethereum wallet')
        
        if (!ethereumProvider) {
          throw new Error('Please install MetaMask or another Web3 wallet')
        }
        
        // Ensure MetaMask is on Moonbase Alpha network
        await this.switchToMoonbaseAlpha(ethereumProvider)
      }

      const provider = new ethers.BrowserProvider(ethereumProvider)
      this.signer = await provider.getSigner()
      this.contract = new ethers.Contract(
        RYDR_CONTRACT_ADDRESS,
        RYDR_CONTRACT_ABI,
        this.signer
      )
      
      const address = await this.signer.getAddress()
      console.log('✅ Signer initialized:', address)
      
      return address
    } catch (error) {
      console.error('Failed to initialize signer:', error)
      throw error
    }
  }

  /**
   * Get current connected wallet address
   */
  async getConnectedAddress() {
    if (this.signer) {
      return await this.signer.getAddress()
    }
    return null
  }

  // ========================================
  // CONTRACT WRITE FUNCTIONS (TRANSACTIONS)
  // ========================================

  /**
   * CREATE RIDE - Driver creates a new ride
   * @param {string} fromLocation - Starting location
   * @param {string} toLocation - Destination
   * @param {string} price - Price in ETH (e.g., "0.01")
   * @returns {Promise<object>} Transaction receipt and ride ID
   */
  async createRide(fromLocation, toLocation, price) {
    try {
      if (!this.contract || !this.signer) {
        await this.initSigner()
      }

      // Convert price from ETH to Wei
      const priceInWei = ethers.parseEther(price.toString())

      console.log('Creating ride:', { fromLocation, toLocation, priceInWei: priceInWei.toString() })

      const tx = await this.contract.createRide(fromLocation, toLocation, priceInWei)
      console.log('Transaction sent:', tx.hash)

      const receipt = await tx.wait()
      console.log('Transaction confirmed:', receipt)

      // Extract ride ID from event logs
      const event = receipt.logs.find(log => {
        try {
          const parsedLog = this.contract.interface.parseLog({
            topics: [...log.topics],
            data: log.data
          })
          return parsedLog && parsedLog.name === 'RideCreated'
        } catch {
          return false
        }
      })

      let rideId = null
      if (event) {
        const parsedEvent = this.contract.interface.parseLog({
          topics: [...event.topics],
          data: event.data
        })
        rideId = parsedEvent.args.rideId.toString()
      }

      return {
        success: true,
        transactionHash: receipt.hash,
        rideId,
        blockNumber: receipt.blockNumber
      }
    } catch (error) {
      console.error('Create ride failed:', error)
      throw this._handleError(error)
    }
  }

  /**
   * BOOK RIDE - Passenger books a ride by paying the price
   * @param {number|string} rideId - Ride ID to book
   * @param {string} priceInEth - Price in ETH
   * @returns {Promise<object>} Transaction receipt
   */
  async bookRide(rideId, priceInEth) {
    try {
      if (!this.contract || !this.signer) {
        await this.initSigner()
      }

      const priceInWei = ethers.parseEther(priceInEth.toString())

      console.log('Booking ride:', { rideId, priceInWei: priceInWei.toString() })

      const tx = await this.contract.bookRide(rideId, { value: priceInWei })
      console.log('Transaction sent:', tx.hash)

      const receipt = await tx.wait()
      console.log('Transaction confirmed:', receipt)

      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber
      }
    } catch (error) {
      console.error('Book ride failed:', error)
      throw this._handleError(error)
    }
  }

  /**
   * MARK COMPLETED - Driver marks ride as completed
   * @param {number|string} rideId - Ride ID
   * @returns {Promise<object>} Transaction receipt
   */
  async markCompleted(rideId) {
    try {
      if (!this.contract || !this.signer) {
        await this.initSigner()
      }

      console.log('Marking ride completed:', rideId)

      const tx = await this.contract.markCompleted(rideId)
      console.log('Transaction sent:', tx.hash)

      const receipt = await tx.wait()
      console.log('Transaction confirmed:', receipt)

      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber
      }
    } catch (error) {
      console.error('Mark completed failed:', error)
      throw this._handleError(error)
    }
  }

  /**
   * RELEASE PAYMENT - Passenger releases payment to driver
   * @param {number|string} rideId - Ride ID
   * @returns {Promise<object>} Transaction receipt
   */
  async releasePayment(rideId) {
    try {
      if (!this.contract || !this.signer) {
        await this.initSigner()
      }

      console.log('Releasing payment for ride:', rideId)

      const tx = await this.contract.releasePayment(rideId)
      console.log('Transaction sent:', tx.hash)

      const receipt = await tx.wait()
      console.log('Transaction confirmed:', receipt)

      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber
      }
    } catch (error) {
      console.error('Release payment failed:', error)
      throw this._handleError(error)
    }
  }

  /**
   * CANCEL RIDE - Cancel ride and refund passenger if booked
   * @param {number|string} rideId - Ride ID
   * @returns {Promise<object>} Transaction receipt
   */
  async cancelRide(rideId) {
    try {
      if (!this.contract || !this.signer) {
        await this.initSigner()
      }

      console.log('Cancelling ride:', rideId)

      const tx = await this.contract.cancelRide(rideId)
      console.log('Transaction sent:', tx.hash)

      const receipt = await tx.wait()
      console.log('Transaction confirmed:', receipt)

      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber
      }
    } catch (error) {
      console.error('Cancel ride failed:', error)
      throw this._handleError(error)
    }
  }

  // ========================================
  // CONTRACT READ FUNCTIONS (VIEW)
  // ========================================

  /**
   * GET RIDE - Fetch ride details
   * @param {number|string} rideId - Ride ID
   * @returns {Promise<object>} Ride details
   */
  async getRide(rideId) {
    try {
      if (!this.contract) {
        await this.initProvider()
      }

      const [driver, passenger, fromLocation, toLocation, price, status] = 
        await this.contract.getRide(rideId)

      return {
        id: rideId.toString(),
        driver,
        passenger,
        fromLocation,
        toLocation,
        price: ethers.formatEther(price), // Convert Wei to ETH
        priceWei: price.toString(),
        status: Number(status),
        statusName: this._getStatusName(Number(status))
      }
    } catch (error) {
      console.error('Get ride failed:', error)
      throw this._handleError(error)
    }
  }

  /**
   * GET RIDE COUNT - Total number of rides created
   * @returns {Promise<number>} Total ride count
   */
  async getRideCount() {
    try {
      if (!this.contract) {
        await this.initProvider()
      }

      const count = await this.contract.rideCount()
      return Number(count)
    } catch (error) {
      console.error('Get ride count failed:', error)
      throw this._handleError(error)
    }
  }

  /**
   * GET ALL ACTIVE RIDES - Fetch all rides with Active status
   * @returns {Promise<Array>} Array of active rides
   */
  async getAllActiveRides() {
    try {
      const rideCount = await this.getRideCount()
      const rides = []

      for (let i = 0; i < rideCount; i++) {
        try {
          const ride = await this.getRide(i)
          if (ride.status === RideStatus.Active) {
            rides.push(ride)
          }
        } catch (err) {
          console.warn(`Failed to fetch ride ${i}:`, err)
        }
      }

      return rides
    } catch (error) {
      console.error('Get all active rides failed:', error)
      throw this._handleError(error)
    }
  }

  /**
   * GET USER RIDES - Fetch rides where user is driver or passenger
   * @param {string} userAddress - Wallet address
   * @returns {Promise<object>} User's rides categorized
   */
  async getUserRides(userAddress) {
    try {
      const rideCount = await this.getRideCount()
      const asDriver = []
      const asPassenger = []

      for (let i = 0; i < rideCount; i++) {
        try {
          const ride = await this.getRide(i)
          
          if (ride.driver.toLowerCase() === userAddress.toLowerCase()) {
            asDriver.push(ride)
          }
          
          if (ride.passenger.toLowerCase() === userAddress.toLowerCase()) {
            asPassenger.push(ride)
          }
        } catch (err) {
          console.warn(`Failed to fetch ride ${i}:`, err)
        }
      }

      return { asDriver, asPassenger }
    } catch (error) {
      console.error('Get user rides failed:', error)
      throw this._handleError(error)
    }
  }

  // ========================================
  // EVENT LISTENERS
  // ========================================

  /**
   * Listen for RideCreated events
   * @param {Function} callback - Callback function(rideId, driver, price)
   */
  onRideCreated(callback) {
    if (!this.contract) {
      throw new Error('Contract not initialized')
    }

    const listener = (rideId, driver, price, event) => {
      callback({
        rideId: rideId.toString(),
        driver,
        price: ethers.formatEther(price),
        priceWei: price.toString(),
        event
      })
    }

    this.contract.on('RideCreated', listener)
    this.eventListeners.set('RideCreated', listener)
  }

  /**
   * Listen for RideBooked events
   * @param {Function} callback - Callback function(rideId, passenger, amount)
   */
  onRideBooked(callback) {
    if (!this.contract) {
      throw new Error('Contract not initialized')
    }

    const listener = (rideId, passenger, amount, event) => {
      callback({
        rideId: rideId.toString(),
        passenger,
        amount: ethers.formatEther(amount),
        amountWei: amount.toString(),
        event
      })
    }

    this.contract.on('RideBooked', listener)
    this.eventListeners.set('RideBooked', listener)
  }

  /**
   * Listen for RideCompleted events
   * @param {Function} callback - Callback function(rideId)
   */
  onRideCompleted(callback) {
    if (!this.contract) {
      throw new Error('Contract not initialized')
    }

    const listener = (rideId, event) => {
      callback({
        rideId: rideId.toString(),
        event
      })
    }

    this.contract.on('RideCompleted', listener)
    this.eventListeners.set('RideCompleted', listener)
  }

  /**
   * Listen for PaymentReleased events
   * @param {Function} callback - Callback function(rideId, amount)
   */
  onPaymentReleased(callback) {
    if (!this.contract) {
      throw new Error('Contract not initialized')
    }

    const listener = (rideId, amount, event) => {
      callback({
        rideId: rideId.toString(),
        amount: ethers.formatEther(amount),
        amountWei: amount.toString(),
        event
      })
    }

    this.contract.on('PaymentReleased', listener)
    this.eventListeners.set('PaymentReleased', listener)
  }

  /**
   * Listen for RideCancelled events
   * @param {Function} callback - Callback function(rideId)
   */
  onRideCancelled(callback) {
    if (!this.contract) {
      throw new Error('Contract not initialized')
    }

    const listener = (rideId, event) => {
      callback({
        rideId: rideId.toString(),
        event
      })
    }

    this.contract.on('RideCancelled', listener)
    this.eventListeners.set('RideCancelled', listener)
  }

  /**
   * Remove all event listeners
   */
  removeAllListeners() {
    if (this.contract) {
      this.contract.removeAllListeners()
      this.eventListeners.clear()
    }
  }

  /**
   * Remove specific event listener
   * @param {string} eventName - Event name to remove
   */
  removeListener(eventName) {
    if (this.contract && this.eventListeners.has(eventName)) {
      const listener = this.eventListeners.get(eventName)
      this.contract.off(eventName, listener)
      this.eventListeners.delete(eventName)
    }
  }

  // ========================================
  // HELPER FUNCTIONS
  // ========================================

  _getStatusName(status) {
    const statusNames = ['Active', 'Booked', 'Completed', 'Cancelled']
    return statusNames[status] || 'Unknown'
  }

  _handleError(error) {
    // Extract user-friendly error messages
    if (error.reason) {
      return new Error(error.reason)
    }
    
    if (error.data?.message) {
      return new Error(error.data.message)
    }

    if (error.message) {
      // Clean up common error messages
      if (error.message.includes('user rejected')) {
        return new Error('Transaction was rejected')
      }
      if (error.message.includes('insufficient funds')) {
        return new Error('Insufficient funds for transaction')
      }
      return new Error(error.message)
    }

    return new Error('Transaction failed. Please try again.')
  }

  /**
   * Format price for display
   * @param {string|number} priceInEth - Price in ETH
   * @returns {string} Formatted price
   */
  formatPrice(priceInEth) {
    return `${parseFloat(priceInEth).toFixed(4)} ETH`
  }

  /**
   * Check if user has MetaMask installed
   * @returns {boolean}
   */
  isMetaMaskInstalled() {
    return typeof window.ethereum !== 'undefined'
  }
}

// Export singleton instance
const contractService = new ContractService()
export default contractService
