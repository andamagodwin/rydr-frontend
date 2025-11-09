import React, { useState, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useWallet } from '../hooks/useWallet'

// Placeholder conversion: fake rate just for display. No blockchain interaction here.
const MOCK_DOT_RATE = 10000 // 1 DOT ≈ 10,000 UGX (placeholder)

function Payment() {
	const location = useLocation()
	const navigate = useNavigate()
	const { selectedAccount, isConnected, formatAddress } = useWallet()

	// Ride data should be passed via route state from FindRide
	const ride = location.state?.ride || null

	const [status, setStatus] = useState('idle') // idle | processing | success | error
	const [error, setError] = useState(null)

	const dotAmount = useMemo(() => {
		if (!ride) return '0.0000'
		return (ride.price / MOCK_DOT_RATE).toFixed(4)
	}, [ride])

	const handleMockPay = async () => {
		if (!ride) return
		setStatus('processing')
		setError(null)
		try {
			await new Promise((r) => setTimeout(r, 1200))
			setStatus('success')
		} catch {
			setError('Payment simulation failed.')
			setStatus('error')
		}
	}

	const handleGoBack = () => {
		navigate('/find-ride')
	}

	if (!ride) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
				<div className="max-w-md w-full bg-white rounded-xl shadow-md p-8 text-center">
					<h1 className="text-2xl font-bold text-primary mb-4">No Ride Selected</h1>
					<p className="text-gray-600 mb-6">You reached the payment page without selecting a ride. Please go back and pick a ride first.</p>
					<button onClick={handleGoBack} className="px-6 py-3 rounded-lg bg-primary text-white font-semibold hover:bg-opacity-90">Return to Rides</button>
				</div>
			</div>
		)
	}

	const formatUGX = (value) => new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX', minimumFractionDigits: 0 }).format(value)

	return (
		<div className="bg-gray-50 min-h-screen py-10">
			<div className="max-w-3xl mx-auto px-4">
				<div className="bg-white rounded-xl shadow-md p-8 mb-6">
					<h1 className="text-3xl font-bold text-primary mb-2">Ride Payment</h1>
					<p className="text-gray-600 mb-6">Review the ride details and confirm your payment. This is a placeholder; on-chain payment will be added later.</p>

					{/* Ride Summary */}
					<div className="grid sm:grid-cols-2 gap-6 mb-8">
						<div className="border rounded-lg p-4">
							<h2 className="font-semibold text-gray-700 mb-2">Route</h2>
							<p className="text-sm"><span className="text-gray-500">From:</span> {ride.from}</p>
							<p className="text-sm"><span className="text-gray-500">To:</span> {ride.to}</p>
							<p className="text-sm mt-2"><span className="text-gray-500">Driver:</span> {ride.driverName}</p>
							<p className="text-sm"><span className="text-gray-500">Rating:</span> {ride.rating}</p>
						</div>
						<div className="border rounded-lg p-4">
							<h2 className="font-semibold text-gray-700 mb-2">Amount</h2>
							<p className="text-lg font-bold text-primary mb-1">{formatUGX(ride.price)}</p>
							<p className="text-xs text-gray-500">≈ {dotAmount} DOT (placeholder)</p>
							<div className="mt-4">
								<p className="text-sm text-gray-600">Payment Method</p>
								<p className="text-sm font-medium">Polkadot Wallet (placeholder)</p>
							</div>
						</div>
					</div>

					{/* Wallet Section */}
					<div className="bg-gray-100 rounded-lg p-5 mb-6">
						<h2 className="font-semibold text-gray-700 mb-2">Your Wallet</h2>
						{isConnected && selectedAccount ? (
							<div>
								<p className="text-sm font-medium break-all">{selectedAccount.address}</p>
								<p className="text-xs text-gray-500 mt-1">{selectedAccount.meta?.name || 'Account'} ({formatAddress(selectedAccount.address)})</p>
							</div>
						) : (
							<div className="text-sm text-amber-700 bg-amber-100 px-3 py-2 rounded">Not connected. You can still simulate payment.</div>
						)}
					</div>

					{/* Status Messages */}
					{error && (
						<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>
					)}
					{status === 'success' && (
						<div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">Payment simulated successfully.</div>
					)}
					{status === 'processing' && (
						<div className="flex items-center space-x-2 text-primary mb-4">
							<svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
								<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
								<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
							</svg>
							<span className="text-sm font-medium">Processing placeholder payment...</span>
						</div>
					)}

					{/* Actions */}
					<div className="flex flex-col sm:flex-row gap-4">
						<button
							onClick={handleMockPay}
							disabled={status === 'processing' || status === 'success'}
							className="flex-1 bg-primary text-white px-6 py-4 rounded-lg font-semibold hover:bg-opacity-90 disabled:opacity-50"
						>
							{status === 'success' ? 'Paid (Placeholder)' : status === 'processing' ? 'Processing...' : 'Pay (Placeholder)'}
						</button>
						<button
							onClick={handleGoBack}
							className="px-6 py-4 rounded-lg border-2 border-gray-300 font-medium hover:border-primary"
						>
							Back to Rides
						</button>
					</div>

					{/* Future Implementation Note */}
					<div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
						<p><strong>Future:</strong> This will create and sign a Polkadot <code>balances.transfer</code> extrinsic using the selected account and show real on-chain status updates.</p>
					</div>
				</div>
			</div>
		</div>
	)
}

export default Payment

