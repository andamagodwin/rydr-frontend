import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch() {
    // You can log the error to an error reporting service here
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full p-6 bg-red-50 text-red-700 rounded">
          <strong>Something went wrong.</strong>
          <div className="text-sm">Particle background failed to load. You can continue using the app.</div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
