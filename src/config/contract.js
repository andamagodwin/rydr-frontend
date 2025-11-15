// RydrRide Smart Contract Configuration

// Contract ABI - Generated from Solidity contract
export const RYDR_CONTRACT_ABI = 
  [
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "rideId",
				"type": "uint256"
			}
		],
		"name": "bookRide",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "rideId",
				"type": "uint256"
			}
		],
		"name": "cancelRide",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "fromLocation",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "toLocation",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			}
		],
		"name": "createRide",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "rideId",
				"type": "uint256"
			}
		],
		"name": "markCompleted",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "rideId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "PaymentReleased",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "rideId",
				"type": "uint256"
			}
		],
		"name": "releasePayment",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "rideId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "passenger",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "RideBooked",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "rideId",
				"type": "uint256"
			}
		],
		"name": "RideCancelled",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "rideId",
				"type": "uint256"
			}
		],
		"name": "RideCompleted",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "rideId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "driver",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			}
		],
		"name": "RideCreated",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "rideId",
				"type": "uint256"
			}
		],
		"name": "getRide",
		"outputs": [
			{
				"internalType": "address",
				"name": "driver",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "passenger",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "fromLocation",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "toLocation",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			},
			{
				"internalType": "enum RydrRide.RideStatus",
				"name": "status",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "rideCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "rides",
		"outputs": [
			{
				"internalType": "address payable",
				"name": "driver",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "fromLocation",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "toLocation",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			},
			{
				"internalType": "enum RydrRide.RideStatus",
				"name": "status",
				"type": "uint8"
			},
			{
				"internalType": "address payable",
				"name": "passenger",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]


// Contract Address - UPDATE THIS with your deployed contract address
export const RYDR_CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000'

// RPC URL - UPDATE THIS with your network RPC
export const RPC_URL = import.meta.env.VITE_RPC_URL || 'http://127.0.0.1:8545'

// Chain ID - UPDATE THIS with your network chain ID
// Default: 1287 (Moonbase Alpha), Common: 31337 (Hardhat), 11155111 (Sepolia), 8453 (Base)
export const CHAIN_ID = parseInt(import.meta.env.VITE_CHAIN_ID || '1287')

// Ride Status enum (matching Solidity)
export const RideStatus = {
  Active: 0,
  Booked: 1,
  Completed: 2,
  Cancelled: 3
}

// Helper to get status name
export const getRideStatusName = (status) => {
  const statusNames = ['Active', 'Booked', 'Completed', 'Cancelled']
  return statusNames[status] || 'Unknown'
}
