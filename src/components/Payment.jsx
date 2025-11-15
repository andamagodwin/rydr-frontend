import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useWallet } from '../hooks/useWallet'
import contractService from '../services/contractService'
import { CheckCircle, XCircle, Loader, ArrowLeft } from 'lucide-react'

function Payment() {
	const location = useLocation()
	const navigate = useNavigate()
	const { selectedAccount, isConnected, balance } = useWallet()

	// Ride data should be passed via route state from FindRide
	const ride = location.state?.ride || null

	const [status, setStatus] = useState('idle') // idle | booking | booked | releasing | released | error
	const [error, setError] = useState(null)
	const [txHash, setTxHash] = useState(null)

	/**
	 * BOOK RIDE - Passenger pays and books the ride
	 */
	const handleBookRide = async () => {
		if (!ride) return

		if (!isConnected || !selectedAccount) {
			setError('Please connect your wallet to book this ride')
			return
		}

		setStatus('booking')
		setError(null)
		setTxHash(null)

		try {
			// Book the ride by sending payment
			const result = await contractService.bookRide(ride.id, ride.price)
			
			setTxHash(result.transactionHash)
			setStatus('booked')
			
			console.log('Ride booked successfully:', result)
		} catch (err) {
			console.error('Booking failed:', err)
			setError(err.message || 'Failed to book ride. Please try again.')
			setStatus('error')
		}
	}

	/**
	 * RELEASE PAYMENT - Passenger releases payment after ride completion
	 */
	const handleReleasePayment = async () => {
		if (!ride) return

		if (!isConnected || !selectedAccount) {
			setError('Please connect your wallet to release payment')
			return
		}

		setStatus('releasing')
		setError(null)

		try {
			const result = await contractService.releasePayment(ride.id)
			
			setTxHash(result.transactionHash)
			setStatus('released')
			
			console.log('Payment released successfully:', result)
		} catch (err) {
			console.error('Release payment failed:', err)
			setError(err.message || 'Failed to release payment. Please try again.')
			setStatus('error')
		}
	}

	/**
	 * CANCEL RIDE - Passenger or driver can cancel
	 */
	const handleCancelRide = async () => {
		if (!ride) return

		if (!isConnected || !selectedAccount) {
			setError('Please connect your wallet to cancel ride')
			return
		}

		const confirmed = window.confirm('Are you sure you want to cancel this ride? If you paid, you will receive a refund.')
		if (!confirmed) return

		try {
			const result = await contractService.cancelRide(ride.id)
			
			console.log('Ride cancelled successfully:', result)
			alert('Ride cancelled successfully. Redirecting...')
			
			navigate('/find-ride')
		} catch (err) {
			console.error('Cancel ride failed:', err)
			setError(err.message || 'Failed to cancel ride. Please try again.')
		}
	}

	const handleGoBack = () => {
		navigate('/find-ride')
	}

	if (!ride) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
				<div className="max-w-md w-full bg-white rounded-xl shadow-md p-8 text-center">
					<XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
					<h1 className="text-2xl font-bold text-gray-800 mb-4">No Ride Selected</h1>
					<p className="text-gray-600 mb-6">
						You reached the payment page without selecting a ride. Please go back and pick a ride first.
					</p>
					<button 
						onClick={handleGoBack} 
						className="px-6 py-3 rounded-lg bg-primary text-white font-semibold hover:bg-opacity-90 inline-flex items-center gap-2"
					>
						<ArrowLeft size={20} />
						Return to Rides
					</button>
				</div>
			</div>
		)
	}

	const formatPrice = (price) => `${parseFloat(price).toFixed(4)} ETH`

	return (
		<div className="bg-gray-50 min-h-screen py-10">
			<div className="max-w-3xl mx-auto px-4">
				<div className="bg-white rounded-xl shadow-md p-8 mb-6">
					<h1 className="text-3xl font-bold text-primary mb-2">Ride Payment</h1>
					<p className="text-gray-600 mb-6">
						Review the ride details and complete the booking by paying the ride price to the smart contract.
					</p>

					{/* Ride Summary */}
					<div className="grid sm:grid-cols-2 gap-6 mb-8">
						<div className="border border-gray-200 rounded-lg p-5">
							<h2 className="font-semibold text-gray-700 mb-3 text-lg">Route Details</h2>
							<div className="space-y-2">
								<div>
									<span className="text-sm text-gray-500">From:</span>
									<p className="font-medium">{ride.from}</p>
								</div>
								<div>
									<span className="text-sm text-gray-500">To:</span>
									<p className="font-medium">{ride.to}</p>
								</div>
								<div>
									<span className="text-sm text-gray-500">Driver:</span>
									<p className="font-medium text-xs break-all">
										{ride.driverAddress || ride.driverName}
									</p>
								</div>
								{ride.rating && (
									<div>
										<span className="text-sm text-gray-500">Rating:</span>
										<p className="font-medium">{ride.rating} ⭐</p>
									</div>
								)}
							</div>
						</div>

						<div className="border border-gray-200 rounded-lg p-5">
							<h2 className="font-semibold text-gray-700 mb-3 text-lg">Payment Information</h2>
							<div className="space-y-3">
								<div>
									<span className="text-sm text-gray-500">Ride Price:</span>
									<p className="text-2xl font-bold text-primary">{formatPrice(ride.price)}</p>
								</div>
								<div>
									<span className="text-sm text-gray-500">Ride ID:</span>
									<p className="font-mono text-sm">{ride.id}</p>
								</div>
								<div>
									<span className="text-sm text-gray-500">Status:</span>
									<p className="font-medium capitalize">{ride.statusName || 'Active'}</p>
								</div>
							</div>
						</div>
					</div>

					{/* Wallet Section */}
					<div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-5 mb-6">
						<h2 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
							<span className="text-lg">💳</span> Your Wallet
						</h2>
						{isConnected && selectedAccount ? (
							<div className="space-y-2">
								<div>
									<span className="text-sm text-gray-600">Address:</span>
									<p className="text-sm font-mono break-all">{selectedAccount.address}</p>
								</div>
								<div>
									<span className="text-sm text-gray-600">Balance:</span>
									<p className="text-sm font-semibold">{parseFloat(balance).toFixed(4)} ETH</p>
								</div>
							</div>
						) : (
							<div className="text-sm text-amber-700 bg-amber-100 px-4 py-3 rounded-lg">
								⚠️ Wallet not connected. Please connect your wallet to proceed.
							</div>
						)}
					</div>

					{/* Status Messages */}
					{error && (
						<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-start gap-2">
							<XCircle className="flex-shrink-0 mt-0.5" size={18} />
							<span className="text-sm">{error}</span>
						</div>
					)}

					{status === 'booked' && (
						<div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 flex items-start gap-2">
							<CheckCircle className="flex-shrink-0 mt-0.5" size={18} />
							<div className="text-sm">
								<p className="font-semibold mb-1">✅ Ride booked successfully!</p>
								<p>Transaction: <a href={`https://etherscan.io/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="underline break-all">{txHash}</a></p>
								<p className="mt-2">The driver will complete the ride. Once completed, you can release the payment.</p>
							</div>
						</div>
					)}

					{status === 'released' && (
						<div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 flex items-start gap-2">
							<CheckCircle className="flex-shrink-0 mt-0.5" size={18} />
							<div className="text-sm">
								<p className="font-semibold mb-1">💰 Payment released to driver!</p>
								<p>Transaction: <a href={`https://etherscan.io/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="underline break-all">{txHash}</a></p>
							</div>
						</div>
					)}

					{(status === 'booking' || status === 'releasing') && (
						<div className="flex items-center space-x-2 text-primary mb-4 bg-blue-50 px-4 py-3 rounded-lg">
							<Loader className="animate-spin" size={20} />
							<span className="text-sm font-medium">
								{status === 'booking' ? 'Booking ride...' : 'Releasing payment...'}
							</span>
						</div>
					)}

					{/* Actions */}
					<div className="space-y-3">
						{/* Book Ride Button */}
						{status !== 'booked' && status !== 'released' && (
							<button
								onClick={handleBookRide}
								disabled={status === 'booking' || status === 'releasing' || !isConnected}
								className="w-full bg-primary text-white px-6 py-4 rounded-lg font-semibold hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
							>
								{status === 'booking' ? (
									<>
										<Loader className="animate-spin" size={20} />
										Booking...
									</>
								) : (
									<>📦 Book Ride & Pay {formatPrice(ride.price)}</>
								)}
							</button>
						)}

						{/* Release Payment Button (show after booking) */}
						{status === 'booked' && (
							<button
								onClick={handleReleasePayment}
								disabled={status === 'releasing'}
								className="w-full bg-green-600 text-white px-6 py-4 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
							>
								{status === 'releasing' ? (
									<>
										<Loader className="animate-spin" size={20} />
										Releasing...
									</>
								) : (
									<>💸 Release Payment to Driver</>
								)}
							</button>
						)}

						{/* Action Buttons Row */}
						<div className="flex flex-col sm:flex-row gap-3">
							<button
								onClick={handleGoBack}
								className="flex-1 px-6 py-3 rounded-lg border-2 border-gray-300 font-medium hover:border-primary transition-colors flex items-center justify-center gap-2"
							>
								<ArrowLeft size={18} />
								Back to Rides
							</button>
							
							{status === 'booked' && (
								<button
									onClick={handleCancelRide}
									className="flex-1 px-6 py-3 rounded-lg border-2 border-red-500 text-red-600 font-medium hover:bg-red-50 transition-colors"
								>
									❌ Cancel Ride
								</button>
							)}
						</div>
					</div>

					{/* Smart Contract Info */}
					<div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
						<p className="font-semibold mb-2">🔗 Smart Contract Escrow</p>
						<p className="mb-2">
							Your payment is held securely in the smart contract. The driver can only receive payment after you release it upon ride completion.
						</p>
						<p className="text-xs">
							<strong>Workflow:</strong> Book Ride → Driver Completes Ride → You Release Payment → Driver Receives Funds
						</p>
					</div>
				</div>
			</div>
		</div>
	)
}

export default Payment

