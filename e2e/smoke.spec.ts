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

  test('Catálogo carga con filtro de especialidad', async ({ page }) => {
    await page.goto('/psicologos')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Psicólogos disponibles')
    await page.getByRole('button', { name: 'Ansiedad' }).click()
    await expect(page).toHaveURL(/specialties=ansiedad/)
  })

  test('Registro de psicólogo carga el formulario', async ({ page }) => {
    await page.goto('/registro-psicologo')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Regístrate')
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.getByRole('button', { name: /registrarme/i })).toBeVisible()
  })

  test('Login muestra formulario Magic Link', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Bienvenido de vuelta')
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.getByRole('button', { name: /enviar enlace mágico/i })).toBeVisible()
  })

  test('CSP header presente', async ({ page }) => {
    const response = await page.goto('/')
    expect(response).not.toBeNull()
    const headers = response!.headers()
    expect(headers['content-security-policy']).toBeDefined()
  })
})
