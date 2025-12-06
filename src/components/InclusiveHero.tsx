import { Sparkles, Target, Users } from 'lucide-react'

export default function InclusiveHero() {
  return (
    <div className="relative overflow-hidden bg-linear-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-2 text-sm font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
            <Sparkles className="h-4 w-4" />
            Powered by Kolosal.ai
          </div>
          
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
            Inclusive Marketing for
            <span className="text-indigo-600 dark:text-indigo-400"> Indonesian MSMEs</span>
          </h1>
          
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
            Amplify your local business with AI-powered marketing that celebrates diversity,
            removes bias, and connects authentically with every customer.
          </p>

          <div className="mt-10 flex items-center justify-center gap-x-6">
            <a
              href="#personas"
              className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
            >
              Explore Campaigns
            </a>
            <a
              href="#features"
              className="text-sm font-semibold leading-6 text-gray-900 dark:text-white"
            >
              Learn more <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>

        {/* Feature highlights */}
        <div className="mx-auto mt-16 max-w-5xl">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="relative flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-indigo-100 p-3 dark:bg-indigo-900/30">
                <Target className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Bias Detection
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                Real-time analysis identifies and eliminates bias in your marketing copy
              </p>
            </div>

            <div className="relative flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-purple-100 p-3 dark:bg-purple-900/30">
                <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                MSME Personas
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                Authentic Indonesian small business profiles across all sectors
              </p>
            </div>

            <div className="relative flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-pink-100 p-3 dark:bg-pink-900/30">
                <Sparkles className="h-6 w-6 text-pink-600 dark:text-pink-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Inclusive Copy
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                AI-generated multilingual content that welcomes every audience
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
