export class WebsiteUtils {
  static getWebsiteUrl(user?: any): string {
    // If user data is passed directly, use it
    if (user?.instructor?.subdomain) {
      const subdomain = user.instructor.subdomain;
      
      // Check if we're in local development environment
      const isLocalDev = window.location.hostname === 'localhost' || 
                        window.location.hostname.includes('.lvh.me') ||
                        window.location.hostname === '127.0.0.1';
      
      let url;
      if (isLocalDev) {
        // Use lvh.me for local development
        const baseDomain = 'lvh.me:3000';
        url = `http://${subdomain}.${baseDomain}`;
      } else {
        // Use production domain
        const baseDomain = 'usecoachly.com';
        url = `https://${subdomain}.${baseDomain}`;
      }
      
      console.log('WebsiteUtils: Constructed URL with user data:', url);
      return url;
    }
    
    // Try to get user data from cookies (if available)
    try {
      // Check if there's a way to get user data from cookies
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'user' || name === 'userData') {
          const userData = JSON.parse(decodeURIComponent(value));
          if (userData?.instructor?.subdomain) {
            const subdomain = userData.instructor.subdomain;
            
            // Check if we're in local development environment
            const isLocalDev = window.location.hostname === 'localhost' || 
                              window.location.hostname.includes('.lvh.me') ||
                              window.location.hostname === '127.0.0.1';
            
            let url;
            if (isLocalDev) {
              // Use lvh.me for local development
              const baseDomain = 'lvh.me:3000';
              url = `http://${subdomain}.${baseDomain}`;
            } else {
              // Use production domain
              const baseDomain = 'usecoachly.com';
              url = `https://${subdomain}.${baseDomain}`;
            }
            
            console.log('WebsiteUtils: Constructed URL from cookies:', url);
            return url;
          }
        }
      }
    } catch (error) {
      console.error('Error parsing user data from cookies:', error);
    }
    
    console.log('WebsiteUtils: No subdomain found, falling back to origin');
    // Fallback to current origin if no subdomain found
    return window.location.origin;
  }

  static async copyWebsiteUrl(user?: any): Promise<void> {
    try {
      const url = this.getWebsiteUrl(user);
      await navigator.clipboard.writeText(url);
      
      // Show a subtle notification
      const notification = document.createElement('div');
      notification.textContent = 'Website URL copied to clipboard!';
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 10000;
        font-size: 14px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      `;
      document.body.appendChild(notification);
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 3000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
      // Fallback: show alert if clipboard API fails
      alert('Failed to copy URL. Please copy manually: ' + this.getWebsiteUrl(user));
    }
  }

  static openWebsiteUrl(user?: any): void {
    const url = this.getWebsiteUrl(user);
    window.open(url, '_blank');
  }
}
