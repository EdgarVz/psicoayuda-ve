import { test, expect } from '@playwright/test'
import psychologists from './fixtures/psychologists.json' assert { type: 'json' }

test.describe('Catalog', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/rest/v1/psychologist_profiles**', async (route) => {
      await route.fulfill({ json: psychologists })
    })
    await page.goto('/psicologos')
  })

  test('loads and displays psychologists', async ({ page }) => {
    await expect(page.getByText('Carlos Mendoza')).toBeVisible()
    await expect(page.getByText('Ana Lucía Rivas')).toBeVisible()
  })
})
