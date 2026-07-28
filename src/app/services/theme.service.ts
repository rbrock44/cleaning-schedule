import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'cleaning-schedule-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly theme = signal<Theme>(this.readInitialTheme());

  toggle(): void {
    this.setTheme(this.theme() === 'dark' ? 'light' : 'dark');
  }

  setTheme(theme: Theme): void {
    this.theme.set(theme);

    if (!this.isBrowser) {
      return;
    }

    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }

  private readInitialTheme(): Theme {
    if (!this.isBrowser) {
      return 'dark';
    }

    // index.html sets this attribute before Angular loads to avoid a flash of the wrong theme.
    const attr = document.documentElement.getAttribute('data-theme');
    return attr === 'light' ? 'light' : 'dark';
  }
}
