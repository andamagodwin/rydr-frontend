import { create } from 'zustand'

const useWalletStore = create((set) => ({
  isConnected: false,
  selectedAccount: null,
  accounts: [],
  
  setIsConnected: (connected) => set({ isConnected: connected }),
  setSelectedAccount: (account) => set({ selectedAccount: account }),
  setAccounts: (accounts) => set({ accounts: accounts }),
  
  disconnect: () => set({ 
    isConnected: false, 
    selectedAccount: null, 
    accounts: [] 
  })
}))

export default useWalletStore
