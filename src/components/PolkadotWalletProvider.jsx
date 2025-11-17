import React, { createContext, useState, useEffect, useCallback } from 'react'
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp'
import { decodeAddress } from '@polkadot/util-crypto'
import { u8aToHex } from '@polkadot/util'
import authService from '../services/authService'
import useWalletStore from '../store/walletStore'

// eslint-disable-next-line react-refresh/only-export-components
export const PolkadotWalletContext = createContext()

export function PolkadotWalletProvider({ children }) {
  const [accounts, setAccounts] = useState([])
  const [selectedAccount, setSelectedAccount] = useState(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState(null)

  const setStoreAccount = useWalletStore((state) => state.setSelectedAccount)
  const setIsConnected = useWalletStore((state) => state.setIsConnected)
  const storeDisconnect = useWalletStore((state) => state.disconnect)

  /**
   * Convert Substrate address to Ethereum-compatible H160 address
   * Moonbeam uses a truncated version of the public key
   */
  const substrateToEthAddress = useCallback((substrateAddress) => {
    try {
      // Decode the substrate address to get the public key
      const publicKey = decodeAddress(substrateAddress)
      
      // Convert to hex (Ethereum format) - take first 20 bytes
      const ethAddress = '0x' + u8aToHex(publicKey.slice(0, 20)).slice(2)
      
      return ethAddress
    } catch (err) {
      console.error('Address conversion error:', err)
      return null
    }
  }, [])

  /**
   * Format address for display
   */
  const formatAddress = useCallback((address) => {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }, [])

  /**
   * Select a specific account
   */
  const selectAccount = useCallback(async (account) => {
    try {
      setSelectedAccount(account)
      localStorage.setItem('polkadot_selected_account', account.address)

      const ethAddress = account.ethAddress

      console.log('✅ Selected Polkadot account:', {
        name: account.displayName,
        substrate: account.address,
        ethereum: ethAddress,
        source: account.source
      })

      // Update Zustand store for global state
      const accountData = {
        address: ethAddress,
        meta: { 
          name: account.displayName,
          source: 'polkadot',
          substrateAddress: account.address
        }
      }

      setStoreAccount(accountData)
      setIsConnected(true)

      // Create/update user in Appwrite
      try {
        await authService.loginWithWallet(ethAddress, account.displayName)
        console.log('✅ User authenticated in Appwrite')
      } catch (appwriteErr) {
        console.warn('⚠️ Appwrite auth warning:', appwriteErr.message)
        // Don't throw - allow wallet connection even if Appwrite fails
      }

    } catch (err) {
      console.error('❌ Account selection failed:', err)
      setError(err.message)
      throw err
    }
  }, [setStoreAccount, setIsConnected])

  /**
   * Connect to Polkadot wallet extensions
   */
  const connectWallet = useCallback(async () => {
    setIsConnecting(true)
    setError(null)

    try {
      // Enable Polkadot extensions (SubWallet, Talisman, Polkadot.js)
      const extensions = await web3Enable('RYDR')
      
      if (extensions.length === 0) {
        throw new Error('No Polkadot wallet extension found. Please install SubWallet, Talisman, or Polkadot.js Extension.')
      }

      console.log('✅ Polkadot extensions enabled:', extensions.map(e => e.name).join(', '))

      // Get all accounts from all extensions
      const allAccounts = await web3Accounts()
      
      if (allAccounts.length === 0) {
        throw new Error('No accounts found. Please create an account in your Polkadot wallet.')
      }

      console.log('✅ Found', allAccounts.length, 'Polkadot account(s)')

      // Process accounts and add Ethereum addresses
      const processedAccounts = allAccounts.map(account => {
        const ethAddress = account.type === 'ethereum' 
          ? account.address 
          : substrateToEthAddress(account.address)
        
        return {
          ...account,
          ethAddress,
          displayName: account.meta.name || 'Unnamed Account',
          source: account.meta.source
        }
      })

      setAccounts(processedAccounts)

      // Auto-select first account or restore from localStorage
      const savedAddress = localStorage.getItem('polkadot_selected_account')
      const accountToSelect = savedAddress 
        ? processedAccounts.find(acc => acc.address === savedAddress)
        : processedAccounts[0]

      if (accountToSelect) {
        await selectAccount(accountToSelect)
      }

      return processedAccounts

    } catch (err) {
      console.error('❌ Polkadot wallet connection failed:', err)
      setError(err.message)
      throw err
    } finally {
      setIsConnecting(false)
    }
  }, [substrateToEthAddress, selectAccount])

  /**
   * Disconnect wallet
   */
  const disconnectWallet = useCallback(() => {
    setSelectedAccount(null)
    setAccounts([])
    localStorage.removeItem('polkadot_selected_account')
    
    storeDisconnect()
    setIsConnected(false)
    
    console.log('✅ Polkadot wallet disconnected')
  }, [storeDisconnect, setIsConnected])

  /**
   * Auto-reconnect on page load if previously connected
   */
  useEffect(() => {
    const checkExistingConnection = async () => {
      const savedAddress = localStorage.getItem('polkadot_selected_account')
      if (savedAddress) {
        try {
          await connectWallet()
        } catch (err) {
          console.log('Auto-reconnect skipped:', err.message)
          localStorage.removeItem('polkadot_selected_account')
        }
      }
    }

    checkExistingConnection()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const value = {
    accounts,
    selectedAccount,
    isConnecting,
    error,
    connectWallet,
    selectAccount,
    disconnectWallet,
    formatAddress,
    isConnected: !!selectedAccount
  }

  return (
    <PolkadotWalletContext.Provider value={value}>
      {children}
    </PolkadotWalletContext.Provider>
  )
}
