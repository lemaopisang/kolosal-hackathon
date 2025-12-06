import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Loader2, Copy, Check, Sparkles } from 'lucide-react'
import { generateCopy } from '@/lib/api'
import type { CopySuggestion, Tone } from '@/types'

const toneOptions: { value: Tone; label: string; description: string }[] = [
  { value: 'professional', label: 'Professional', description: 'Formal and respectful' },
  { value: 'friendly', label: 'Friendly', description: 'Warm and approachable' },
  { value: 'casual', label: 'Casual', description: 'Conversational and relatable' },
  { value: 'enthusiastic', label: 'Enthusiastic', description: 'Energetic and motivating' },
  { value: 'empathetic', label: 'Empathetic', description: 'Understanding and supportive' },
]

export default function CopyGenerator() {
  const [prompt, setPrompt] = useState('')
  const [language, setLanguage] = useState<'en' | 'id'>('en')
  const [selectedTone, setSelectedTone] = useState<Tone>('friendly')
  const [result, setResult] = useState<CopySuggestion | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: (data: { prompt: string; language: 'en' | 'id'; tone: Tone }) =>
      generateCopy({
        prompt: data.prompt,
        language: data.language,
        tone: data.tone,
        campaignId: 'demo',
      }),
    onSuccess: (data) => {
      setResult(data)
    },
  })

  const handleGenerate = () => {
    if (prompt.trim()) {
      mutation.mutate({ prompt, language, tone: selectedTone })
    }
  }

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 75) return 'text-blue-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-16 sm:py-24 bg-gray-50 dark:bg-gray-900">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          Inclusive Copy Generator
        </h2>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
          Generate bias-free marketing copy in multiple tones and languages
        </p>
      </div>

      <div className="grid gap-8">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>Describe Your Campaign</CardTitle>
            <CardDescription>
              Tell us what you want to promote and we'll generate inclusive copy suggestions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Campaign Description</label>
              <Textarea
                placeholder="e.g., 'Summer sale on organic coffee beans from local farmers. Target audience: coffee enthusiasts who care about sustainability.'"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Language</label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={language === 'en' ? 'default' : 'outline'}
                    onClick={() => setLanguage('en')}
                    size="sm"
                    className="flex-1"
                  >
                    English
                  </Button>
                  <Button
                    type="button"
                    variant={language === 'id' ? 'default' : 'outline'}
                    onClick={() => setLanguage('id')}
                    size="sm"
                    className="flex-1"
                  >
                    Bahasa Indonesia
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tone</label>
                <select
                  value={selectedTone}
                  onChange={(e) => setSelectedTone(e.target.value as Tone)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {toneOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label} - {option.description}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={!prompt.trim() || mutation.isPending}
              className="w-full"
              size="lg"
            >
              {mutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {mutation.isPending ? 'Generating...' : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Inclusive Copy
                </>
              )}
            </Button>

            {mutation.isError && (
              <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800">
                Failed to generate copy. Please try again.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Section */}
        {result && (
          <div className="space-y-6">
            <div className="text-center">
              <Badge variant="secondary" className="text-sm">
                {result.suggestions.length} Suggestions Generated
              </Badge>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {result.suggestions.map((suggestion) => (
                <Card key={suggestion.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <Badge variant="outline" className="capitalize">
                        {suggestion.tone}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(suggestion.text, suggestion.id)}
                        className="h-8 w-8 p-0"
                      >
                        {copiedId === suggestion.id ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm leading-relaxed">{suggestion.text}</p>

                    <div className="space-y-2 pt-4 border-t">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Inclusivity Score</span>
                        <span className={`font-bold ${getScoreColor(suggestion.inclusivityScore)}`}>
                          {suggestion.inclusivityScore}/100
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Bias Score</span>
                        <span className={`font-bold ${getScoreColor(100 - suggestion.biasScore)}`}>
                          {suggestion.biasScore}/100
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Predicted Engagement</span>
                        <span className="font-bold text-blue-600">
                          {suggestion.engagement.predicted}%
                        </span>
                      </div>
                    </div>

                    {suggestion.highlights && suggestion.highlights.length > 0 && (
                      <div className="space-y-1 pt-2">
                        <p className="text-xs font-medium text-gray-500">Highlights:</p>
                        <ul className="space-y-1">
                          {suggestion.highlights.map((highlight, idx) => (
                            <li key={idx} className="text-xs text-gray-600 flex items-start gap-1">
                              <span className="text-green-600">✓</span>
                              <span>{highlight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Original prompt reference */}
            <Card className="bg-gray-50 dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-sm">Original Prompt</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300">{result.original}</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </section>
  )
}
