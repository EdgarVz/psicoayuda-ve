import { test, expect } from '@playwright/test'

test.describe('Psychologist Registration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/registro-psicologo')
  })

  test('form renders with all fields', async ({ page }) => {
    await expect(page.getByText('Regístrate como psicólogo voluntario')).toBeVisible()
  })

  test('shows validation error on empty submit', async ({ page }) => {
    await page.getByRole('button', { name: /registrarse/i }).click()
    await expect(page.getByText(/obligatorio/i)).toBeVisible()
  })
})
