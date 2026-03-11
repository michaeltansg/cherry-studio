import {
  getProviderLogo,
  PROVIDER_LOGO_MAP,
  PROVIDER_URLS,
  SYSTEM_PROVIDERS,
  SYSTEM_PROVIDERS_CONFIG
} from '@renderer/config/providers'
import { describe, expect, it } from 'vitest'

describe('providers config', () => {
  describe('SYSTEM_PROVIDERS_CONFIG', () => {
    it('should only contain the CodeSmart provider', () => {
      const providerIds = Object.keys(SYSTEM_PROVIDERS_CONFIG)
      expect(providerIds).toEqual(['codesmart'])
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

    it('should not contain any upstream third-party providers', () => {
      const upstreamProviderIds = [
        'openai',
        'anthropic',
        'gemini',
        'silicon',
        'deepseek',
        'openrouter',
        'groq',
        'ollama',
        'mistral',
        'azure-openai',
        'aws-bedrock'
      ]
      const configIds = Object.keys(SYSTEM_PROVIDERS_CONFIG)
      for (const id of upstreamProviderIds) {
        expect(configIds).not.toContain(id)
      }
    })
  })

  describe('SYSTEM_PROVIDERS', () => {
    it('should be an array with exactly one provider', () => {
      expect(SYSTEM_PROVIDERS).toHaveLength(1)
    })

    it('should contain only the CodeSmart provider', () => {
      expect(SYSTEM_PROVIDERS[0].id).toBe('codesmart')
    })
  })

  describe('PROVIDER_URLS', () => {
    it('should only contain CodeSmart URL entry', () => {
      const urlKeys = Object.keys(PROVIDER_URLS)
      expect(urlKeys).toEqual(['codesmart'])
    })

    it('should point CodeSmart API to localhost LiteLLM proxy', () => {
      expect(PROVIDER_URLS.codesmart.api.url).toBe('http://localhost:4000/v1')
    })

    it('should not have website URLs for CodeSmart', () => {
      expect(PROVIDER_URLS.codesmart.websites).toBeUndefined()
    })
  })

  describe('PROVIDER_LOGO_MAP', () => {
    it('should be an empty object', () => {
      expect(Object.keys(PROVIDER_LOGO_MAP)).toHaveLength(0)
    })
  })

  describe('getProviderLogo', () => {
    it('should return undefined for any provider', () => {
      expect(getProviderLogo('codesmart')).toBeUndefined()
      expect(getProviderLogo('openai')).toBeUndefined()
    })
  })
})
