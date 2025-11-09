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

  const setStoreAccounts = useWalletStore((state) => state.setAccounts)
  const setStoreAccount = useWalletStore((state) => state.setSelectedAccount)
  const setIsConnected = useWalletStore((state) => state.setIsConnected)
  const storeDisconnect = useWalletStore((state) => state.disconnect)

  const createAppwriteSession = useCallback(async (account) => {
    try {
      const result = await authService.loginWithWallet(
        account.address,
        account.meta?.name || 'Unnamed Account'
      )

      if (result?.session) {
        setAppwriteSession(result.session)
      }

      if (result?.user) {
        setAppwriteUser(result.user)
      }
    } catch (sessionError) {
      console.error('Failed to create Appwrite session:', sessionError)
    }
  }, [])

  const connectWallet = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsConnecting(true)
    setError(null)

    try {
      const extensions = await web3Enable('Rydr')

      if (extensions.length === 0) {
        throw new Error('No Polkadot wallet extension found. Please install Polkadot.js or Talisman.')
      }

      const allAccounts = await web3Accounts()

      if (allAccounts.length === 0) {
        throw new Error('No accounts found in your wallet. Please create an account first.')
      }

      setAccounts(allAccounts)
      setStoreAccounts(allAccounts)

      const savedAddress = localStorage.getItem('selectedAccount')
      let activeAccount = selectedAccount

      if (!activeAccount && savedAddress) {
        activeAccount = allAccounts.find((acc) => acc.address === savedAddress) || null
      }

      if (!activeAccount) {
        activeAccount = allAccounts[0]
      }

      if (activeAccount) {
        setSelectedAccount(activeAccount)
        localStorage.setItem('selectedAccount', activeAccount.address)
        setStoreAccount(activeAccount)
        setIsConnected(true)
        await createAppwriteSession(activeAccount)
      }

      return allAccounts
    } catch (err) {
      const errorMessage = err?.message || 'Failed to connect wallet'
      setError(errorMessage)
      throw err
    } finally {
      if (!isSilent) setIsConnecting(false)
    }
  }, [selectedAccount, createAppwriteSession, setIsConnected, setStoreAccount, setStoreAccounts])

  const checkExistingSession = useCallback(async () => {
    try {
      const session = await authService.getCurrentSession()
      if (session) {
        setAppwriteSession(session)
        await connectWallet(true)
      }
    } catch {
      console.log('No existing Appwrite session found')
    }
  }, [connectWallet])

  useEffect(() => {
    checkExistingSession()
  }, [checkExistingSession])

  const selectAccount = useCallback(async (account) => {
    setSelectedAccount(account)
    localStorage.setItem('selectedAccount', account.address)
    setStoreAccount(account)
    setIsConnected(true)
    await createAppwriteSession(account)
  }, [createAppwriteSession, setIsConnected, setStoreAccount])

  const disconnectWallet = useCallback(async () => {
    try {
      await authService.logout()
    } catch (logoutError) {
      console.error('Error logging out from Appwrite:', logoutError)
    } finally {
      setAccounts([])
      setSelectedAccount(null)
      setAppwriteSession(null)
      setAppwriteUser(null)
      setError(null)
      localStorage.removeItem('selectedAccount')
      storeDisconnect()
    }
  }, [storeDisconnect])

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
    formatAddress,
    isConnected: !!selectedAccount
  }

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}
