import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useFreezeStore } from '@/store/freeze'

export default function DebugPanel() {
  const qc = useQueryClient()
  const { freezeMode, frozenData, clearFrozenData } = useFreezeStore()
  const [open, setOpen] = useState(false)

  const campaignsQuery = qc.getQueryData(['campaigns', freezeMode]) as
    | { data?: { data?: unknown[] } }
    | undefined
  const campaigns = Array.isArray(campaignsQuery?.data?.data) ? campaignsQuery.data.data : []
  const frozenCampaigns =
    freezeMode && frozenData && typeof frozenData === 'object' && 'campaigns' in frozenData
      ? ((frozenData as Record<string, unknown>).campaigns as { data?: unknown[] } | undefined)
      : undefined
  const frozenCampaignCount = Array.isArray(frozenCampaigns?.data) ? frozenCampaigns.data.length : 0

  return (
    <div className="fixed bottom-4 right-4 z-50 text-xs">
      <div className="flex justify-end mb-1">
        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded bg-gray-900 text-white px-3 py-1 shadow hover:bg-gray-800"
        >
          {open ? 'Close Debug' : 'Open Debug'}
        </button>
      </div>
      {open && (
        <div className="rounded border border-gray-200 bg-white shadow-lg p-3 w-72 text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100">
          <div className="font-semibold mb-2">Debug Panel</div>
          <div className="space-y-1">
            <div>Freeze mode: {freezeMode ? 'ON' : 'OFF'}</div>
            <div>Campaigns in query: {campaigns.length}</div>
            <div>Frozen campaigns cached: {frozenCampaignCount}</div>
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => {
                clearFrozenData()
                localStorage.removeItem('inclusive-hub-freeze')
              }}
              className="rounded border border-gray-300 px-2 py-1 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
            >
              Clear freeze cache
            </button>
            <button
              onClick={() => {
                qc.invalidateQueries({ queryKey: ['campaigns'] })
              }}
              className="rounded border border-gray-300 px-2 py-1 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
            >
              Refetch campaigns
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
