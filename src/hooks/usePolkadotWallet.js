import { useContext } from 'react'
import { PolkadotWalletContext } from '../components/PolkadotWalletProvider'

export function usePolkadotWallet() {
  const context = useContext(PolkadotWalletContext)
  if (!context) {
    throw new Error('usePolkadotWallet must be used within PolkadotWalletProvider')
  }
  return context
}
