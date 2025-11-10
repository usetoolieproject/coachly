// Cookie utility functions for promo code storage

export function setCookie(name: string, value: string, days: number = 1): void {
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;domain=.usecoachly.com;SameSite=Lax`;
}

export function getCookie(name: string): string | null {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) {
      const value = c.substring(nameEQ.length, c.length);
      return value;
    }
  }
  return null;
}

export function deleteCookie(name: string): void {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;domain=.usecoachly.com;`;
}

// Sidebar state management
export function setSidebarCollapsed(collapsed: boolean): void {
  setCookie('sidebar_collapsed', collapsed ? 'true' : 'false', 365);
}

export function getSidebarCollapsed(): boolean {
  const value = getCookie('sidebar_collapsed');
  return value === 'true';
}