export interface AdminLoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export class AdminAuthService {
  /**
   * Validate admin login form data
   */
  static validateLoginForm(data: AdminLoginData): Record<string, string> {
    const errors: Record<string, string> = {};

    if (!data.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      errors.email = "Please enter a valid email";
    }

    if (!data.password.trim()) {
      errors.password = "Password is required";
    }

    return errors;
  }

  /**
   * Validate admin email format (can be extended for admin-specific validation)
   */
  static validateAdminEmail(email: string): boolean {
    // Basic email validation - can be extended for admin domain validation
    return /\S+@\S+\.\S+/.test(email);
  }

  /**
   * Check if email has admin privileges (placeholder for future implementation)
   */
  static async checkAdminPrivileges(email: string): Promise<boolean> {
    // This can be extended to check against an admin whitelist
    // For now, return true - actual implementation would check against backend
    return true;
  }
}
