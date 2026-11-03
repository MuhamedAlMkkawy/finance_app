/**
 * useTheme — persists dark/light mode in localStorage
 * and syncs the `.dark` class on <html> (used by PrimeVue + Tailwind).
 */
export const useTheme = () => {
  const isDark = useState('theme:dark', () => false)

  const applyTheme = (dark) => {
    if (import.meta.client) {
      document.documentElement.classList.toggle('dark', dark)
      document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
      localStorage.setItem('theme', dark ? 'dark' : 'light')
    }
  }

  const toggleTheme = () => {
    isDark.value = !isDark.value
    applyTheme(isDark.value)
  }

  const initTheme = () => {
    if (import.meta.client) {
      const saved = localStorage.getItem('theme')
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      const dark = saved ? saved === 'dark' : prefersDark
      isDark.value = dark
      applyTheme(dark)
    }
  }

  return { isDark, toggleTheme, initTheme }
}

