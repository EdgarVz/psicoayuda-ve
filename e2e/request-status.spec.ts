import { test, expect } from '@playwright/test'
import requests from './fixtures/requests.json' assert { type: 'json' }

test.describe('Request Status', () => {
  test('shows WhatsApp button when accepted', async ({ page }) => {
    await page.route('**/rest/v1/appointment_requests**', async (route) => {
      await route.fulfill({ json: { data: [requests.data[1]] } })
    })
    await page.route('**/rest/v1/psychologist_profiles**', async (route) => {
      await route.fulfill({
        json: { data: [{ whatsapp_link: 'https://wa.me/584141234567' }] },
      })
    })
    await page.goto('/solicitud/req-2')
    await expect(page.getByText('Contactar por WhatsApp')).toBeVisible()
  })

  test('shows pending status when not accepted', async ({ page }) => {
    await page.route('**/rest/v1/appointment_requests**', async (route) => {
      await route.fulfill({ json: { data: [requests.data[0]] } })
    })
    await page.goto('/solicitud/req-1')
    await expect(page.getByText('Contactar por WhatsApp')).not.toBeVisible()
  })
})
