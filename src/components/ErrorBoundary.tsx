import React from 'react'

type Props = {
  children: React.ReactNode
}

type State = {
  hasError: boolean
  message?: string
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error?.message }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('UI error boundary caught', error, errorInfo)
  }

  handleReset = () => {
    try {
      localStorage.removeItem('inclusive-hub-freeze')
    } catch (err) {
      console.warn('Failed to clear freeze cache', err)
    }
    this.setState({ hasError: false, message: undefined })
    // Full reload to reset app state
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
          <div className="max-w-lg space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-800 dark:bg-gray-900">
            <h2 className="text-xl font-semibold">Something went wrong</h2>
            {this.state.message && (
              <p className="text-sm text-gray-600 dark:text-gray-300">{this.state.message}</p>
            )}
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <p>Try clearing the frozen demo cache and reloading.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={this.handleReset}
                className="inline-flex items-center rounded-md bg-black px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                Clear freeze cache & reload
              </button>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
                Reload
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
