import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useFreezeStore } from '@/store/freeze'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { MapPin, TrendingUp, Users, Store } from 'lucide-react'
import { fetchCampaigns } from '@/lib/api'
import type { CampaignPersona, PaginatedResponse } from '@/types'

export default function PersonaGrid() {
  const { freezeMode, frozenData, setFrozenData } = useFreezeStore()

  const { data, isLoading, error } = useQuery({
    queryKey: ['campaigns', freezeMode],
    queryFn: () => fetchCampaigns({ limit: 12, freeze: freezeMode, page: 1 }),
    staleTime: freezeMode ? Infinity : 1000 * 60 * 5,
  })

  // Store frozen data when in freeze mode (side-effect to avoid render-time state updates)
  useEffect(() => {
    if (freezeMode && data && !frozenData.campaigns) {
      setFrozenData('campaigns', data)
    }
  }, [freezeMode, data, frozenData.campaigns, setFrozenData])

  const cached = (freezeMode && frozenData.campaigns
    ? (frozenData.campaigns as PaginatedResponse<CampaignPersona>).data
    : data?.data)

  const campaigns = Array.isArray(cached) ? cached : []

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="rounded-lg bg-red-50 p-4 text-red-800">
          <p>Failed to load campaigns. Please try again.</p>
        </div>
      </div>
    )
  }

  return (
    <section id="personas" className="mx-auto max-w-7xl px-6 py-16 sm:py-24">
      <div className="mb-12">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          Indonesian MSME Campaigns
        </h2>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
          Real business personas from across Indonesia, ready for inclusive marketing
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="mt-2 h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((persona) => (
            <Card key={persona.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{persona.businessName}</CardTitle>
                    <CardDescription className="mt-1">{persona.name}</CardDescription>
                  </div>
                  <Badge variant="outline" className="ml-2">
                    {persona.businessType}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <MapPin className="h-4 w-4" />
                  <span>{persona.city}, {persona.province}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <Store className="h-4 w-4" />
                  <span>{persona.sector}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <TrendingUp className="h-4 w-4" />
                  <span>{persona.monthlyRevenue}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <Users className="h-4 w-4" />
                  <span>{persona.targetAudience}</span>
                </div>

                {persona.digitalPresence?.hasSocialMedia && Array.isArray(persona.digitalPresence.platforms) && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {persona.digitalPresence.platforms.slice(0, 3).map((platform) => (
                      <Badge key={platform} variant="secondary" className="text-xs">
                        {platform}
                      </Badge>
                    ))}
                    {persona.digitalPresence.platforms.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{persona.digitalPresence.platforms.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                <div className="mt-4 space-y-1">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Marketing Goals:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {(persona.marketingGoals || []).slice(0, 2).map((goal, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {goal.split(' ').slice(0, 3).join(' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && campaigns.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No campaigns found</p>
        </div>
      )}
    </section>
  )
}
