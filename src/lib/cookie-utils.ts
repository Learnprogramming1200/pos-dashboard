// Client-side cookie management utilities
export class ClientCookieManager {
  // Set a cookie
  static setCookie(name: string, value: string, days: number = 7, path: string = '/') {
    if (typeof window === 'undefined' || !name) {
      return;
    }
    
    // Prevent setting undefined/null string values
    if (value === 'undefined' || value === 'null' || value === undefined || value === null) {
      console.warn(`Attempted to set cookie ${name} with invalid value: ${value}`);
      return;
    }
    
    let expires = "";
    if (days > 0) {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = `; expires=${date.toUTCString()}`;
    }
    
    document.cookie = `${name}=${value}${expires};path=${path};SameSite=Lax`;
  }

  // Get a cookie value
  static getCookie(name: string): string | null {
    if (typeof window === 'undefined') {
      return null;
    }
    
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  }

  // Delete a cookie
  static deleteCookie(name: string, path: string = '/') {
    if (typeof window === 'undefined') {
      return;
    }
    
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=${path};`;
  }

  // Get all cookies as object
  static getAllCookies(): Record<string, string> {
    if (typeof window === 'undefined') {
      return {};
    }
    
    const allCookies: Record<string, string> = {};
    const cookies = document.cookie.split(';');
    
    cookies.forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      if (name && value) {
        allCookies[name] = value;
      }
    });
    
    return allCookies;
  }

   // Set auth token - USING POS-SESSION NOW
  static setAuthToken(token: string, days: number = 7) {
    this.setPosSession(token, days);
  }

  // Get auth token - USING POS-SESSION NOW
  static getAuthToken(): string | null {
    return this.getPosSession();
  } 

  // Set refresh token (supports both naming conventions)
  static setRefreshToken(token: string, days: number = 30) {
    this.setCookie('refreshToken', token, days);
  }

  // Get refresh token (supports both naming conventions)
  static getRefreshToken(): string | null {
    return this.getCookie('refreshToken');
  }

  // Set pos-session cookie
  static setPosSession(session: string, days: number = 1) {
    this.setCookie('pos-session', session, days);
  }

  // Get pos-session cookie
  static getPosSession(): string | null {
    return this.getCookie('pos-session');
  }
  // add new code 

  // Set pos-role cookie
  static setUserRole(role: string, days: number = 1) {
    this.setCookie('pos-role', role, days);
  }

  // Get pos-role cookie
  static getUserRole(): string | null {
    return this.getCookie('pos-role');
  }

  // Set session-land cookie (session only)
  static setSessionLand(isLanded: boolean = true) {
    this.setCookie('sessionLand', String(isLanded), 0); // 0 means session cookie
  }

  // Get session-land cookie
  static getSessionLand(): string | null {
    return this.getCookie('sessionLand');
  }

  // Clear all auth cookies
  static clearAuthCookies() {
    this.deleteCookie('token');
    this.deleteCookie('refreshToken');
    this.deleteCookie('pos-session');
    this.deleteCookie('pos-role');
    this.deleteCookie('sessionLand');
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    return !!this.getPosSession();
  }

  // Parse Set-Cookie header and set cookies
  static parseAndSetCookies(setCookieHeader: string | null) {
    if (!setCookieHeader || typeof window === 'undefined') {
      return;
    }
    
    const cookieStrings = setCookieHeader.split(/,(?=[^,]+=)/);
    
    cookieStrings.forEach(cookieString => {
      const parts = cookieString.split(';');
      const nameValuePart = parts[0].trim();
      
      if (nameValuePart && nameValuePart.includes('=')) {
        const equalIndex = nameValuePart.indexOf('=');
        const name = nameValuePart.substring(0, equalIndex).trim();
        const value = nameValuePart.substring(equalIndex + 1).trim();
        
        if (name && value) {
          // Extract expiration from cookie string if present
          let days = 7; // default
          const expiresMatch = cookieString.match(/expires=([^;]+)/);
          if (expiresMatch) {
            const expiresDate = new Date(expiresMatch[1]);
            const now = new Date();
            days = Math.ceil((expiresDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          }
          
          this.setCookie(name, value, days);
        }
      }
    });
  }
}

// Export singleton instance
export const clientCookieManager = new ClientCookieManager();
