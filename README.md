# 🚗 RYDR - Decentralized Ride-Sharing on Polkadot

<div align="center">
  
![RYDR Banner](https://img.shields.io/badge/Polkadot-Hackathon-E6007A?style=for-the-badge&logo=polkadot&logoColor=white)
![Moonbase Alpha](https://img.shields.io/badge/Moonbase-Alpha-53CBC9?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![ethers.js](https://img.shields.io/badge/ethers.js-6.11-2535a0?style=for-the-badge)

**A blockchain-powered ride-sharing platform built on Moonbase Alpha testnet for the Polkadot Hackathon**

[Live Demo](#) • [Smart Contract](https://moonbase.moonscan.io/address/0x3FaB021c51812af385ee95621b24Ce3A1e6ADc14) • [Documentation](#features)

</div>

---

## 🌟 About RYDR

RYDR is a decentralized ride-sharing application that leverages the power of Polkadot's ecosystem through Moonbase Alpha, an Ethereum-compatible parachain. By combining blockchain technology with real-world transportation needs, RYDR enables trustless, transparent, and secure peer-to-peer ride-sharing with built-in escrow payments.

### 🎯 Hackathon Submission Highlights

- **Polkadot Integration**: Native support for Polkadot wallets (SubWallet, Talisman, Polkadot.js Extension)
- **Dual Wallet Architecture**: Seamless compatibility with both MetaMask and Polkadot ecosystem wallets
- **Moonbase Alpha Deployment**: Fully deployed and tested on Moonbase Alpha testnet
- **Smart Contract Escrow**: Automated payment handling with trustless escrow system
- **Hybrid Storage**: Blockchain for payments + Appwrite for ride metadata/coordinates

---

## ✨ Features

### 🔐 Wallet Support
- **MetaMask** - Traditional Ethereum wallet integration
- **SubWallet** - Polkadot ecosystem wallet with EVM compatibility
- **Talisman** - Multi-chain wallet for Polkadot and Ethereum
- **Polkadot.js Extension** - Official Polkadot wallet support
- Automatic network switching to Moonbase Alpha
- Real-time DEV token balance display

### 🚙 Ride Management
- **Offer Rides** - Drivers create rides with route visualization
- **Find Rides** - Search and book available rides
- **My Rides** - Track offered and booked rides
- **My Account** - View wallet info, balances, and network details
- Real-time ride status updates (Active → Booked → Completed)

### 💰 Smart Contract Features
- **Escrow Payments** - Secure fund holding until ride completion
- **Automated Refunds** - Instant refunds on ride cancellation
- **Payment Release** - Passengers release funds after completion
- **Transparent Pricing** - All prices in DEV tokens (18 decimals)

### 🗺️ Advanced UI/UX
- Interactive Mapbox GL maps with route visualization
- Responsive design for mobile and desktop
- Real-time transaction status feedback
- Copy-to-clipboard for addresses
- Error boundary protection
- Particle background animations

---

## 🏗️ Architecture

### Technology Stack

**Frontend**
- React 18.3 + Vite
- ethers.js 6.11.0
- @polkadot/extension-dapp 0.47.6
- @polkadot/util-crypto
- Mapbox GL JS
- Tailwind CSS
- Zustand (State Management)

**Blockchain**
- Moonbase Alpha Testnet (Chain ID: 1287)
- Solidity 0.8.19
- Contract: `0x3FaB021c51812af385ee95621b24Ce3A1e6ADc14`

**Backend/Database**
- Appwrite Cloud (Metadata storage)
- Database Collections: Rides, Users

**APIs & Services**
- Mapbox Directions API
- Mapbox Geocoding API
- RPC: https://rpc.api.moonbase.moonbeam.network

### Smart Contract Overview

```solidity
// Key Functions
createRide(from, to, price) → rideId
bookRide(rideId) payable → escrow funds
markCompleted(rideId) → enables payment release
releasePayment(rideId) → transfers funds to driver
cancelRide(rideId) → refunds passenger
```

**Contract Address**: [0x3FaB021c51812af385ee95621b24Ce3A1e6ADc14](https://moonbase.moonscan.io/address/0x3FaB021c51812af385ee95621b24Ce3A1e6ADc14)

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- A Polkadot wallet (SubWallet/Talisman) or MetaMask
- DEV tokens on Moonbase Alpha ([Faucet](https://faucet.moonbeam.network/))

### Installation

```bash
# Clone the repository
git clone https://github.com/andamagodwin/rydr-frontend.git
cd rydr-frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your Mapbox token and Appwrite credentials

# Start development server
npm run dev
```

### Environment Variables

```env
VITE_MAPBOX_TOKEN=your_mapbox_token
VITE_APPWRITE_ENDPOINT=your_appwrite_endpoint
VITE_APPWRITE_PROJECT_ID=your_project_id
VITE_APPWRITE_DATABASE_ID=your_database_id
VITE_APPWRITE_RIDES_COLLECTION_ID=your_collection_id
```

---

## 📖 User Guide

### For Drivers (Offer a Ride)

1. **Connect Wallet** - Choose MetaMask or Polkadot wallet (SubWallet/Talisman)
2. **Offer Ride** - Navigate to "Offer a Ride"
3. **Enter Details**:
   - From location (with autocomplete)
   - To location (with autocomplete)
   - Departure date & time
   - Available seats
   - Price per seat in DEV (e.g., 0.05 DEV)
   - Contact number
4. **Review Route** - View route on map with distance/duration
5. **Create Ride** - Confirm transaction in wallet
6. **Manage Rides** - View in "My Rides" → Offered tab
7. **Mark Complete** - After ride completion, mark as complete
8. **Receive Payment** - Passenger releases payment from escrow

### For Passengers (Book a Ride)

1. **Connect Wallet** - Connect your preferred wallet
2. **Find Rides** - Browse available rides with route preview
3. **View Details** - Check route, price, driver info, seats available
4. **Book & Pay** - Send DEV tokens to escrow contract
5. **Track Ride** - View in "My Rides" → Booked tab
6. **Complete Ride** - After ride, release payment to driver
7. **Cancel** - Get automatic refund if cancelled before completion

---

## 🔗 Polkadot Integration Details

### Why Moonbase Alpha?

Moonbase Alpha is Moonbeam's testnet on the Polkadot ecosystem, providing:
- **EVM Compatibility** - Deploy Solidity contracts with minimal changes
- **Polkadot Connectivity** - Access to Polkadot's cross-chain features
- **Native Token** - DEV token for gas and payments
- **Fast Finality** - 12-second block times with GRANDPA consensus
- **Testnet Faucet** - Free DEV tokens for testing

### Wallet Integration Flow

```
User Connects Wallet
    ↓
[Polkadot Wallet]                [MetaMask]
    ↓                                ↓
web3Enable() → Get accounts    window.ethereum
    ↓                                ↓
Request EVM Address            Get address directly
    ↓                                ↓
Switch to Moonbase Alpha (Chain 1287)
    ↓
wallet_addEthereumChain (if needed)
    ↓
Create ethers.js signer with correct provider
    ↓
Sign transactions with native wallet UI
```

### Network Configuration

```javascript
{
  chainId: '0x507', // 1287 in decimal
  chainName: 'Moonbase Alpha',
  nativeCurrency: {
    name: 'DEV',
    symbol: 'DEV',
    decimals: 18
  },
  rpcUrls: ['https://rpc.api.moonbase.moonbeam.network'],
  blockExplorerUrls: ['https://moonbase.moonscan.io/']
}
```

---

## 📊 Smart Contract Events

The RYDR contract emits the following events for tracking:

```solidity
event RideCreated(uint256 indexed rideId, address indexed driver, uint256 price)
event RideBooked(uint256 indexed rideId, address indexed passenger, uint256 amount)
event RideCompleted(uint256 indexed rideId)
event PaymentReleased(uint256 indexed rideId, address indexed driver, uint256 amount)
event RideCancelled(uint256 indexed rideId, address indexed cancelledBy)
```

---

## 🛠️ Development

### Project Structure

```
rydr-frontend/
├── src/
│   ├── components/
│   │   ├── ConnectWallet.jsx          # Wallet connection modal
│   │   ├── PolkadotWalletProvider.jsx # Polkadot wallet integration
│   │   ├── EthereumWalletProvider.jsx # MetaMask integration
│   │   ├── OfferRide.jsx              # Create ride form
│   │   ├── FindRide.jsx               # Browse rides
│   │   ├── MyRides.jsx                # Manage offered/booked rides
│   │   ├── MyAccount.jsx              # Account info & balance
│   │   ├── Payment.jsx                # Book ride & payment
│   │   └── Navbar.jsx                 # Navigation with wallet UI
│   ├── services/
│   │   ├── contractService.js         # Smart contract interactions
│   │   ├── rideService.js             # Appwrite database operations
│   │   └── authService.js             # User authentication
│   ├── config/
│   │   ├── contract.js                # ABI & contract address
│   │   └── appwrite.js                # Appwrite configuration
│   ├── store/
│   │   └── walletStore.js             # Zustand wallet state
│   └── hooks/
│       └── usePolkadotWallet.js       # Polkadot wallet hook
├── public/
│   └── animations/
│       └── car-driving-on-road.json   # Lottie animation
└── package.json
```

### Build for Production

```bash
npm run build
npm run preview
```

### Deploy to Vercel

```bash
vercel --prod
```

---

## 🧪 Testing

### Test Wallets
- MetaMask: Connect to Moonbase Alpha
- SubWallet: Enable Moonbase Alpha network
- Get DEV tokens: https://faucet.moonbeam.network/

### Test Scenarios
1. Create ride with MetaMask → Book with SubWallet
2. Cancel ride → Verify refund
3. Complete ride → Release payment
4. Multiple wallet switching

---

## 🎨 Design Decisions

### Why Dual Wallet Support?
- **Polkadot Hackathon Requirement** - Showcase Polkadot ecosystem integration
- **User Choice** - Support both communities (Ethereum + Polkadot)
- **EVM Compatibility** - Moonbase Alpha allows both wallet types
- **Future Cross-Chain** - Prepare for multi-chain expansion

### Why Hybrid Storage?
- **Blockchain** - Immutable payment records, escrow security
- **Appwrite** - Fast queries, geolocation data, user profiles
- **Cost Efficiency** - Reduce on-chain storage costs
- **Performance** - Quick UI updates without blockchain queries

---

## 🔐 Security Features

- Smart contract escrow prevents fund theft
- No private keys stored on frontend
- User signatures required for all transactions
- Network verification before each transaction
- Input validation on all forms
- Error boundaries for graceful failures

---

## 🚧 Known Limitations

- Testnet only (Moonbase Alpha)
- Map requires Mapbox token
- Appwrite setup needed for full functionality
- Network switching may require manual wallet approval

---

## 📜 License

MIT License - see [LICENSE](LICENSE) file for details

---

## 🤝 Contributing

This project was built for the Polkadot Hackathon. Contributions welcome!

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 👨‍💻 Author

**Godwin Andama**
- GitHub: [@andamagodwin](https://github.com/andamagodwin)
- Hackathon Project: RYDR - Decentralized Ride-Sharing

---

## 🙏 Acknowledgments

- **Polkadot** - For the amazing ecosystem and hackathon
- **Moonbeam** - For Moonbase Alpha testnet and documentation
- **Parity Technologies** - For Polkadot.js libraries
- **Mapbox** - For mapping and routing APIs
- **Appwrite** - For backend services

---

## 📞 Support

For hackathon judges or questions:
- Open an issue on GitHub
- Check the [documentation](./POLKADOT_INTEGRATION.md)
- Review [deployment checklist](./DEPLOYMENT_CHECKLIST.md)

---

<div align="center">

**Built with ❤️ for the Polkadot Hackathon**

[⭐ Star this repo](https://github.com/andamagodwin/rydr-frontend) if you find it useful!

</div>
