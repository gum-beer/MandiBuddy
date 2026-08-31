import { Component } from 'react'
import './ErrorBoundary.css'

/** Catches render errors anywhere below it and shows a readable message
 *  instead of silently unmounting to a blank page — which is exactly
 *  what happened before this existed (see docs/03-client-code-review.md
 *  #3). React error boundaries must be class components; there is no
 *  hook equivalent. */
export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('Unhandled error:', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="error-boundary">
          <h1>Something broke</h1>
          <p className="error-boundary__message">{this.state.error.message}</p>
          <button className="btn btn--solid" type="button" onClick={() => window.location.reload()}>
            Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
