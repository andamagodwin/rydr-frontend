# 🚗 RYDR - Ethereum Smart Contract Integration Guide

This project has been migrated from Polkadot to **Ethereum** using **ethers.js** and a **Solidity smart contract** for decentralized ride-sharing with escrow functionality.

---

## 📋 Overview

RYDR is a decentralized ride-sharing platform where:
- **Drivers** create rides by calling `createRide()`
- **Passengers** book rides by paying the price via `bookRide()`
- Payments are held in escrow in the smart contract
- **Drivers** mark rides as completed via `markCompleted()`
- **Passengers** release payment to drivers via `releasePayment()`
- Either party can cancel rides via `cancelRide()` (refund if paid)

---

## 🔧 Setup Instructions

### 1. **Install Dependencies**

```bash
npm install
```

Key dependencies installed:
- `ethers@^6.11.0` - Ethereum library for blockchain interactions
- `mapbox-gl` - Map visualization
- `react`, `react-router-dom` - Frontend framework

### 2. **Configure Environment Variables**

Create a `.env` file in the project root:

```bash
# Smart Contract Configuration
VITE_CONTRACT_ADDRESS=0xYourDeployedContractAddress
VITE_RPC_URL=http://127.0.0.1:8545
VITE_CHAIN_ID=31337

# Example for testnets:
# Sepolia: VITE_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
# Sepolia: VITE_CHAIN_ID=11155111

# Polygon Mumbai: VITE_RPC_URL=https://rpc-mumbai.maticvigil.com
# Polygon Mumbai: VITE_CHAIN_ID=80001
```

### 3. **Deploy the Smart Contract**

The smart contract is located in your Solidity project. Deploy it to your chosen network:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract RydrRide {
    // ... (your contract code)
}
```

**Deployment steps:**
1. Use Hardhat, Foundry, or Remix to deploy
2. Copy the deployed contract address
3. Update `VITE_CONTRACT_ADDRESS` in `.env`

Example with Hardhat:
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

### 4. **Install MetaMask**

Users need MetaMask or another Web3 wallet extension:
- Install from: https://metamask.io/
- Add your test network (e.g., Sepolia, Mumbai)
- Get test tokens from faucets

### 5. **Run the Application**

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

---

## 📁 Project Structure

```
src/
├── components/
│   ├── EthereumWalletProvider.jsx   # MetaMask wallet connection
│   ├── FindRide.jsx                 # Browse & search rides (from blockchain)
│   ├── OfferRide.jsx                # Create ride (calls createRide)
│   ├── Payment.jsx                  # Book, release payment, cancel
│   └── ...
├── config/
│   └── contract.js                  # Contract ABI & address
├── services/
│   └── contractService.js           # All blockchain interactions
├── hooks/
│   └── useContractEvents.js         # Event listeners hook
└── ...
```

---

## 🛠️ Smart Contract Functions

### **contractService.js** provides these methods:

#### **Write Functions (Transactions)**

```javascript
// Create a new ride (driver)
await contractService.createRide(fromLocation, toLocation, priceInEth)
// Returns: { success, transactionHash, rideId, blockNumber }

// Book a ride (passenger pays)
await contractService.bookRide(rideId, priceInEth)
// Returns: { success, transactionHash, blockNumber }

// Mark ride as completed (driver)
await contractService.markCompleted(rideId)
// Returns: { success, transactionHash, blockNumber }

// Release payment to driver (passenger)
await contractService.releasePayment(rideId)
// Returns: { success, transactionHash, blockNumber }

// Cancel ride and refund (driver or passenger)
await contractService.cancelRide(rideId)
// Returns: { success, transactionHash, blockNumber }
```

#### **Read Functions (View)**

```javascript
// Get ride details
const ride = await contractService.getRide(rideId)
// Returns: { id, driver, passenger, fromLocation, toLocation, price, priceWei, status, statusName }

// Get total ride count
const count = await contractService.getRideCount()

// Get all active rides
const rides = await contractService.getAllActiveRides()

// Get user's rides
const { asDriver, asPassenger } = await contractService.getUserRides(userAddress)
```

#### **Event Listeners**

```javascript
// Listen for new rides
contractService.onRideCreated((data) => {
  console.log('New ride:', data.rideId, data.driver, data.price)
})

// Listen for bookings
contractService.onRideBooked((data) => {
  console.log('Ride booked:', data.rideId, data.passenger, data.amount)
})

// Listen for completions
contractService.onRideCompleted((data) => {
  console.log('Ride completed:', data.rideId)
})

// Listen for payments
contractService.onPaymentReleased((data) => {
  console.log('Payment released:', data.rideId, data.amount)
})

// Listen for cancellations
contractService.onRideCancelled((data) => {
  console.log('Ride cancelled:', data.rideId)
})

// Remove all listeners
contractService.removeAllListeners()
```

---

## 🎯 Usage Flow

### **For Drivers:**

1. **Connect Wallet** - Click "Connect Wallet" and approve MetaMask
2. **Offer Ride** - Navigate to "Offer Ride"
3. Fill in ride details (from, to, price in ETH)
4. Click "Post Ride" → MetaMask prompts to sign transaction
5. Ride is created on-chain and visible to passengers

### **For Passengers:**

1. **Connect Wallet** - Connect MetaMask
2. **Find Ride** - Browse available rides on the map/list
3. **Book Ride** - Click "Request" → Navigate to Payment page
4. **Pay for Ride** - Click "Book Ride & Pay" → MetaMask prompts payment
5. Payment is held in escrow in smart contract
6. After ride completion, driver marks it complete
7. **Release Payment** - Passenger clicks "Release Payment" → Driver receives funds

### **Cancellation:**

- Either driver or passenger can cancel **before** ride completion
- If passenger paid, they get a full refund automatically

---

## 🔐 Security Features

- **Escrow System**: Payment held in contract until passenger releases
- **Access Control**: Only driver can mark completed; only passenger can release payment
- **Refund Protection**: Cancellations before completion trigger automatic refunds
- **Double-spend Prevention**: Price set to 0 after release to prevent double claims

---

## 🧪 Testing

### **Local Development (Hardhat)**

1. Start local blockchain:
```bash
npx hardhat node
```

2. Deploy contract:
```bash
npx hardhat run scripts/deploy.js --network localhost
```

3. Update `.env` with local contract address

4. Add localhost network to MetaMask:
   - Network Name: Localhost 8545
   - RPC URL: http://127.0.0.1:8545
   - Chain ID: 31337
   - Currency: ETH

5. Import test accounts from Hardhat into MetaMask

### **Testnet Testing**

Use Sepolia, Mumbai, or other testnets:
- Get test ETH from faucets
- Update RPC URL and Chain ID in `.env`
- Deploy contract to testnet
- Test all features

---

## 📊 Event Monitoring

Use the `useContractEvents` hook in components:

```javascript
import { useContractEvents } from '../hooks/useContractEvents'

function MyComponent() {
  useContractEvents({
    onRideCreated: (data) => {
      // Update UI when new ride is created
      console.log('New ride:', data)
    },
    onRideBooked: (data) => {
      // Update UI when ride is booked
      console.log('Ride booked:', data)
    },
    // ... other event handlers
  })

  return <div>...</div>
}
```

---

## 🐛 Troubleshooting

### **MetaMask not detected**
- Install MetaMask extension
- Refresh the page
- Check browser console for errors

### **Transaction fails**
- Ensure you have enough ETH for gas fees
- Check you're on the correct network
- Verify contract address in `.env`

### **Rides not loading**
- Check contract is deployed
- Verify RPC URL is correct
- Open browser console for errors
- Try refreshing the page

### **Wrong network**
- MetaMask will show a warning
- Switch to the correct network in MetaMask
- Page may auto-reload

---

## 📝 Notes

- **Price Format**: Prices are in ETH (e.g., "0.01" for 0.01 ETH)
- **Gas Fees**: Users pay gas fees for all transactions
- **Blockchain Finality**: Wait for transaction confirmations
- **Event Delays**: Events may take a few seconds to appear
- **Off-chain Data**: Only fromLocation, toLocation, and price are on-chain. Other metadata (driver name, vehicle info, etc.) would need off-chain storage if required.

---

## 🚀 Future Enhancements

- Add IPFS for storing additional ride metadata
- Implement rating system on-chain
- Add dispute resolution mechanism
- Multi-token payment support (ERC20)
- Mobile app with WalletConnect

---

## 📄 License

MIT

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

**Happy Riding! 🚗💨**
