import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle, AlertTriangle, XCircle, Loader2 } from 'lucide-react'
import { checkBias } from '@/lib/api'
import type { BiasInsight, BiasSeverity } from '@/types'

const severityConfig: Record<
  BiasSeverity,
  { icon: any; color: string; bgColor: string; label: string }
> = {
  low: {
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    label: 'Low Risk',
  },
  medium: {
    icon: AlertCircle,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    label: 'Medium Risk',
  },
  high: {
    icon: AlertTriangle,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    label: 'High Risk',
  },
  critical: {
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    label: 'Critical',
  },
}

export default function BiasAnalytics() {
  const [content, setContent] = useState('')
  const [language, setLanguage] = useState<'en' | 'id'>('en')
  const [result, setResult] = useState<BiasInsight | null>(null)

  const mutation = useMutation({
    mutationFn: (data: { content: string; language: 'en' | 'id' }) =>
      checkBias({
        content: data.content,
        language: data.language,
        campaignId: 'demo',
      }),
    onSuccess: (data) => {
      setResult(data)
    },
  })

  const handleCheck = () => {
    if (content.trim()) {
      mutation.mutate({ content, language })
    }
  }

  const getSeverityIcon = (severity: BiasSeverity) => {
    const config = severityConfig[severity]
    const Icon = config.icon
    return <Icon className={`h-5 w-5 ${config.color}`} />
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-16 sm:py-24">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          Bias Detection Tool
        </h2>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
          Analyze your marketing copy for unconscious biases and get actionable recommendations
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>Check Your Content</CardTitle>
            <CardDescription>
              Paste your marketing copy below to detect potential biases
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Marketing Copy</label>
              <Textarea
                placeholder="e.g., 'Perfect for housewives and working men who want to save time...'"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Language</label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={language === 'en' ? 'default' : 'outline'}
                  onClick={() => setLanguage('en')}
                  size="sm"
                >
                  English
                </Button>
                <Button
                  type="button"
                  variant={language === 'id' ? 'default' : 'outline'}
                  onClick={() => setLanguage('id')}
                  size="sm"
                >
                  Bahasa Indonesia
                </Button>
              </div>
            </div>

            <Button
              onClick={handleCheck}
              disabled={!content.trim() || mutation.isPending}
              className="w-full"
            >
              {mutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {mutation.isPending ? 'Analyzing...' : 'Check for Bias'}
            </Button>

            {mutation.isError && (
              <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800">
                Failed to analyze content. Please try again.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card>
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
            <CardDescription>
              {result ? 'Bias detection complete' : 'Submit content to see results'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-6">
                {/* Overall Score */}
                <div
                  className={`rounded-lg p-4 ${severityConfig[result.severity].bgColor}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getSeverityIcon(result.severity)}
                      <div>
                        <p className="font-medium">
                          {severityConfig[result.severity].label}
                        </p>
                        <p className="text-sm text-gray-600">
                          Bias Score: {result.overallScore}/100
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{result.overallScore}</p>
                    </div>
                  </div>
                </div>

                {/* Detected Biases */}
                <div className="space-y-3">
                  <h4 className="font-medium">Detected Biases ({result.biases.length})</h4>
                  {result.biases.map((bias, idx) => (
                    <div key={idx} className="rounded-lg border p-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <Badge variant="secondary" className="capitalize">
                          {bias.type}
                        </Badge>
                        <span className="text-sm font-medium text-gray-600">
                          Score: {bias.score}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{bias.description}</p>
                      <div className="rounded bg-gray-50 p-2 text-xs text-gray-600">
                        <strong>Example:</strong> "{bias.affectedText}"
                      </div>
                      <p className="text-sm text-green-700">
                        <strong>✓ Recommendation:</strong> {bias.recommendation}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Suggestions */}
                {result.suggestions && result.suggestions.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Action Items</h4>
                    <ul className="space-y-1 text-sm text-gray-700">
                      {result.suggestions.map((suggestion, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-green-600">•</span>
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Metadata */}
                <div className="text-xs text-gray-500 pt-4 border-t">
                  <p>Model: {result.metadata.modelVersion}</p>
                  <p>Confidence: {(result.metadata.confidence * 100).toFixed(1)}%</p>
                  <p>Analyzed: {new Date(result.detectedAt).toLocaleString()}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-400">
                <div className="text-center">
                  <AlertCircle className="mx-auto h-12 w-12 mb-4" />
                  <p>No analysis yet</p>
                  <p className="text-sm">Enter content and click "Check for Bias"</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
