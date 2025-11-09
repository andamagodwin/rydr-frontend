import React, { useState, useEffect, useCallback } from 'react'
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp'
import authService from '../services/authService'
import { WalletContext } from '../context/walletContext'
import useWalletStore from '../store/walletStore'

export function WalletProvider({ children }) {
  const [accounts, setAccounts] = useState([])
  const [selectedAccount, setSelectedAccount] = useState(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState(null)
  const [appwriteSession, setAppwriteSession] = useState(null)
  const [appwriteUser, setAppwriteUser] = useState(null)

  const connectWallet = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsConnecting(true)
    setError(null)

    try {
      // Enable Polkadot extension
      const extensions = await web3Enable('Rydr')
      
      if (extensions.length === 0) {
        throw new Error('No Polkadot wallet extension found. Please install Polkadot.js or Talisman.')
      }

      // Get all accounts
      const allAccounts = await web3Accounts()
      
      if (allAccounts.length === 0) {
        throw new Error('No accounts found in your wallet. Please create an account first.')
      }

  setAccounts(allAccounts)
  // Update Zustand store with accounts
  console.log('WalletProvider - Updating store accounts', allAccounts.length)
  useWalletStore.getState().setAccounts(allAccounts)
      
      // Auto-select first account if none selected
      if (!selectedAccount && allAccounts.length > 0) {
        const account = allAccounts[0]
        setSelectedAccount(account)
        
  // Update Zustand store
  console.log('WalletProvider - Setting store for new account', account.address)
  useWalletStore.getState().setSelectedAccount(account)
  useWalletStore.getState().setIsConnected(true)
        console.log('WalletProvider - Setting isConnected to true for new connection')
        
        // Create Appwrite session with wallet
        await createAppwriteSession(account)
      } else if (selectedAccount) {
        // Restore selected account session
        const account = allAccounts.find(acc => acc.address === selectedAccount.address)
        if (account) {
          // Update Zustand store
          console.log('WalletProvider - Setting store for existing account', account.address)
          useWalletStore.getState().setSelectedAccount(account)
          useWalletStore.getState().setIsConnected(true)
          console.log('WalletProvider - Setting isConnected to true for existing account')
          
          await createAppwriteSession(account)
        }
      }

      return allAccounts
    } catch (err) {
      const errorMessage = err.message || 'Failed to connect wallet'
      setError(errorMessage)
      throw err
    } finally {
      if (!isSilent) setIsConnecting(false)
    }
  }, [selectedAccount])

  const createAppwriteSession = async (account) => {
    try {
      const result = await authService.loginWithWallet(
        account.address,
        account.meta.name || 'Unnamed Account'
      )
      
      setAppwriteSession(result.session)
      setAppwriteUser(result.user)
      
      console.log('Appwrite session created:', result)
    } catch (error) {
      console.error('Failed to create Appwrite session:', error)
      // Don't throw - wallet is still connected even if Appwrite fails
    }
  }

  const checkExistingSession = useCallback(async () => {
    try {
      const session = await authService.getCurrentSession()
      if (session) {
        setAppwriteSession(session)
        // Try to restore wallet connection
        await connectWallet(true)
      }
    } catch {
      console.log('No existing session')
    }
  }, [connectWallet])

  // Check for existing session on mount
  useEffect(() => {
    checkExistingSession()
  }, [checkExistingSession])

  const selectAccount = async (account) => {
    setSelectedAccount(account)
    
    // Update Zustand store
    useWalletStore.getState().setSelectedAccount(account)
    
    await createAppwriteSession(account)
  }

  const disconnectWallet = async () => {
    try {
      // Logout from Appwrite
      if (appwriteSession) {
        await authService.logout()
      }
    } catch (error) {
      console.error('Error logging out from Appwrite:', error)
    } finally {
      setAccounts([])
      setSelectedAccount(null)
      setAppwriteSession(null)
      setAppwriteUser(null)
      setError(null)
      
      // Update Zustand store
      const { disconnect } = useWalletStore.getState()
      disconnect()
    }
  }

  const formatAddress = (address) => {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-6)}`
  }

  const value = {
    accounts,
    selectedAccount,
    isConnecting,
    error,
    appwriteSession,
    appwriteUser,
    connectWallet,
    disconnectWallet,
    selectAccount,
    formatAddress
  }

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}
