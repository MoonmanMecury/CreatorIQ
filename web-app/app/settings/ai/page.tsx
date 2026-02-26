"use client"

import { useState } from 'react'
import {
  BrainIcon,
  CheckmarkCircle02Icon,
  Shield01Icon,
  Locker01Icon,
  HelpCircleIcon,
  SparklesIcon,
  Loading01Icon,
  Delete02Icon,
  RefreshIcon
} from 'hugeicons-react'
import {
  useProviders,
  useApiKeys,
  useAddApiKey,
  useRemoveApiKey,
  useVerifyApiKey,
  useConductorPreferences
} from '@/features/conductor/hooks/useApiKeys'
import { LLMProvider } from '@/features/conductor/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'

export default function AiSettingsPage() {
  const { providers, isLoading: providersLoading } = useProviders()
  const { keys, hasKey, getKey } = useApiKeys()
  const { preferences, updatePreferences, isUpdating } = useConductorPreferences()
  const { addKey, isAdding } = useAddApiKey()
  const { removeKey, isRemoving } = useRemoveApiKey()
  const { verify, isVerifying } = useVerifyApiKey()

  const [selectedProvider, setSelectedProvider] = useState<LLMProvider | null>(null)
  const [activeModel, setActiveModel] = useState<string>("")
  const [rawKey, setRawKey] = useState("")
  const [verificationResult, setVerificationResult] = useState<{ isValid: boolean, message: string } | null>(null)

  const handleSavePreferences = async () => {
    if (!selectedProvider || !activeModel) return
    await updatePreferences({
      activeProvider: selectedProvider,
      activeModel: activeModel,
      fallbackProvider: preferences?.fallbackProvider || null,
      fallbackModel: preferences?.fallbackModel || null,
      streamingEnabled: preferences?.streamingEnabled ?? true
    })
  }

  const handleAddAndVerify = async (provider: LLMProvider, model: string) => {
    setVerificationResult(null)
    try {
      const result = await verify({ provider, rawKey, model })
      if (result.isValid) {
        await addKey({ provider, rawKey, modelPreference: model })
        setVerificationResult({ isValid: true, message: `Key verified — ${model} responded in ${result.latencyMs}ms` })
        setRawKey("")
      } else {
        setVerificationResult({ isValid: false, message: result.errorMessage || "Verification failed" })
      }
    } catch (err) {
      setVerificationResult({ isValid: false, message: "An unexpected error occurred during verification" })
    }
  }

  const providerColors: Record<string, string> = {
    anthropic: "text-purple-500",
    openai: "text-emerald-500",
    google: "text-blue-500",
    xai: "text-slate-200",
  }

  const providerBg: Record<string, string> = {
    anthropic: "bg-purple-500/10 border-purple-500/20",
    openai: "bg-emerald-500/10 border-emerald-500/20",
    google: "bg-blue-500/10 border-blue-500/20",
    xai: "bg-slate-200/10 border-slate-200/20",
  }

  return (
    <div className="container max-w-5xl mx-auto py-10 px-4 font-mono">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
          <BrainIcon className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Conductor</h1>
          <p className="text-muted-foreground">Power your insights with your own LLM API keys.</p>
        </div>
      </div>

      <div className="grid gap-8">
        {/* Section 1: Active Configuration */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <SparklesIcon className="h-5 w-5 fill-current" />
              Your Active AI
            </CardTitle>
            <CardDescription>Choose which model powers your CreatorIQ experience.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {providers.map((p) => {
                const isActive = selectedProvider === p.providerId || preferences?.activeProvider === p.providerId
                const hasStoredKey = hasKey(p.providerId)

                return (
                  <button
                    key={p.providerId}
                    onClick={() => {
                      setSelectedProvider(p.providerId)
                      setActiveModel(p.models.find(m => m.isDefault)?.modelId || p.models[0].modelId)
                    }}
                    className={cn(
                      "flex flex-col items-center justify-center p-4 rounded-2xl border transition-all relative overflow-hidden group",
                      isActive ? cn("border-primary ring-2 ring-primary/20", providerBg[p.providerId]) : "hover:border-muted-foreground/50 bg-card"
                    )}
                  >
                    <div className={cn("text-xs font-bold uppercase tracking-widest mb-1", providerColors[p.providerId])}>
                      {p.displayName}
                    </div>
                    <div className="text-[10px] text-muted-foreground font-medium">
                      {p.models.find(m => m.isDefault)?.displayName.split(' ')[0]}
                    </div>

                    <div className="mt-4">
                      {hasStoredKey ? (
                        <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-500 border-emerald-500/50 gap-1">
                          ✓ Ready
                        </Badge>
                      ) : (isActive ? (
                        <Badge variant="outline" className="text-[10px] gap-1">No Key</Badge>
                      ) : null)}
                    </div>

                    {isActive && (
                      <div className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-primary" />
                    )}
                  </button>
                )
              })}
            </div>

            {(selectedProvider || preferences?.activeProvider) && (
              <div className="grid md:grid-cols-2 gap-6 pt-4 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="space-y-2">
                  <Label>Primary Model</Label>
                  <Select
                    value={activeModel || preferences?.activeModel}
                    onValueChange={setActiveModel}
                  >
                    <SelectTrigger className="bg-card">
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent>
                      {providers.find(p => p.providerId === (selectedProvider || preferences?.activeProvider))?.models.map(m => (
                        <SelectItem key={m.modelId} value={m.modelId}>
                          <div className="flex items-center gap-2">
                            <span>{m.displayName}</span>
                            <Badge variant="outline" className="text-[10px] h-4 uppercase">{m.tier}</Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Streaming</Label>
                  <div className="flex items-center justify-between p-3 rounded-xl border bg-card h-[40px]">
                    <span className="text-xs text-muted-foreground">Enable real-time token streaming</span>
                    <Switch
                      checked={preferences?.streamingEnabled ?? true}
                      onCheckedChange={(val) => updatePreferences({ ...preferences!, streamingEnabled: val } as any)}
                    />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="bg-primary/5 border-t border-primary/10 px-6 py-4">
            <Button
              className="ml-auto gap-2 font-bold"
              onClick={handleSavePreferences}
              disabled={isUpdating || !selectedProvider}
            >
              {isUpdating && <Loading01Icon className="h-4 w-4 animate-spin" />}
              Save AI Preferences
            </Button>
          </CardFooter>
        </Card>

        {/* Section 2: API Keys */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold px-1">Manage Provider Keys</h2>
          <div className="grid gap-4">
            {providers.map((p) => {
              const key = getKey(p.providerId)
              return (
                <Collapsible key={p.providerId} className="w-full">
                  <Card className={cn(key ? "border-emerald-500/20" : "")}>
                    <CollapsibleTrigger asChild>
                      <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={cn("font-bold", providerColors[p.providerId])}>{p.displayName}</div>
                          {key && (
                            <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                              ✓ Verified
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {key ? `sk-...${key.keyHint}` : "No key configured"}
                          <div className="h-8 w-8 rounded-lg border flex items-center justify-center">
                            <RefreshIcon className="h-4 w-4" />
                          </div>
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <Separator />
                      <CardContent className="p-6 space-y-4">
                        {key ? (
                          <div className="space-y-4">
                            <div className="grid gap-2">
                              <Label className="text-xs uppercase tracking-widest text-muted-foreground">Active Key</Label>
                              <div className="flex items-center gap-2">
                                <Input
                                  readOnly
                                  value={`${p.keyPrefix}••••••••••••${key.keyHint}`}
                                  className="bg-muted/50 font-mono text-xs"
                                />
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="text-red-500 hover:bg-red-500/10"
                                  onClick={() => removeKey(p.providerId)}
                                  disabled={isRemoving}
                                >
                                  <Delete02Icon className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                              <span>Last verified: {key.lastVerifiedAt ? new Date(key.lastVerifiedAt).toLocaleString() : 'Never'}</span>
                              <span>Model preference: {key.modelDisplayName}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="grid gap-2">
                              <Label className="text-xs uppercase tracking-widest text-muted-foreground">Enter {p.displayName} API Key</Label>
                              <Input
                                type="password"
                                placeholder={`${p.keyPrefix}...`}
                                value={rawKey}
                                onChange={(e) => setRawKey(e.target.value)}
                                className="bg-card font-mono"
                              />
                              <p className="text-[10px] text-muted-foreground">
                                Your key is encrypted before storage. {p.displayName} keys usually start with <code className="text-primary">{p.keyPrefix}</code>.
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              <Select defaultValue={p.models.find(m => m.isDefault)?.modelId}>
                                <SelectTrigger className="w-[200px] h-9 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {p.models.map(m => (
                                    <SelectItem key={m.modelId} value={m.modelId}>{m.displayName}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button
                                size="sm"
                                className="font-bold gap-2"
                                onClick={() => handleAddAndVerify(p.providerId, p.models.find(m => m.isDefault)?.modelId || p.models[0].modelId)}
                                disabled={isVerifying || isAdding || !rawKey}
                              >
                                {(isVerifying || isAdding) ? <Loading01Icon className="h-3 w-3 animate-spin" /> : <Shield01Icon className="h-3 w-3" />}
                                Add & Verify Key
                              </Button>
                            </div>

                            {verificationResult && (
                              <div className={cn(
                                "p-3 rounded-xl border flex items-center gap-2 text-xs animate-in fade-in zoom-in duration-200",
                                verificationResult.isValid ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-red-500/10 border-red-500/20 text-red-500"
                              )}>
                                {verificationResult.isValid ? <CheckmarkCircle02Icon className="h-4 w-4" /> : <HelpCircleIcon className="h-4 w-4" />}
                                {verificationResult.message}
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              )
            })}
          </div>
        </div>

        {/* Section 3: What this unlocks */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <SparklesIcon className="h-5 w-5 text-primary" />
              What This Unlocks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground text-[10px] uppercase tracking-widest font-bold">
                  <tr>
                    <th className="px-4 py-3">Feature</th>
                    <th className="px-4 py-3">Without Key</th>
                    <th className="px-4 py-3">With Key</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {[
                    { f: "Attack Engine", w: "Rule-based insights", l: "LLM-powered analysis" },
                    { f: "Content Strategy", w: "Template output", l: "Strategic narrative" },
                    { f: "Monetization", w: "Score verdict", l: "Analyst assessment" },
                    { f: "Trend Synthesizer", w: "Auto summaries", l: "Sharp commentary" },
                    { f: "Growth Blueprint", w: "Formula plan", l: "Personalized roadmap" },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium">{row.f}</td>
                      <td className="px-4 py-3 text-muted-foreground">{row.w}</td>
                      <td className="px-4 py-3 text-primary font-medium">{row.l}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Section 4: Security */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-6 flex items-start gap-4">
            <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
              <Locker01Icon className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-sm">Security & Privacy</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your API keys are encrypted with AES-256 before being stored in our database.
                Raw keys are never logged and never exposed to the browser. All LLM calls are routed
                through our secure backend. Your provider account is billed directly — CreatorIQ adds no markup.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
