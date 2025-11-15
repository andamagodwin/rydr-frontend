import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { WalletProvider } from './components/EthereumWalletProvider'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Welcome from './components/Welcome'
import FindRide from './components/FindRide'
import Payment from './components/Payment'
import OfferRide from './components/OfferRide'
import ConnectWallet from './components/ConnectWallet'
import './App.css'

function App() {
  return (
    <WalletProvider>
      <Router>
        <div className="">
          <Navbar />
          <main className="flex-grow pt-10">
            <Routes>
              <Route path="/" element={<Welcome />} />
              <Route path="/home" element={<Welcome />} />
              <Route path="/find-ride" element={<FindRide />} />
              <Route path="/payment" element={<Payment />} />
              <Route path="/offer-ride" element={<OfferRide />} />
              <Route path="/connect-wallet" element={<ConnectWallet />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </WalletProvider>
  )
}

export default App
