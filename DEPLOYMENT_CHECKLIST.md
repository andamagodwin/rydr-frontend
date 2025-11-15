# ✅ Deployment Checklist

Before deploying your RYDR application with Ethereum integration, complete these steps:

## 1. Smart Contract Deployment

- [ ] Deploy `RydrRide.sol` to your chosen network
  - Local: Hardhat node (`npx hardhat node`)
  - Testnet: Sepolia, Mumbai, etc.
  - Mainnet: Ethereum, Polygon, etc.

- [ ] Save the deployed contract address

- [ ] Verify contract on block explorer (for testnets/mainnet)
  ```bash
  npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
  ```

## 2. Environment Configuration

- [ ] Copy `.env.example` to `.env`
  ```bash
  cp .env.example .env
  ```

- [ ] Update `VITE_CONTRACT_ADDRESS` with your deployed contract address

- [ ] Set `VITE_RPC_URL` to your network's RPC endpoint
  - Local: `http://127.0.0.1:8545`
  - Infura: `https://sepolia.infura.io/v3/YOUR_KEY`
  - Alchemy: `https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY`

- [ ] Set `VITE_CHAIN_ID` to match your network
  - Local Hardhat: `31337`
  - Sepolia: `11155111`
  - Polygon Mumbai: `80001`
  - Ethereum Mainnet: `1`
  - Polygon Mainnet: `137`

## 3. Frontend Setup

- [ ] Install dependencies
  ```bash
  npm install
  ```

- [ ] Verify no build errors
  ```bash
  npm run build
  ```

- [ ] Test locally
  ```bash
  npm run dev
  ```

## 4. MetaMask Configuration

- [ ] Install MetaMask extension

- [ ] Add your network to MetaMask (if custom network)
  - Network Name: e.g., "Localhost 8545"
  - RPC URL: Same as `VITE_RPC_URL`
  - Chain ID: Same as `VITE_CHAIN_ID`
  - Currency Symbol: ETH (or MATIC for Polygon)

- [ ] Import test accounts (for local development)

- [ ] Get test tokens from faucets (for testnets)
  - Sepolia: https://sepoliafaucet.com/
  - Mumbai: https://mumbaifaucet.com/

## 5. Testing

### Driver Flow
- [ ] Connect wallet
- [ ] Create a ride in "Offer Ride"
- [ ] Verify transaction on block explorer
- [ ] Check ride appears in "Find Ride"

### Passenger Flow
- [ ] Connect different wallet/account
- [ ] Find and view ride on map
- [ ] Book ride and pay
- [ ] Verify payment is held in contract
- [ ] Release payment after ride

### Cancellation Flow
- [ ] Create and book a ride
- [ ] Cancel before completion
- [ ] Verify refund is received

## 6. Smart Contract Functions Test

Test each function:
- [ ] `createRide()` - Creates ride successfully
- [ ] `bookRide()` - Books ride and sends payment
- [ ] `markCompleted()` - Driver marks complete
- [ ] `releasePayment()` - Passenger releases funds
- [ ] `cancelRide()` - Cancels and refunds

## 7. Event Monitoring

- [ ] Check browser console for event logs
- [ ] Verify events fire on each action:
  - [ ] RideCreated
  - [ ] RideBooked
  - [ ] RideCompleted
  - [ ] PaymentReleased
  - [ ] RideCancelled

## 8. UI/UX Verification

- [ ] Wallet connection works smoothly
- [ ] Account switching updates UI
- [ ] Network switching shows warning
- [ ] Transaction status displays correctly
- [ ] Error messages are user-friendly
- [ ] Loading states work properly
- [ ] Transaction links open correctly

## 9. Gas Optimization Check

- [ ] Estimate gas for each function
- [ ] Ensure gas limits are reasonable
- [ ] Test with low gas price (testnet)

## 10. Security Checks

- [ ] Contract address is correct in `.env`
- [ ] No private keys in code
- [ ] `.env` is in `.gitignore`
- [ ] RPC URL is secure (HTTPS for production)
- [ ] Contract is verified on explorer

## 11. Documentation

- [ ] Read `ETHEREUM_INTEGRATION.md`
- [ ] Review `MIGRATION_SUMMARY.md`
- [ ] Understand all contract functions
- [ ] Know how to troubleshoot common issues

## 12. Production Ready (Optional)

- [ ] Set up CI/CD pipeline
- [ ] Configure production environment variables
- [ ] Set up monitoring/alerting
- [ ] Implement analytics
- [ ] Add error tracking (Sentry, etc.)
- [ ] Optimize bundle size
- [ ] Enable service worker/PWA
- [ ] Set up HTTPS/SSL

## 13. Deployment

- [ ] Build production bundle
  ```bash
  npm run build
  ```

- [ ] Test production build locally
  ```bash
  npm run preview
  ```

- [ ] Deploy to hosting (Vercel, Netlify, etc.)

- [ ] Set environment variables on hosting platform

- [ ] Verify deployment works correctly

## 14. Post-Deployment

- [ ] Test all flows on live site
- [ ] Monitor for errors
- [ ] Check transaction success rates
- [ ] Gather user feedback
- [ ] Plan feature iterations

---

## 🚨 Common Issues & Solutions

### Issue: MetaMask not connecting
**Solution**: Ensure MetaMask is installed and unlocked. Refresh the page.

### Issue: Wrong network
**Solution**: Switch to correct network in MetaMask. App should detect and prompt.

### Issue: Transaction fails
**Solution**: Check gas balance, verify contract address, ensure correct network.

### Issue: Rides not loading
**Solution**: Verify contract address, check RPC URL, ensure network connectivity.

### Issue: High gas costs
**Solution**: Use L2 solutions (Polygon, Arbitrum) or wait for lower gas periods.

---

## 📞 Need Help?

1. Check browser console for errors
2. Review `ETHEREUM_INTEGRATION.md`
3. Test on local network first
4. Verify contract deployment
5. Check MetaMask activity tab

---

**🎉 Good luck with your deployment!**
