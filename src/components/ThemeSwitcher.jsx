import React from 'react'
import { useSettings } from '../context/SettingsContext.jsx'

const ThemeSwitcher = () => {
  const { settings, updateSettings } = useSettings()

  const themes = [
    { value: 'light', icon: '☀️', label: 'Light' },
    { value: 'dark', icon: '🌙', label: 'Dark' },
    { value: 'system', icon: '💻', label: 'System' },
  ]

  const handleThemeChange = (theme) => {
    updateSettings({ theme })
  }

  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-surface p-1 border border-subtle">
      {themes.map((t) => {
        const active = settings.theme === t.value
        return (
          <button
            key={t.value}
            type="button"
            onClick={() => handleThemeChange(t.value)}
            className={`
              inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-all
              ${
                active
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-soft hover:bg-primary-soft'
              }
            `}
          >
            <span>{t.icon}</span>
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export default ThemeSwitcher