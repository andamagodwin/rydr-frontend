import React, { useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'
import contractService from '../services/contractService'
import authService from '../services/authService'
import { WalletContext } from '../context/walletContext'
import useWalletStore from '../store/walletStore'
import { CHAIN_ID } from '../config/contract'

export function WalletProvider({ children }) {
  const [account, setAccount] = useState(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState(null)
  const [chainId, setChainId] = useState(null)
  const [balance, setBalance] = useState('0')

  const setStoreAccount = useWalletStore((state) => state.setSelectedAccount)
  const setIsConnected = useWalletStore((state) => state.setIsConnected)
  const storeDisconnect = useWalletStore((state) => state.disconnect)

  /**
   * Check if MetaMask is installed
   */
  const isMetaMaskInstalled = () => {
    return typeof window.ethereum !== 'undefined'
  }

  /**
   * Switch to the correct network
   */
  const switchToCorrectNetwork = useCallback(async () => {
    try {
      // Try to switch to Moonbase Alpha
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${CHAIN_ID.toString(16)}` }], // 1287 = 0x507
      })
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${CHAIN_ID.toString(16)}`,
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
        } catch (addError) {
          console.error('Failed to add network:', addError)
          throw new Error('Failed to add Moonbase Alpha network to MetaMask')
        }
      } else {
        throw switchError
      }
    }
  }, [])

  /**
   * Get user's balance
   */
  const getBalance = useCallback(async (address) => {
    try {
      if (!window.ethereum) return '0'
      
      const provider = new ethers.BrowserProvider(window.ethereum)
      const balanceWei = await provider.getBalance(address)
      const balanceEth = ethers.formatEther(balanceWei)
      return balanceEth
    } catch (err) {
      console.error('Failed to get balance:', err)
      return '0'
    }
  }, [])

  /**
   * Connect wallet - MetaMask/Ethereum wallet
   */
  const connectWallet = useCallback(async () => {
    setIsConnecting(true)
    setError(null)

    try {
      if (!isMetaMaskInstalled()) {
        throw new Error('Please install MetaMask or another Web3 wallet extension')
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      })

      if (accounts.length === 0) {
        throw new Error('No accounts found. Please create a wallet account first.')
      }

      const userAccount = accounts[0]

      // Get chain ID
      const provider = new ethers.BrowserProvider(window.ethereum)
      const network = await provider.getNetwork()
      const currentChainId = Number(network.chainId)
      setChainId(currentChainId)

      // Check if on correct network - if not, prompt to switch
      if (currentChainId !== CHAIN_ID) {
        console.log(
          `Connected to chain ${currentChainId}, switching to Moonbase Alpha (${CHAIN_ID})...`
        )
        await switchToCorrectNetwork()
        // After switching, the page will reload due to handleChainChanged
        return
      }

      // Get balance
      const userBalance = await getBalance(userAccount)
      setBalance(userBalance)

      // Initialize contract service
      await contractService.initSigner()

      // Login to Appwrite and create/update user document
      try {
        await authService.loginWithWallet(userAccount, 'MetaMask Account')
        console.log('User registered/updated in Appwrite')
      } catch (authError) {
        console.error('Failed to register user in Appwrite:', authError)
        // Don't throw - allow wallet connection even if Appwrite fails
      }

      // Store account info
      const accountData = {
        address: userAccount,
        meta: { name: 'MetaMask Account' }
      }

      setAccount(accountData)
      localStorage.setItem('selectedAccount', userAccount)
      setStoreAccount(accountData)
      setIsConnected(true)

      return accountData
    } catch (err) {
      const errorMessage = err?.message || 'Failed to connect wallet'
      setError(errorMessage)
      console.error('Wallet connection error:', err)
      throw err
    } finally {
      setIsConnecting(false)
    }
  }, [getBalance, setIsConnected, setStoreAccount, switchToCorrectNetwork])

  /**
   * Disconnect wallet
   */
  const disconnectWallet = useCallback(() => {
    setAccount(null)
    setBalance('0')
    setChainId(null)
    localStorage.removeItem('selectedAccount')
    storeDisconnect()
    setIsConnected(false)
  }, [storeDisconnect, setIsConnected])

  /**
   * Switch account (when user changes account in MetaMask)
   */
  const handleAccountsChanged = useCallback(async (accounts) => {
    if (accounts.length === 0) {
      disconnectWallet()
    } else if (accounts[0] !== account?.address) {
      const newAccount = accounts[0]
      const accountData = {
        address: newAccount,
        meta: { name: 'MetaMask Account' }
      }
      
      setAccount(accountData)
      localStorage.setItem('selectedAccount', newAccount)
      setStoreAccount(accountData)
      
      const userBalance = await getBalance(newAccount)
      setBalance(userBalance)
    }
  }, [account, disconnectWallet, getBalance, setStoreAccount])

  /**
   * Handle chain change
   */
  const handleChainChanged = useCallback((chainIdHex) => {
    const newChainId = parseInt(chainIdHex, 16)
    setChainId(newChainId)
    
    if (newChainId !== CHAIN_ID) {
      console.warn(
        `Network changed to ${newChainId}, expected ${CHAIN_ID}. Some features may not work.`
      )
    }
    
    // Reload page on chain change (recommended by MetaMask)
    window.location.reload()
  }, [])

  /**
   * Check for existing connection on mount
   */
  useEffect(() => {
    const checkConnection = async () => {
      const savedAccount = localStorage.getItem('selectedAccount')
      
      if (savedAccount && isMetaMaskInstalled()) {
        try {
          const accounts = await window.ethereum.request({
            method: 'eth_accounts'
          })
          
          if (accounts.includes(savedAccount)) {
            await connectWallet()
          }
        } catch (err) {
          console.error('Failed to restore connection:', err)
          localStorage.removeItem('selectedAccount')
        }
      }
    }

    checkConnection()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run on mount - connectWallet changes on every render

  /**
   * Set up event listeners for MetaMask
   */
  useEffect(() => {
    if (!window.ethereum) return

    window.ethereum.on('accountsChanged', handleAccountsChanged)
    window.ethereum.on('chainChanged', handleChainChanged)

    return () => {
      if (window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
        window.ethereum.removeListener('chainChanged', handleChainChanged)
      }
    }
  }, [handleAccountsChanged, handleChainChanged])

  /**
   * Refresh balance periodically
   */
  useEffect(() => {
    if (!account?.address) return

    const interval = setInterval(async () => {
      const newBalance = await getBalance(account.address)
      setBalance(newBalance)
    }, 30000) // Every 30 seconds

    return () => clearInterval(interval)
  }, [account, getBalance])

  /**
   * Format address for display (0x1234...5678)
   */
  const formatAddress = (address) => {
    if (!address) return ''
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  const contextValue = {
    // Account data
    account,
    accounts: account ? [account] : [],
    selectedAccount: account,
    balance,
    chainId,
    
    // Connection state
    isConnecting,
    isConnected: !!account,
    error,
    
    // Actions
    connectWallet,
    disconnectWallet,
    
    // Utilities
    isMetaMaskInstalled,
    formatAddress,
    
    // Legacy compatibility (for gradual migration)
    setSelectedAccount: (acc) => {
      setAccount(acc)
      setStoreAccount(acc)
    }
  }

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  )
}

export default WalletProvider
