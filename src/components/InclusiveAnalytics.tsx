import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  TrendingUp,
  Users,
  AlertCircle,
  Target,
  Languages,
  BarChart3,
} from 'lucide-react'
import { fetchPlatformStats } from '@/lib/api'

export default function InclusiveAnalytics() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['platformStats'],
    queryFn: fetchPlatformStats,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  if (error) {
    return (
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="rounded-lg bg-red-50 p-4 text-red-800">
          Failed to load analytics. Please refresh the page.
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-16 sm:py-24">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          Platform Analytics
        </h2>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
          Real-time insights into inclusive marketing impact across Indonesian MSMEs
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-12 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Key Metrics */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              icon={Users}
              title="Total Campaigns"
              value={stats?.totalCampaigns || 0}
              color="text-blue-600"
              bgColor="bg-blue-50"
            />
            <MetricCard
              icon={AlertCircle}
              title="Bias Checks"
              value={stats?.totalBiasChecks || 0}
              color="text-purple-600"
              bgColor="bg-purple-50"
            />
            <MetricCard
              icon={Target}
              title="Avg Inclusivity Score"
              value={`${stats?.averageInclusivityScore || 0}/100`}
              color="text-green-600"
              bgColor="bg-green-50"
            />
            <MetricCard
              icon={TrendingUp}
              title="Monthly Growth"
              value={`+${stats?.monthlyGrowth || 0}%`}
              color="text-orange-600"
              bgColor="bg-orange-50"
            />
          </div>

          {/* Bias Detection Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Bias Detection Overview
              </CardTitle>
              <CardDescription>
                Total biases detected and categorized across all campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats?.totalBiasesDetected || 0}
                  </span>
                  <Badge variant="secondary">
                    {stats?.biasReduction ? `${stats.biasReduction}% reduction` : 'Tracking'}
                  </Badge>
                </div>

                {stats?.topBiasTypes && stats.topBiasTypes.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Most Common Bias Types
                    </p>
                    {stats.topBiasTypes.map((biasType, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="capitalize text-gray-700 dark:text-gray-300">
                            {biasType.type}
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {biasType.count} ({biasType.percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                            style={{ width: `${biasType.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Language & Distribution */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Language Distribution */}
            {stats?.languageDistribution && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Languages className="h-5 w-5" />
                    Language Distribution
                  </CardTitle>
                  <CardDescription>
                    Copy generated across different languages
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-blue-500" />
                        <span className="text-sm">English</span>
                      </div>
                      <span className="font-bold">{stats.languageDistribution.en || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-red-500" />
                        <span className="text-sm">Bahasa Indonesia</span>
                      </div>
                      <span className="font-bold">{stats.languageDistribution.id || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Business Type Distribution */}
            {stats?.businessTypeDistribution && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Business Types
                  </CardTitle>
                  <CardDescription>
                    Distribution of campaigns by business type
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(stats.businessTypeDistribution)
                      .sort(([, a], [, b]) => (b as number) - (a as number))
                      .slice(0, 5)
                      .map(([type, count]) => (
                        <div key={type} className="flex items-center justify-between text-sm">
                          <span className="text-gray-700 dark:text-gray-300">{type}</span>
                          <Badge variant="secondary">{count}</Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Impact Statement */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-0">
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  Empowering Indonesian MSMEs with Inclusive Marketing
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  Together, we're building a more inclusive business ecosystem—one campaign at a time
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </section>
  )
}

interface MetricCardProps {
  icon: React.ElementType
  title: string
  value: string | number
  color: string
  bgColor: string
}

function MetricCard({ icon: Icon, title, value, color, bgColor }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`${bgColor} p-2 rounded-full`}>
          <Icon className={`h-4 w-4 ${color}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  )
}
