import React, { useState } from 'react'
import { useWallet } from '../hooks/useWallet'

function ConnectWallet() {
  const { accounts, selectedAccount, isConnecting, error, connectWallet, disconnectWallet, selectAccount } = useWallet()
  const [showAccountSelector, setShowAccountSelector] = useState(false)

  const handleConnect = async () => {
    try {
      await connectWallet()
    } catch (err) {
      console.error('Connection failed:', err)
    }
  }

  if (selectedAccount) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center py-20">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="text-4xl font-bold text-primary mb-4">Wallet Connected</h1>
          <p className="text-xl text-gray-600 mb-8">Your Polkadot wallet is successfully connected</p>
          
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">Connected Account</p>
              <p className="text-lg font-semibold text-gray-800 break-all">{selectedAccount.address}</p>
              <p className="text-sm text-gray-600 mt-2">
                {selectedAccount.meta.name || 'Unnamed Account'}
              </p>
            </div>
            
            {accounts.length > 1 && (
              <button
                onClick={() => setShowAccountSelector(!showAccountSelector)}
                className="text-primary hover:underline text-sm mt-2"
              >
                {showAccountSelector ? 'Hide' : 'Switch Account'}
              </button>
            )}
            
            {showAccountSelector && accounts.length > 1 && (
              <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
                {accounts.map((account) => (
                  <button
                    key={account.address}
                    onClick={() => {
                      selectAccount(account)
                      setShowAccountSelector(false)
                    }}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      account.address === selectedAccount.address
                        ? 'bg-primary bg-opacity-10 border-2 border-primary'
                        : 'bg-white border-2 border-gray-200 hover:border-primary'
                    }`}
                  >
                    <p className="font-semibold text-sm">{account.meta.name || 'Unnamed Account'}</p>
                    <p className="text-xs text-gray-600 truncate">{account.address}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={disconnectWallet}
            className="w-full border-2 border-red-500 text-red-500 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-red-500 hover:text-white transition-colors"
          >
            Disconnect Wallet
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white min-h-screen flex items-center justify-center py-20">
      <div className="text-center max-w-md mx-auto px-4">
        {/* Wallet Illustration */}
        <div className="mb-8">
          <img 
            src="/Wallet-bro.svg" 
            alt="Connect Wallet Illustration" 
            className="w-64 h-64 mx-auto"
          />
        </div>
        
        <h1 className="text-4xl font-bold text-primary mb-4">Connect Wallet</h1>
        <p className="text-xl text-gray-600 mb-8">Connect your Polkadot wallet to get started</p>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="w-full bg-primary text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isConnecting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Connecting...
              </>
            ) : (
              'Connect Polkadot Wallet'
            )}
          </button>
          
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
            <p className="text-sm">
              <strong>Note:</strong> You need to have Polkadot.js or Talisman wallet extension installed in your browser.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConnectWallet