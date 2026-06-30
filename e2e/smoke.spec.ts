import { test, expect } from '@playwright/test'

test.describe('Smoke tests', () => {
  test('Home page loads with hero text', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Un espacio para hablar')
  })

  test('Navigation to /psicologos works', async ({ page }) => {
    await page.goto('/psicologos')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Psicólogos disponibles')
  })

  test('Navigation to /login works', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Bienvenido de vuelta')
  })

  test('404 page for invalid route', async ({ page }) => {
    const response = await page.goto('/ruta-inexistente')
    expect(response?.status()).toBe(404)
  })
})
