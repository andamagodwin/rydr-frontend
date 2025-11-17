import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Wallet, Copy, CheckCircle, LogOut, RefreshCw } from 'lucide-react'
import useWalletStore from '../store/walletStore'
import { usePolkadotWallet } from '../hooks/usePolkadotWallet'
import { useWallet } from '../hooks/useWallet'
import { ethers } from 'ethers'

function MyAccount() {
  const navigate = useNavigate()
  const isConnected = useWalletStore((state) => state.isConnected)
  const selectedAccount = useWalletStore((state) => state.selectedAccount)
  
  const polkadotWallet = usePolkadotWallet()
  const ethereumWallet = useWallet()
  
  const [balance, setBalance] = useState('0.0000')
  const [isLoadingBalance, setIsLoadingBalance] = useState(false)
  const [copiedAddress, setCopiedAddress] = useState(false)
  const [copiedSubstrate, setCopiedSubstrate] = useState(false)

  const isPolkadotWallet = selectedAccount?.meta?.source === 'polkadot'
  const walletType = isPolkadotWallet ? 'Polkadot' : 'MetaMask'

  const fetchBalance = async () => {
    if (!selectedAccount?.address) return
    
    setIsLoadingBalance(true)
    try {
      let ethereumProvider = window.ethereum

      // If Polkadot wallet is connected, find its specific provider
      if (isPolkadotWallet) {
        console.log('🔷 Fetching balance from Polkadot wallet provider')
        
        // SubWallet injects as window.SubWallet or in providers array
        if (window.SubWallet) {
          ethereumProvider = window.SubWallet
          console.log('✅ Using SubWallet provider for balance')
        } 
        else if (window.ethereum?.providers && Array.isArray(window.ethereum.providers)) {
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
      }

      if (!ethereumProvider) {
        setBalance('0.0000')
        return
      }

      const provider = new ethers.BrowserProvider(ethereumProvider)
      const balanceWei = await provider.getBalance(selectedAccount.address)
      const balanceDev = ethers.formatEther(balanceWei)
      console.log('💰 Balance fetched:', balanceDev, 'DEV')
      setBalance(parseFloat(balanceDev).toFixed(4))
    } catch (error) {
      console.error('Failed to fetch balance:', error)
      setBalance('0.0000')
    } finally {
      setIsLoadingBalance(false)
    }
  }

  const handleCopyAddress = async (address, type = 'ethereum') => {
    try {
      await navigator.clipboard.writeText(address)
      if (type === 'ethereum') {
        setCopiedAddress(true)
        setTimeout(() => setCopiedAddress(false), 2000)
      } else {
        setCopiedSubstrate(true)
        setTimeout(() => setCopiedSubstrate(false), 2000)
      }
    } catch (error) {
      console.error('Failed to copy address:', error)
    }
  }

  const handleDisconnect = () => {
    if (isPolkadotWallet) {
      polkadotWallet.disconnectWallet()
    } else {
      ethereumWallet.disconnect()
    }
    navigate('/')
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-md p-8 max-w-md w-full text-center">
          <Wallet className="mx-auto mb-4 text-gray-400" size={64} />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Wallet Connected</h2>
          <p className="text-gray-600 mb-6">
            Please connect your wallet to view your account information
          </p>
          <button
            onClick={() => navigate('/connect-wallet')}
            className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-3 rounded-full">
                <User className="text-primary" size={32} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">My Account</h1>
                <p className="text-gray-600 text-sm">Manage your wallet and profile</p>
              </div>
            </div>
            <button
              onClick={handleDisconnect}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={18} />
              <span>Disconnect</span>
            </button>
          </div>
        </div>

        {/* Balance Card */}
        <div className="bg-gradient-to-br from-primary to-primary/80 rounded-xl shadow-lg p-8 mb-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-medium opacity-90">Total Balance</h2>
            <button
              onClick={fetchBalance}
              disabled={isLoadingBalance}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh balance"
            >
              <RefreshCw className={isLoadingBalance ? 'animate-spin' : ''} size={20} />
            </button>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-5xl font-bold">{balance}</span>
            <span className="text-2xl font-semibold opacity-90">DEV</span>
          </div>
          <p className="text-sm opacity-75">Moonbase Alpha Testnet</p>
        </div>

        {/* Wallet Information */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Wallet Information</h2>
          
          <div className="space-y-4">
            {/* Wallet Type */}
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-gray-600 font-medium">Wallet Type</span>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  isPolkadotWallet 
                    ? 'bg-pink-100 text-pink-700' 
                    : 'bg-orange-100 text-orange-700'
                }`}>
                  {walletType}
                </span>
              </div>
            </div>

            {/* Account Name */}
            {selectedAccount?.meta?.name && (
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-gray-600 font-medium">Account Name</span>
                <span className="text-gray-800 font-semibold">{selectedAccount.meta.name}</span>
              </div>
            )}

            {/* Ethereum Address */}
            <div className="py-3 border-b border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 font-medium">Ethereum Address (H160)</span>
                <button
                  onClick={() => handleCopyAddress(selectedAccount.address, 'ethereum')}
                  className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
                >
                  {copiedAddress ? (
                    <>
                      <CheckCircle size={16} />
                      <span className="text-sm">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      <span className="text-sm">Copy</span>
                    </>
                  )}
                </button>
              </div>
              <p className="font-mono text-sm text-gray-700 bg-gray-50 p-3 rounded-lg break-all">
                {selectedAccount.address}
              </p>
            </div>

            {/* Substrate Address (for Polkadot wallets) */}
            {isPolkadotWallet && selectedAccount?.meta?.substrateAddress && (
              <div className="py-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 font-medium">Substrate Address</span>
                  <button
                    onClick={() => handleCopyAddress(selectedAccount.meta.substrateAddress, 'substrate')}
                    className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
                  >
                    {copiedSubstrate ? (
                      <>
                        <CheckCircle size={16} />
                        <span className="text-sm">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={16} />
                        <span className="text-sm">Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="font-mono text-sm text-gray-700 bg-gray-50 p-3 rounded-lg break-all">
                  {selectedAccount.meta.substrateAddress}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  This is your native Polkadot/Substrate address
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Network Information */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Network Information</h2>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-600">Network</span>
              <span className="text-gray-800 font-semibold">Moonbase Alpha</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-600">Chain ID</span>
              <span className="text-gray-800 font-mono">1287</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-600">Network Type</span>
              <span className="text-gray-800">Testnet</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-600">Currency</span>
              <span className="text-gray-800 font-semibold">DEV</span>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>💡 Note:</strong> Moonbase Alpha is a testnet. DEV tokens have no real value and are used for testing purposes only.
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <button
            onClick={() => navigate('/offer-ride')}
            className="bg-white hover:bg-gray-50 border-2 border-primary text-primary px-6 py-4 rounded-lg font-semibold transition-colors"
          >
            Offer a Ride
          </button>
          <button
            onClick={() => navigate('/my-rides')}
            className="bg-primary hover:bg-primary/90 text-white px-6 py-4 rounded-lg font-semibold transition-colors"
          >
            View My Rides
          </button>
        </div>
      </div>
    </div>
  )
}

export default MyAccount
