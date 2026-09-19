import { expect, test, type Page } from '@playwright/test'

/**
 * The theme is entirely visual, so this checks what jsdom cannot: the colours
 * the browser actually paints, and that the first paint is not the wrong one.
 *
 * Colours are read back through a canvas because the palette is oklch, and
 * comparing colour strings would compare notation rather than colour.
 */
async function bodyColours(page: Page) {
  return page.evaluate(() => {
    const toRgb = (colour: string): [number, number, number] => {
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')!
      context.fillStyle = colour
      context.fillRect(0, 0, 1, 1)
      const [r, g, b] = context.getImageData(0, 0, 1, 1).data
      return [r as number, g as number, b as number]
    }

    const luminance = ([r, g, b]: [number, number, number]) => {
      const channel = (value: number) => {
        const v = value / 255
        return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
      }
      return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
    }

    const styles = getComputedStyle(document.body)
    const background = toRgb(styles.backgroundColor)
    const text = toRgb(styles.color)
    const [lighter, darker] = [luminance(text), luminance(background)].sort((a, b) => b - a) as [
      number,
      number,
    ]

    return {
      background,
      backgroundLuminance: luminance(background),
      contrast: (lighter + 0.05) / (darker + 0.05),
    }
  })
}

test.describe('dark system preference', () => {
  test.use({ colorScheme: 'dark' })

  test('follows the system into dark', async ({ page }) => {
    await page.goto('/')

    await expect(page.locator('html')).toHaveClass(/dark/)
    expect((await bodyColours(page)).backgroundLuminance).toBeLessThan(0.1)
  })

  test('an explicit light choice overrides the system and survives a reload', async ({ page }) => {
    await page.goto('/')
    await page.getByLabel('Theme').selectOption('light')

    await expect(page.locator('html')).not.toHaveClass(/dark/)
    expect((await bodyColours(page)).backgroundLuminance).toBeGreaterThan(0.8)

    await page.reload()
    await expect(page.locator('html')).not.toHaveClass(/dark/)
    expect((await bodyColours(page)).backgroundLuminance).toBeGreaterThan(0.8)
  })
})

test.describe('light system preference', () => {
  test.use({ colorScheme: 'light' })

  test('follows the system into light', async ({ page }) => {
    await page.goto('/')

    await expect(page.locator('html')).not.toHaveClass(/dark/)
    expect((await bodyColours(page)).backgroundLuminance).toBeGreaterThan(0.8)
  })

  test('body text meets WCAG AA in both themes', async ({ page }) => {
    await page.goto('/')

    for (const theme of ['light', 'dark'] as const) {
      await page.getByLabel('Theme').selectOption(theme)
      const { contrast } = await bodyColours(page)
      expect(contrast, `${theme} body contrast`).toBeGreaterThan(4.5)
    }
  })
})

test('sets color-scheme so browser chrome matches', async ({ page }) => {
  await page.goto('/')
  await page.getByLabel('Theme').selectOption('dark')

  await expect(page.locator('html')).toHaveCSS('color-scheme', 'dark')
})
