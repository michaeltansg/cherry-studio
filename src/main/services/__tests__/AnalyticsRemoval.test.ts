import { describe, expect, it } from 'vitest'

import packageJson from '../../../../package.json'

describe('analytics removal regression', () => {
  it('should not have @cherrystudio/analytics-client in package.json', () => {
    const allDeps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies
    }
    expect(allDeps).not.toHaveProperty('@cherrystudio/analytics-client')
  })

  it('should not be able to resolve AnalyticsService module', async () => {
    await expect(async () => {
      // @ts-expect-error - Module intentionally removed; verifying it stays absent
      await import('@main/services/AnalyticsService')
    }).rejects.toThrow()
  })
})
