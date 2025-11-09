import { create } from 'zustand'

const useWalletStore = create((set) => ({
  isConnected: false,
  selectedAccount: null,
  accounts: [],
  
  setIsConnected: (connected) => {
    console.log('Zustand Store - setIsConnected called with:', connected)
    set({ isConnected: connected })
  },
  setSelectedAccount: (account) => {
    console.log('Zustand Store - setSelectedAccount called with:', account?.address)
    set({ selectedAccount: account })
  },
  setAccounts: (accounts) => {
    console.log('Zustand Store - setAccounts called with count:', accounts.length)
    set({ accounts: accounts })
  },
  
  disconnect: () => {
    console.log('Zustand Store - disconnect called')
    set({ 
      isConnected: false, 
      selectedAccount: null, 
      accounts: [] 
    })
  }
}))

export default useWalletStore
