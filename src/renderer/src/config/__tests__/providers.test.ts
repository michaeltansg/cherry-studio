import { getProviderLogo, PROVIDER_URLS, SYSTEM_PROVIDERS, SYSTEM_PROVIDERS_CONFIG } from '@renderer/config/providers'
import { describe, expect, it } from 'vitest'

describe('providers config', () => {
  describe('SYSTEM_PROVIDERS_CONFIG', () => {
    it('should contain the CodeSmart provider', () => {
      const providerIds = Object.keys(SYSTEM_PROVIDERS_CONFIG)
      expect(providerIds).toContain('codesmart')
    })

    it('should have correct CodeSmart configuration', () => {
      const codesmart = SYSTEM_PROVIDERS_CONFIG.codesmart
      expect(codesmart).toBeDefined()
      expect(codesmart.id).toBe('codesmart')
      expect(codesmart.name).toBe('CodeSmart')
      expect(codesmart.type).toBe('openai')
      expect(codesmart.apiHost).toBe('http://localhost:4000/v1')
      expect(codesmart.isSystem).toBe(true)
      expect(codesmart.enabled).toBe(true)
    })
  })

  describe('SYSTEM_PROVIDERS', () => {
    it('should contain the CodeSmart provider', () => {
      const codesmartProvider = SYSTEM_PROVIDERS.find((p) => p.id === 'codesmart')
      expect(codesmartProvider).toBeDefined()
      expect(codesmartProvider!.name).toBe('CodeSmart')
    })
  })

  describe('PROVIDER_URLS', () => {
    it('should contain CodeSmart URL entry', () => {
      expect(PROVIDER_URLS.codesmart).toBeDefined()
    })

    it('should point CodeSmart API to localhost LiteLLM proxy', () => {
      expect(PROVIDER_URLS.codesmart.api.url).toBe('http://localhost:4000/v1')
    })

    it('should not have website URLs for CodeSmart', () => {
      expect(PROVIDER_URLS.codesmart.websites).toBeUndefined()
    })
  })

  describe('getProviderLogo', () => {
    it('should return empty string for codesmart (no custom logo)', () => {
      expect(getProviderLogo('codesmart')).toBe('')
    })
  })
})
