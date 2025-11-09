import React, { useState, useEffect } from 'react'
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp'
import { WalletContext } from '../context/walletContext'
import useWalletStore from '../store/walletStore'

export function WalletProvider({ children }) {
  const [accounts, setAccounts] = useState([])
  const [selectedAccount, setSelectedAccount] = useState(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState(null)

  const {
    setIsConnected,
    setSelectedAccount: setStoreAccount,
    setAccounts: setStoreAccounts,
    disconnect: storeDisconnect
  } = useWalletStore()

  // Check for existing connection on mount
  useEffect(() => {
    checkConnection()
  }, [])

  useEffect(() => {
    setStoreAccounts(accounts)
  }, [accounts, setStoreAccounts])

  useEffect(() => {
    setStoreAccount(selectedAccount)
    setIsConnected(!!selectedAccount)
  }, [selectedAccount, setStoreAccount, setIsConnected])

  const checkConnection = async () => {
    try {
      const extensions = await web3Enable('Rydr')
      if (extensions.length === 0) {
        return
      }

      const allAccounts = await web3Accounts()
      if (allAccounts.length > 0) {
        setAccounts(allAccounts)
        // Auto-select first account if previously connected
        const savedAccount = localStorage.getItem('selectedAccount')
        if (savedAccount) {
          const account = allAccounts.find(acc => acc.address === savedAccount)
          if (account) {
            setSelectedAccount(account)
          }
        }
      }
    } catch (err) {
      console.error('Error checking connection:', err)
    }
  }

  const connectWallet = async () => {
    setIsConnecting(true)
    setError(null)

    try {
      // Enable the Polkadot extension
      const extensions = await web3Enable('Rydr')

      if (extensions.length === 0) {
        throw new Error('No Polkadot extension found. Please install Polkadot.js or Talisman wallet.')
      }

      // Get all accounts
      const allAccounts = await web3Accounts()

      if (allAccounts.length === 0) {
        throw new Error('No accounts found. Please create an account in your Polkadot wallet.')
      }

      setAccounts(allAccounts)
      
      // Auto-select first account
      setSelectedAccount(allAccounts[0])
      localStorage.setItem('selectedAccount', allAccounts[0].address)

      return allAccounts
    } catch (err) {
      setError(err.message)
      console.error('Error connecting wallet:', err)
      throw err
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = () => {
    setSelectedAccount(null)
    setAccounts([])
    localStorage.removeItem('selectedAccount')
    storeDisconnect()
  }

  const selectAccount = (account) => {
    setSelectedAccount(account)
    localStorage.setItem('selectedAccount', account.address)
  }

  const formatAddress = (address) => {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const value = {
    accounts,
    selectedAccount,
    isConnecting,
    error,
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
