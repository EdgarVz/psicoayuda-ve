import { test, expect } from '@playwright/test'

test.describe('Full flow and navigation', () => {
  test('home page loads with hero text', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toBeVisible()
  })

  test('navigation to catalog works', async ({ page }) => {
    await page.goto('/psicologos')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Psicólogos disponibles')
  })

  test('navigation to login works', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Bienvenido de vuelta')
  })

  test('navigation to registro-psicologo works', async ({ page }) => {
    await page.goto('/registro-psicologo')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Regístrate')
  })

  test('como-funciona page loads with FAQ accordion', async ({ page }) => {
    await page.goto('/como-funciona')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('¿Cómo funciona?')
    await expect(page.getByText('¿Qué es PsicoAyuda VE?')).toBeVisible()
    await expect(page.getByText('¿Cómo solicito ayuda?')).toBeVisible()

    await page.getByRole('button', { name: '¿Qué es PsicoAyuda VE?' }).click()
    await expect(page.getByText('directorio gratuito')).toBeVisible()
  })

  test('magic link form works', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await page.fill('input[type="email"]', 'test@example.com')
    await page.getByRole('button', { name: /enviar enlace mágico/i }).click()
    await expect(page.getByText('Revisa tu correo')).toBeVisible()
  })

  test('404 page for invalid route', async ({ page }) => {
    const response = await page.goto('/ruta-inexistente')
    expect(response?.status()).toBe(404)
  })
})
