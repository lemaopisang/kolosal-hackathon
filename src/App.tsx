import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from '@/components/ui/toaster'
import { useEffect } from 'react'
import { toast } from '@/hooks/use-toast'
import { useFreezeStore } from '@/store/freeze'
import InclusiveHero from '@/components/InclusiveHero'
import PersonaGrid from '@/components/PersonaGrid'
import BiasAnalytics from '@/components/BiasAnalytics'
import CopyGenerator from '@/components/CopyGenerator'
import InclusiveAnalytics from '@/components/InclusiveAnalytics'
import InsightsFooter from '@/components/InsightsFooter'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
})

function AppContent() {
  const { freezeMode, setFreezeMode } = useFreezeStore()

  // Keyboard shortcut: Ctrl+Shift+F to toggle freeze mode
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'F') {
        e.preventDefault()
        const newMode = !freezeMode
        setFreezeMode(newMode)
        
        toast({
          title: newMode ? '❄️ Demo Frozen' : '🔥 Live Mode',
          description: newMode 
            ? 'Data is now frozen for consistent demos'
            : 'Fetching live data from API',
        })
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [freezeMode, setFreezeMode])

  return (
    <div className="min-h-screen bg-background">
      {/* Freeze mode indicator */}
      {freezeMode && (
        <div className="fixed top-4 right-4 z-50 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium shadow-lg">
          ❄️ DEMO MODE - FROZEN DATA
        </div>
      )}

      <InclusiveHero />
      <PersonaGrid />
      <BiasAnalytics />
      <CopyGenerator />
      <InclusiveAnalytics />
      <InsightsFooter />
      
      <Toaster />
    </div>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default App
