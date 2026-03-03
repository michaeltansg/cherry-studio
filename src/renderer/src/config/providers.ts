import type { SystemProvider, SystemProviderId } from '@renderer/types'

export const SYSTEM_PROVIDERS_CONFIG: Record<SystemProviderId, SystemProvider> = {
  codesmart: {
    id: 'codesmart' as SystemProviderId,
    name: 'CodeSmart',
    type: 'openai',
    apiKey: '',
    apiHost: 'http://localhost:4000/v1',
    models: [],
    isSystem: true,
    enabled: true
  }
}

export const SYSTEM_PROVIDERS: SystemProvider[] = Object.values(SYSTEM_PROVIDERS_CONFIG)

export const PROVIDER_LOGO_MAP: Record<string, string> = {} as const

export function getProviderLogo(providerId: string) {
  return PROVIDER_LOGO_MAP[providerId]
}

export const NOT_SUPPORTED_RERANK_PROVIDERS = ['ollama', 'lmstudio'] as const
export const ONLY_SUPPORTED_DIMENSION_PROVIDERS = ['ollama', 'infini'] as const

type ProviderUrls = {
  api: {
    url: string
  }
  websites?: {
    official: string
    apiKey?: string
    docs: string
    models?: string
  }
}

export const PROVIDER_URLS: Record<string, ProviderUrls> = {
  codesmart: {
    api: {
      url: 'http://localhost:4000/v1'
    }
  }
}
