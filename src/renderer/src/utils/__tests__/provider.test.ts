import { type AzureOpenAIProvider, type Provider } from '@renderer/types'
import { describe, expect, it, vi } from 'vitest'

import {
  getAnthropicSupportedProviders,
  getClaudeSupportedProviders,
  isAIGatewayProvider,
  isAnthropicProvider,
  isAnthropicSupportedProvider,
  isAzureOpenAIProvider,
  isCherryAIProvider,
  isGeminiProvider,
  isGeminiWebSearchProvider,
  isNewApiProvider,
  isOpenAICompatibleProvider,
  isOpenAIProvider,
  isPerplexityProvider,
  isSupportAPIVersionProvider,
  isSupportArrayContentProvider,
  isSupportDeveloperRoleProvider,
  isSupportEnableThinkingProvider,
  isSupportServiceTierProvider,
  isSupportStreamOptionsProvider,
  isSupportUrlContextProvider,
  isSupportVerbosityProvider
} from '../provider'

vi.mock('@renderer/store/settings', () => ({
  default: (state = { settings: {} }) => state
}))

vi.mock('@renderer/services/AssistantService', () => ({
  getProviderByModel: vi.fn(),
  getAssistantSettings: vi.fn(),
  getDefaultAssistant: vi.fn().mockReturnValue({
    id: 'default',
    name: 'Default Assistant',
    prompt: '',
    settings: {}
  })
}))

const createProvider = (overrides: Partial<Provider> = {}): Provider => ({
  id: 'custom',
  type: 'openai',
  name: 'Custom Provider',
  apiKey: 'key',
  apiHost: 'https://api.example.com',
  models: [],
  ...overrides
})

const createSystemProvider = (overrides: Partial<Provider> = {}): Provider =>
  createProvider({
    id: 'codesmart',
    isSystem: true,
    ...overrides
  })

describe('provider utils', () => {
  it('filters Claude supported providers', () => {
    const providers = [
      createProvider({ id: 'anthropic-official', type: 'anthropic' }),
      createProvider({ id: 'custom-host', anthropicApiHost: 'https://anthropic.local' }),
      createProvider({ id: 'aihubmix' }),
      createProvider({ id: 'other' })
    ]

    expect(getClaudeSupportedProviders(providers)).toEqual(providers.slice(0, 3))
  })

  it('filters Anthropic supported providers', () => {
    const providers = [
      createProvider({ id: 'anthropic-official', type: 'anthropic' }),
      createProvider({ id: 'custom-host', anthropicApiHost: 'https://anthropic.local' }),
      createProvider({ id: 'aihubmix' }),
      createProvider({ id: 'other' })
    ]

    expect(getAnthropicSupportedProviders(providers)).toEqual(providers.slice(0, 2))
  })

  it('checks Anthropic supported provider', () => {
    expect(isAnthropicSupportedProvider(createProvider({ id: 'anthropic-official', type: 'anthropic' }))).toBe(true)
    expect(
      isAnthropicSupportedProvider(createProvider({ id: 'custom-host', anthropicApiHost: 'https://anthropic.local' }))
    ).toBe(true)
    expect(isAnthropicSupportedProvider(createProvider({ id: 'aihubmix' }))).toBe(false)
    expect(isAnthropicSupportedProvider(createProvider({ id: 'other' }))).toBe(false)
  })

  it('evaluates message array content support', () => {
    expect(isSupportArrayContentProvider(createProvider())).toBe(true)

    expect(isSupportArrayContentProvider(createProvider({ apiOptions: { isNotSupportArrayContent: true } }))).toBe(
      false
    )

    expect(isSupportArrayContentProvider(createSystemProvider({ id: 'deepseek' }))).toBe(false)
  })

  it('evaluates developer role support', () => {
    expect(isSupportDeveloperRoleProvider(createProvider({ apiOptions: { isSupportDeveloperRole: true } }))).toBe(true)
    expect(isSupportDeveloperRoleProvider(createSystemProvider())).toBe(true)
    expect(isSupportDeveloperRoleProvider(createSystemProvider({ id: 'poe' }))).toBe(false)
  })

  it('checks stream options support', () => {
    expect(isSupportStreamOptionsProvider(createProvider())).toBe(true)
    expect(isSupportStreamOptionsProvider(createProvider({ apiOptions: { isNotSupportStreamOptions: true } }))).toBe(
      false
    )
    expect(isSupportStreamOptionsProvider(createSystemProvider({ id: 'mistral' }))).toBe(false)
  })

  it('checks enable thinking support', () => {
    expect(isSupportEnableThinkingProvider(createProvider())).toBe(true)
    expect(isSupportEnableThinkingProvider(createProvider({ apiOptions: { isNotSupportEnableThinking: true } }))).toBe(
      false
    )
    expect(isSupportEnableThinkingProvider(createSystemProvider({ id: 'nvidia' }))).toBe(false)
  })

  it('determines service tier support', () => {
    expect(isSupportServiceTierProvider(createProvider({ apiOptions: { isSupportServiceTier: true } }))).toBe(true)
    // codesmart is not in SUPPORT_SERVICE_TIER_PROVIDERS, so use apiOptions flag instead
    expect(isSupportServiceTierProvider(createSystemProvider({ apiOptions: { isSupportServiceTier: true } }))).toBe(
      true
    )
    expect(isSupportServiceTierProvider(createSystemProvider())).toBe(false)
  })

  it('determines verbosity support', () => {
    // Custom providers with explicit flag
    expect(isSupportVerbosityProvider(createProvider({ apiOptions: { isNotSupportVerbosity: false } }))).toBe(true)
    expect(isSupportVerbosityProvider(createProvider({ apiOptions: { isNotSupportVerbosity: true } }))).toBe(false)

    // Custom providers without apiOptions (should support by default)
    expect(isSupportVerbosityProvider(createProvider())).toBe(true)
    expect(isSupportVerbosityProvider(createProvider({ apiOptions: {} }))).toBe(true)

    // System providers that support verbosity (default behavior)
    expect(isSupportVerbosityProvider(createSystemProvider())).toBe(true)
    expect(isSupportVerbosityProvider(createSystemProvider({ id: 'openai' }))).toBe(true)

    // System providers in the NOT_SUPPORT_VERBOSITY_PROVIDERS list (cannot be overridden by apiOptions)
    expect(isSupportVerbosityProvider(createSystemProvider({ id: 'groq' }))).toBe(false)
    expect(
      isSupportVerbosityProvider(createSystemProvider({ id: 'groq', apiOptions: { isNotSupportVerbosity: false } }))
    ).toBe(false)

    // apiOptions can disable verbosity for any provider
    expect(
      isSupportVerbosityProvider(createSystemProvider({ id: 'openai', apiOptions: { isNotSupportVerbosity: true } }))
    ).toBe(false)
  })

  it('detects URL context capable providers', () => {
    expect(isSupportUrlContextProvider(createProvider({ type: 'gemini' }))).toBe(true)
    expect(isSupportUrlContextProvider(createSystemProvider({ id: 'cherryin', type: 'openai', isSystem: true }))).toBe(
      true
    )
    expect(isSupportUrlContextProvider(createProvider())).toBe(false)
  })

  it('identifies Gemini web search providers', () => {
    expect(isGeminiWebSearchProvider(createSystemProvider({ id: 'gemini', type: 'gemini' }))).toBe(true)
    expect(isGeminiWebSearchProvider(createSystemProvider({ id: 'vertexai', type: 'vertexai' }))).toBe(true)
    expect(isGeminiWebSearchProvider(createSystemProvider())).toBe(false)
  })

  it('detects New API providers by id or type', () => {
    expect(isNewApiProvider(createProvider({ id: 'new-api' }))).toBe(true)
    expect(isNewApiProvider(createProvider({ id: 'cherryin' }))).toBe(true)
    expect(isNewApiProvider(createProvider({ type: 'new-api' }))).toBe(true)
    expect(isNewApiProvider(createProvider())).toBe(false)
  })

  it('detects specific provider ids', () => {
    expect(isCherryAIProvider(createProvider({ id: 'cherryai' }))).toBe(true)
    expect(isCherryAIProvider(createProvider())).toBe(false)

    expect(isPerplexityProvider(createProvider({ id: 'perplexity' }))).toBe(true)
    expect(isPerplexityProvider(createProvider())).toBe(false)
  })

  it('recognizes OpenAI compatible providers', () => {
    expect(isOpenAICompatibleProvider(createProvider({ type: 'openai' }))).toBe(true)
    expect(isOpenAICompatibleProvider(createProvider({ type: 'new-api' }))).toBe(true)
    expect(isOpenAICompatibleProvider(createProvider({ type: 'mistral' }))).toBe(true)
    expect(isOpenAICompatibleProvider(createProvider({ type: 'anthropic' }))).toBe(false)
  })

  it('narrows Azure OpenAI providers', () => {
    const azureProvider = {
      ...createProvider({ type: 'azure-openai' }),
      apiVersion: '2024-06-01'
    } as AzureOpenAIProvider
    expect(isAzureOpenAIProvider(azureProvider)).toBe(true)
    expect(isAzureOpenAIProvider(createProvider())).toBe(false)
  })

  it('checks provider type helpers', () => {
    expect(isOpenAIProvider(createProvider({ type: 'openai-response' }))).toBe(true)
    expect(isOpenAIProvider(createProvider())).toBe(false)

    expect(isAnthropicProvider(createProvider({ type: 'anthropic' }))).toBe(true)
    expect(isGeminiProvider(createProvider({ type: 'gemini' }))).toBe(true)
    expect(isAIGatewayProvider(createProvider({ type: 'gateway' }))).toBe(true)
  })

  it('computes API version support', () => {
    // codesmart is a valid system provider, not in NOT_SUPPORT list -> true
    expect(isSupportAPIVersionProvider(createSystemProvider())).toBe(true)
    // github is no longer a system provider; test via apiOptions instead
    expect(isSupportAPIVersionProvider(createProvider({ apiOptions: { isNotSupportAPIVersion: false } }))).toBe(false)
    expect(isSupportAPIVersionProvider(createProvider())).toBe(true)
  })
})
