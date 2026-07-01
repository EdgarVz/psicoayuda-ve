import { test, expect } from '@playwright/test'

test.describe('Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('renders magic link form', async ({ page }) => {
    await expect(page.getByLabel(/correo/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /enviar/i })).toBeVisible()
  })

  test('has link to registration', async ({ page }) => {
    await expect(page.getByText(/psicólogo/i)).toBeVisible()
  })
})
