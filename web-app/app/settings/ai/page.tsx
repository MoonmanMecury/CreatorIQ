'use client'

import { useState } from 'react'
import {
    useProviders,
    useApiKeys,
    useAddKey,
    useRemoveKey,
    useVerifyKey,
    useConductorPreferences
} from '@/features/conductor/hooks/useApiKeys'
import { LLMProvider } from '@/features/conductor/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
    Plus,
    CheckCircle2,
    ShieldCheck,
    Sparkles,
    Cpu,
    Settings2,
    Lock
} from 'lucide-react'

export default function AiSettingsPage() {
    const { providers, isLoading: providersLoading } = useProviders()
    const { keys, getKey } = useApiKeys()
    const { addKey, isAdding } = useAddKey()
    const { removeKey, isRemoving } = useRemoveKey()
    const { preferences, updatePreferences } = useConductorPreferences()

    const [selectedProvider, setSelectedProvider] = useState<LLMProvider | null>(null)
    const [apiKeyInput, setApiKeyInput] = useState('')
    const [selectedModel, setSelectedModel] = useState('')

    const handleAddKey = async () => {
        if (!selectedProvider || !apiKeyInput || !selectedModel) return
        try {
            await addKey({
                provider: selectedProvider,
                raw_key: apiKeyInput,
                model_preference: selectedModel
            })
            setApiKeyInput('')
            setSelectedProvider(null)
        } catch (err) { }
    }

    if (providersLoading) return <div className="p-8">Loading AI Engine...</div>

    return (
        <div className="container max-w-5xl py-10 space-y-10">
            <header className="space-y-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                        <Sparkles className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">AI Conductor</h1>
                        <p className="text-muted-foreground">Manage your own LLM API keys for enhanced creator intelligence.</p>
                    </div>
                </div>
            </header>

            <div className="grid md:grid-cols-[1fr_350px] gap-8">
                <div className="space-y-8">
                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <Cpu className="w-5 h-5 text-primary" />
                            Connected Providers
                        </h2>

                        <div className="grid sm:grid-cols-2 gap-4">
                            {providers.map((p) => {
                                const activeKey = getKey(p.provider_id as LLMProvider)
                                const isSelected = selectedProvider === p.provider_id

                                return (
                                    <div key={p.provider_id} className="contents">
                                        <Card
                                            className={`relative overflow-hidden transition-all hover:border-primary/40 cursor-pointer ${isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}
                                            onClick={() => {
                                                setSelectedProvider(p.provider_id as LLMProvider)
                                                setSelectedModel(activeKey?.model_preference || p.models.find(m => m.is_default)?.model_id || p.models[0].model_id)
                                            }}
                                        >
                                            <CardHeader className="pb-3">
                                                <div className="flex justify-between items-start">
                                                    <div className="space-y-1">
                                                        <CardTitle className="text-lg">{p.display_name}</CardTitle>
                                                        <CardDescription className="text-xs">Prefix: <code>{p.key_prefix}</code></CardDescription>
                                                    </div>
                                                    {activeKey ? (
                                                        <div className="flex flex-col items-end gap-2">
                                                            <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20 gap-1 capitalize">
                                                                <CheckCircle2 className="w-3 h-3" />
                                                                Connected
                                                            </Badge>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-6 text-[10px] text-muted-foreground hover:text-destructive"
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    removeKey(p.provider_id)
                                                                }}
                                                                disabled={isRemoving}
                                                            >
                                                                Disconnect
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <Badge variant="outline" className="opacity-50">Not Set</Badge>
                                                    )}
                                                </div>
                                            </CardHeader>
                                            {activeKey && (
                                                <CardContent>
                                                    <div className="text-xs space-y-1.5 grayscale opacity-70">
                                                        <div className="flex justify-between">
                                                            <span>Key Hint</span>
                                                            <span className="font-mono">{activeKey.key_hint}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Active Model</span>
                                                            <span>{activeKey.model_display_name}</span>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            )}
                                            {isSelected && !activeKey && (
                                                <CardFooter className="bg-primary/5 border-t border-primary/10 pt-4">
                                                    <div className="w-full space-y-3">
                                                        <div className="space-y-1.5">
                                                            <Label className="text-xs">API Key</Label>
                                                            <div className="relative">
                                                                <Input
                                                                    placeholder={`Paste ${p.display_name} key...`}
                                                                    value={apiKeyInput}
                                                                    onChange={(e) => setApiKeyInput(e.target.value)}
                                                                    className="pr-10 h-8 text-xs"
                                                                    type="password"
                                                                />
                                                                <Lock className="absolute right-3 top-2 w-3.5 h-3.5 text-muted-foreground" />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <Label className="text-xs">Preferred Model</Label>
                                                            <Select value={selectedModel} onValueChange={setSelectedModel}>
                                                                <SelectTrigger className="h-8 text-xs">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {p.models.map(m => (
                                                                        <SelectItem key={m.model_id} value={m.model_id} className="text-xs">
                                                                            {m.display_name} {m.tier === 'premium' ? '✨' : ''}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <Button
                                                            size="sm"
                                                            className="w-full h-8 text-xs gap-2"
                                                            disabled={isAdding || !apiKeyInput}
                                                            onClick={handleAddKey}
                                                        >
                                                            {isAdding ? 'Connecting...' : <><Plus className="w-3.5 h-3.5" /> Save API Key</>}
                                                        </Button>
                                                    </div>
                                                </CardFooter>
                                            )}
                                        </Card>
                                    </div>
                                )
                            })}
                        </div>
                    </section>

                    <section className="space-y-4">
                        <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 flex gap-4 items-start">
                            <ShieldCheck className="w-10 h-10 text-primary shrink-0" />
                            <div className="space-y-1">
                                <h3 className="font-semibold">Your Keys are Encrypted</h3>
                                <p className="text-sm text-muted-foreground">
                                    API keys are never stored in plain text. They are encrypted at rest using your server's master protection key and decrypted only during the millisecond a request is made to the provider. We never log or expose your raw keys to the browser.
                                </p>
                            </div>
                        </div>
                    </section>
                </div>

                <div className="space-y-6">
                    <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Settings2 className="w-5 h-5" />
                                Orchestration
                            </CardTitle>
                            <CardDescription>Configure how AI enhances your workflow.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-xs">Primary AI Engine</Label>
                                    <Select
                                        disabled={keys.length === 0}
                                        value={preferences?.active_provider || ''}
                                        onValueChange={(v) => updatePreferences({
                                            ...preferences!,
                                            active_provider: v as LLMProvider,
                                            active_model: keys.find(k => k.provider === v)?.model_preference || ''
                                        })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select connected AI..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {keys.map(k => (
                                                <SelectItem key={k.provider} value={k.provider}>
                                                    {k.provider_display_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs">Fallback AI Engine (Optional)</Label>
                                    <Select
                                        disabled={keys.length < 2}
                                        value={preferences?.fallback_provider || 'none'}
                                        onValueChange={(v) => updatePreferences({
                                            ...preferences!,
                                            fallback_provider: v === 'none' ? null : v as LLMProvider,
                                            fallback_model: v === 'none' ? null : keys.find(k => k.provider === v)?.model_preference || ''
                                        })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="No Fallback" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">Disabled (Return to Rule-Based)</SelectItem>
                                            {keys.filter(k => k.provider !== preferences?.active_provider).map(k => (
                                                <SelectItem key={k.provider} value={k.provider}>
                                                    {k.provider_display_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                                    <div className="space-y-0.5">
                                        <Label className="text-sm">Real-time Streaming</Label>
                                        <p className="text-[10px] text-muted-foreground">See AI responses as they are generated.</p>
                                    </div>
                                    <Switch
                                        checked={preferences?.streaming_enabled}
                                        onCheckedChange={(c) => updatePreferences({ ...preferences!, streaming_enabled: c })}
                                    />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="text-[10px] text-muted-foreground border-t border-border/50 pt-4 flex flex-col gap-2">
                            <p>When AI is enabled, it enhances tactical recommendations, content angles, and monetization commentary.</p>
                            <p>If no AI keys are provided or an error occurs, the system gracefully falls back to deterministic rule-based logic.</p>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    )
}
