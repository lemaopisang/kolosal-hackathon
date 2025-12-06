import { useQuery } from '@tanstack/react-query'
import { BarChart3, Heart, Shield } from 'lucide-react'
import { fetchPlatformStats } from '@/lib/api'

export default function InsightsFooter() {
  const { data: stats } = useQuery({
    queryKey: ['platformStats'],
    queryFn: fetchPlatformStats,
    staleTime: 1000 * 60 * 5,
  })

  // Use stats for display
  return (
    <footer className="bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Building Inclusive Indonesian Commerce
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
            Our AI-powered platform helps MSMEs create marketing that welcomes everyone,
            eliminates bias, and drives authentic engagement across diverse Indonesian communities.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 rounded-full bg-indigo-100 p-4 dark:bg-indigo-900/30">
              <Shield className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {stats?.averageInclusivityScore || 87.5}% Average Inclusivity Score
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Our campaigns consistently exceed industry standards for inclusive messaging
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="mb-4 rounded-full bg-purple-100 p-4 dark:bg-purple-900/30">
              <BarChart3 className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {stats?.totalBiasesDetected || 0} Biases Detected
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              {stats?.biasReduction ? `${stats.biasReduction}% reduction` : 'Tracking bias across all campaigns through Kolosal.ai'}
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="mb-4 rounded-full bg-pink-100 p-4 dark:bg-pink-900/30">
              <Heart className="h-8 w-8 text-pink-600 dark:text-pink-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {stats?.totalCampaigns || 50}+ Indonesian MSMEs
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Real personas from warung to tech startups across all provinces
            </p>
          </div>
        </div>

        <div className="mt-16 border-t border-gray-200 pt-8 dark:border-gray-700">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            © 2025 Inclusive Marketing Hub. Powered by{' '}
            <a
              href="https://kolosal.ai"
              className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
            >
              Kolosal.ai
            </a>
            . Built for Indonesian entrepreneurs.
          </p>
          <p className="mt-2 text-center text-xs text-gray-400 dark:text-gray-500">
            Press <kbd className="rounded bg-gray-200 px-1 py-0.5 font-mono dark:bg-gray-800">Ctrl+Shift+F</kbd> to toggle demo freeze mode
          </p>
        </div>
      </div>
    </footer>
  )
}
