import { Component } from 'react'

// Plasă de siguranță: dacă o pagină aruncă o eroare la randare, afișăm un
// mesaj în loc de ecran alb.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ maxWidth: 640, margin: '80px auto', padding: 24, fontFamily: 'Inter, system-ui, sans-serif' }}>
          <h1 style={{ fontSize: 24, marginBottom: 8 }}>Something went wrong.</h1>
          <p style={{ color: '#6f6e6a', marginBottom: 16 }}>{String(this.state.error?.message || this.state.error)}</p>
          <a href="/" style={{ color: '#ff4f1f', fontWeight: 600 }}>Back to home</a>
        </div>
      )
    }
    return this.props.children
  }
}
