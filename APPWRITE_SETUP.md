# Appwrite Setup Guide for Rydr

## Overview
This guide will help you set up Appwrite for wallet-based authentication and ride management in your Rydr application.

## Step 1: Create Appwrite Account & Project

1. **Go to Appwrite Cloud**
   - Visit: https://cloud.appwrite.io/
   - Sign up for a free account or log in

2. **Create a New Project**
   - Click "Create Project"
   - Name: `rydr-app` (or your preferred name)
   - Copy the **Project ID** - you'll need this later

## Step 2: Configure Your Project

### Set Platform (Web App)

1. In your project dashboard, go to **Settings** → **Platforms**
2. Click **Add Platform** → **Web App**
3. Add platform details:
   - **Name**: Rydr Frontend
   - **Hostname**: `localhost` (for development)
   - Click **Next** and **Skip optional steps**

For production, add your production domain later.

## Step 3: Create Database

1. Go to **Databases** in the left sidebar
2. Click **Create Database**
3. Name: `rydr-database`
4. Copy the **Database ID** - you'll need this

## Step 4: Create Collections

### Collection 1: Users

1. Click **Create Collection**
2. Name: `users`
3. Copy the **Collection ID**
4. **Permissions**: 
   - Click **Settings** → **Permissions**
   - Add Role: **Any** with **Create**, **Read**, **Update** permissions

5. **Create Attributes** (click **Attributes** tab):
   
   | Attribute Key | Type | Size | Required | Default |
   |--------------|------|------|----------|---------|
   | `walletAddress` | String | 255 | Yes | - |
   | `walletName` | String | 100 | No | - |
   | `sessionId` | String | 255 | No | - |
   | `lastLogin` | String | 50 | No | - |

   > **Note**: `$createdAt` and `$updatedAt` are automatically provided by Appwrite for all documents.

6. **Create Indexes**:
   - Index Key: `walletAddress_index`
   - Type: Key
   - Attributes: `walletAddress`
   - Order: ASC

### Collection 2: Rides

1. Click **Create Collection**
2. Name: `rides`
3. Copy the **Collection ID**
4. **Permissions**: 
   - Role: **Any** with **Create**, **Read** permissions

5. **Create Attributes**:

   | Attribute Key | Type | Size | Required | Default |
   |--------------|------|------|----------|---------|
   | `driverWallet` | String | 255 | Yes | - |
   | `driverName` | String | 100 | Yes | - |
   | `driverPhone` | String | 20 | No | - |
   | `vehicleType` | String | 50 | Yes | - |
   | `vehicleMake` | String | 100 | No | - |
   | `vehicleModel` | String | 100 | No | - |
   | `vehicleColor` | String | 50 | No | - |
   | `registrationNumber` | String | 50 | Yes | - |
   | `from` | String | 255 | Yes | - |
   | `to` | String | 255 | Yes | - |
   | `date` | String | 50 | Yes | - |
   | `time` | String | 20 | Yes | - |
   | `seats` | String | 10 | Yes | - |
   | `price` | String | 50 | Yes | - |
   | `description` | String | 1000 | No | - |
   | `pickupCoordinates` | String | 255 | Yes | - |
   | `dropoffCoordinates` | String | 255 | Yes | - |
   | `status` | String | 50 | Yes | active |
   | `blockchainTxHash` | String | 255 | No | - |

   > **Note**: `$createdAt` and `$updatedAt` are automatically provided by Appwrite for all documents.
   > **Note**: `blockchainTxHash` will store the Polkadot transaction hash when the ride is confirmed on-chain.

6. **Create Indexes**:
   - Index 1: `status_index` (status - ASC)
   - Index 2: `driverWallet_index` (driverWallet - ASC)
   - Index 3: `from_search` (from - FULLTEXT)

## Step 5: Configure Environment Variables

1. Copy `.env.example` to `.env`:
   \`\`\`bash
   cp .env.example .env
   \`\`\`

2. Update `.env` with your IDs:
   \`\`\`env
   VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
   VITE_APPWRITE_PROJECT_ID=your_project_id_from_step_2
   VITE_APPWRITE_DATABASE_ID=your_database_id_from_step_3
   VITE_APPWRITE_USERS_COLLECTION_ID=users_collection_id_from_step_4
   VITE_APPWRITE_RIDES_COLLECTION_ID=rides_collection_id_from_step_4
   \`\`\`

## Step 6: Update Your Code

### Integrate Authentication in WalletProvider

Update \`src\` to integrate Appwrite auth when users connect their wallet.

Example integration in your wallet context:

\`\`\`javascript
import authService from '../services/authService'

// After successful wallet connection
const result = await authService.loginWithWallet(
  account.address,
  account.meta.name
)
\`\`\`

### Use Ride Service in OfferRide Component

\`\`\`javascript
import rideService from '../services/rideService'

// In handleSubmit
const ride = await rideService.createRide({
  driverWallet: selectedAccount.address,
  driverName: selectedAccount.meta.name,
  from: formData.from,
  to: formData.to,
  date: formData.date,
  time: formData.time,
  seats: formData.seats,
  price: formData.price,
  description: formData.description,
  pickupCoordinates: JSON.stringify(pickupLocation),
  dropoffCoordinates: JSON.stringify(dropoffLocation)
})
\`\`\`

## Step 7: Test the Setup

1. **Start your dev server**:
   \`\`\`bash
   npm run dev
   \`\`\`

2. **Test Authentication**:
   - Connect your Polkadot wallet
   - Check Appwrite Console → Database → users collection
   - You should see a new user document created

3. **Test Ride Creation**:
   - Offer a ride through your app
   - Check Appwrite Console → Database → rides collection
   - You should see the ride document

## Security Best Practices

1. **For Production**:
   - Update platform hostname to your production domain
   - Enable API key restrictions in Appwrite settings
   - Review and tighten permissions

2. **Never commit `.env`**:
   - Already in `.gitignore`
   - Share credentials securely with team members

3. **Use Server-Side API Keys**:
   - For admin operations, use server-side API keys
   - Never expose API keys in frontend code

## Troubleshooting

### Common Issues:

1. **"Project not found"**
   - Verify VITE_APPWRITE_PROJECT_ID is correct
   - Check platform is added with correct hostname

2. **"Unauthorized"**
   - Check collection permissions
   - Verify database ID and collection IDs are correct

3. **CORS Errors**
   - Add your domain to platform settings
   - For localhost, use `localhost` not `127.0.0.1`

## Next Steps

1. Implement real-time subscriptions for live ride updates
2. Add user profiles with ratings and reviews
3. Implement ride booking and payment tracking
4. Add push notifications for ride requests

## Resources

- [Appwrite Documentation](https://appwrite.io/docs)
- [Appwrite Web SDK](https://appwrite.io/docs/sdks#web)
- [Appwrite Console](https://cloud.appwrite.io/)
