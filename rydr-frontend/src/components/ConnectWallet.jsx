import React from 'react'

function ConnectWallet() {
  return (
    <div className="bg-white flex items-center justify-center py-20">
      <div className="text-center max-w-md mx-auto">
        <div className="w-24 h-24 bg-primary bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-primary mb-4">Connect Wallet</h1>
        <p className="text-xl text-gray-600 mb-8">Connect your cryptocurrency wallet to get started</p>
        <div className="space-y-4">
          <button className="w-full bg-primary text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-opacity-90 transition-colors">
            Connect MetaMask
          </button>
          <button className="w-full border-2 border-primary text-primary px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary hover:text-white transition-colors">
            Connect WalletConnect
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConnectWallet