import 'fake-indexeddb/auto'
import '@testing-library/jest-dom/vitest'
import '../i18n'
import { setPrefersDark } from './matchMedia'

// jsdom has no matchMedia, and the theme asks it what the system prefers.
setPrefersDark(false)
