import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Welcome from './components/Welcome'
import FindRide from './components/FindRide'
import OfferRide from './components/OfferRide'
import ConnectWallet from './components/ConnectWallet'
import './App.css'

function App() {
  return (
    <Router>
      <div className="App min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/home" element={<Welcome />} />
            <Route path="/find-ride" element={<FindRide />} />
            <Route path="/offer-ride" element={<OfferRide />} />
            <Route path="/connect-wallet" element={<ConnectWallet />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App
