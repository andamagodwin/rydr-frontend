# Polkadot Wallet Integration Guide

## 🎉 What's New

RYDR now supports **dual wallet integration**:
- **Polkadot Wallets** (SubWallet, Talisman, Polkadot.js Extension)
- **MetaMask** (Ethereum wallet)

Both wallets work with your existing Moonbeam smart contract!

---

## 🔧 How It Works

### Moonbeam's Unified Accounts

Moonbeam uses **H160 Ethereum-style addresses** that can be accessed from both:
1. **Polkadot wallets** - Converts Substrate address → Ethereum address
2. **MetaMask** - Uses Ethereum address directly

**Example:**
- Polkadot address: `5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY`
- Same account on Moonbeam: `0x1234...5678`

This means:
- ✅ Connect with **SubWallet/Talisman**
- ✅ Get **Ethereum-compatible address**
- ✅ Interact with **existing smart contract**
- ✅ No changes needed to contract!

### Transaction Signing with Polkadot Wallets

The contract service now automatically detects which wallet you're using:
- **Polkadot wallet connected** → SubWallet/Talisman popup opens for signing
- **MetaMask connected** → MetaMask popup opens for signing

**Important:** If you have both MetaMask and SubWallet installed:
1. The system will automatically find the correct wallet
2. Checks `window.SubWallet` for SubWallet's provider
3. Checks `window.ethereum.providers` array for multiple wallets
4. Uses the Polkadot wallet you selected

---

## 📦 Installation

Already done! The following packages are installed:
- `@polkadot/extension-dapp` - Polkadot wallet integration
- `@polkadot/util-crypto` - Address conversion utilities

---

## 🚀 Testing Instructions

### Step 1: Install a Polkadot Wallet

Choose one:

**SubWallet (Recommended)**
- Website: https://subwallet.app/
- Chrome: https://chrome.google.com/webstore/detail/subwallet/
- Supports both Substrate and EVM accounts

**Talisman**
- Website: https://talisman.xyz/
- Beautiful UI, great UX

**Polkadot.js Extension**
- Website: https://polkadot.js.org/extension/
- Official Polkadot extension

### Step 2: Set Up Moonbase Alpha

1. Open your Polkadot wallet
2. Add **Moonbase Alpha** network
3. Create or import an account
4. Get testnet tokens: https://faucet.moonbeam.network/

### Step 3: Connect to RYDR

1. Open RYDR app (http://localhost:5173)
2. Click **"Connect Wallet"** button
3. Select **"Polkadot Wallet"** option
4. Choose your wallet extension (SubWallet/Talisman/Polkadot.js)
5. Select account
6. ✅ You're connected!

### Step 4: Verify Integration

Once connected, you should see:
- Your address displayed in navbar
- Pink "Polkadot" badge next to address
- Ability to create rides
- Ability to book rides
- All smart contract functions work!

---

## 🎯 Features

### Dual Wallet Support
- **Polkadot Wallet**: For identity, authentication, Polkadot ecosystem
- **MetaMask**: For EVM transactions (alternative option)

### Auto-Reconnect
- Wallet connection persists across page refreshes
- No need to reconnect every time

### Wallet Switching
- Disconnect from one wallet
- Connect to another seamlessly
- Both wallets use same contract

---

## 💡 Usage Examples

### Connect Polkadot Wallet (Code)

```javascript
import { usePolkadotWallet } from '../hooks/usePolkadotWallet'

function MyComponent() {
  const { connectWallet, selectedAccount, isConnecting } = usePolkadotWallet()

  const handleConnect = async () => {
    try {
      await connectWallet()
      console.log('Connected:', selectedAccount)
    } catch (err) {
      console.error('Failed to connect:', err)
    }
  }

  return (
    <button onClick={handleConnect} disabled={isConnecting}>
      {isConnecting ? 'Connecting...' : 'Connect Polkadot Wallet'}
    </button>
  )
}
```

### Get Ethereum Address from Polkadot Account

```javascript
const { selectedAccount } = usePolkadotWallet()

// selectedAccount.address = Substrate address
// selectedAccount.ethAddress = Ethereum H160 address (use for contract calls)

console.log('Substrate:', selectedAccount.address)
console.log('Ethereum:', selectedAccount.ethAddress)
```

---

## 🔍 Troubleshooting

### "No Polkadot wallet extension found"
**Solution:** Install SubWallet, Talisman, or Polkadot.js Extension

### "No accounts found"
**Solution:** Create an account in your Polkadot wallet first

### Address shows as `0x0000...` or `null`
**Solution:** 
- Make sure you're using a Moonbeam-compatible account
- SubWallet: Create an **Ethereum** account type
- Or wallet will auto-convert Substrate address

### Contract interaction fails
**Solution:**
- Verify you're on **Moonbase Alpha** network (Chain ID: 1287)
- Check you have DEV tokens (https://faucet.moonbeam.network/)
- Ensure contract address is correct in `.env`

---

## 🎓 For Hackathon Judges

### Polkadot Integration Highlights

1. **Uses Polkadot SDK**
   - `@polkadot/extension-dapp` for wallet integration
   - `@polkadot/util-crypto` for address conversion

2. **Ecosystem Integration**
   - SubWallet support
   - Talisman support
   - Polkadot.js Extension support

3. **Moonbeam Parachain**
   - Deployed on Moonbase Alpha
   - Utilizes Substrate + EVM dual layers
   - Shows understanding of Polkadot architecture

4. **Dual Wallet Architecture**
   - Polkadot wallets for identity/auth
   - MetaMask for EVM transactions
   - Demonstrates flexibility of Moonbeam

### Why This Qualifies for Polkadot Hackathon

- ✅ Uses Polkadot ecosystem SDKs
- ✅ Integrates with Polkadot wallets (tools)
- ✅ Deployed on Polkadot parachain (Moonbeam)
- ✅ Leverages Moonbeam's unique features
- ✅ Ready for XCM cross-chain integration (future)

---

## 📚 Documentation Links

- **Polkadot.js Extension**: https://polkadot.js.org/docs/extension/
- **SubWallet**: https://docs.subwallet.app/
- **Moonbeam**: https://docs.moonbeam.network/
- **Moonbase Alpha Faucet**: https://faucet.moonbeam.network/

---

## 🚀 Next Steps

### Possible Enhancements

1. **XCM Integration**
   - Accept payments from other parachains
   - Cross-chain token transfers

2. **Substrate Queries**
   - Use Polkadot.js API for on-chain data
   - Query balances, block info, etc.

3. **Multi-Signature Support**
   - Polkadot multi-sig for ride escrow
   - Enhanced security

4. **Identity Pallet**
   - Use Polkadot on-chain identity
   - Verified driver/passenger names

---

## ✅ Testing Checklist

- [ ] SubWallet installed and configured
- [ ] Moonbase Alpha network added
- [ ] DEV tokens received from faucet
- [ ] Connected Polkadot wallet to RYDR
- [ ] Address displayed in navbar
- [ ] Created a ride (offer ride)
- [ ] Viewed rides (find ride)
- [ ] Booked a ride (payment works)
- [ ] Status updates work (my rides)
- [ ] Disconnected and reconnected successfully

---

**Happy Testing! 🎉**

If you encounter any issues, check the browser console for detailed error messages.
