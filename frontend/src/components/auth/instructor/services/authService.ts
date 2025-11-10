import { apiFetch } from '../../../../services/api';

export interface InstructorLoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface InstructorSignupData {
  firstName: string;
  lastName: string;
  email: string;
  businessName: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
  subdomain?: string;
}

export class InstructorAuthService {
  /**
   * Validate instructor login form data
   */
  static validateLoginForm(data: InstructorLoginData): Record<string, string> {
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
   * Validate instructor signup form data
   */
  static validateSignupForm(data: InstructorSignupData): Record<string, string> {
    const errors: Record<string, string> = {};

    if (!data.firstName.trim()) {
      errors.firstName = "First name is required";
    }

    if (!data.lastName.trim()) {
      errors.lastName = "Last name is required";
    }

    if (!data.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      errors.email = "Please enter a valid email";
    }

    if (!data.businessName.trim()) {
      errors.businessName = "Business name is required";
    }

    if (!data.password.trim()) {
      errors.password = "Password is required";
    } else if (data.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    if (data.password !== data.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (!data.agreeToTerms) {
      errors.agreeToTerms = "You must agree to the terms and conditions";
    }

    return errors;
  }

  /**
   * Check if subdomain is available
   */
  static async checkSubdomainAvailability(subdomain: string): Promise<boolean> {
    if (!subdomain.trim()) return true;
    
    try {
      const data = await apiFetch(`/auth/check-subdomain/${subdomain}`);
      return data.available;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if email is already registered
   */
  static async checkEmailAvailability(email: string): Promise<boolean> {
    try {
      const data = await apiFetch('/auth/check-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      return data.available;
    } catch (error) {
      return false;
    }
  }

  /**
   * Generate subdomain from business name
   */
  static generateSubdomain(businessName: string): string {
    return businessName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  }

  /**
   * Validate subdomain format
   */
  static validateSubdomain(subdomain: string): Record<string, string> {
    const errors: Record<string, string> = {};

    if (!subdomain.trim()) {
      errors.subdomain = "Subdomain is required";
    } else if (subdomain.length < 3) {
      errors.subdomain = "Subdomain must be at least 3 characters";
    } else if (subdomain.length > 30) {
      errors.subdomain = "Subdomain must be less than 30 characters";
    } else if (!/^[a-z0-9-]+$/.test(subdomain)) {
      errors.subdomain = "Subdomain can only contain lowercase letters, numbers, and hyphens";
    } else if (subdomain.startsWith('-') || subdomain.endsWith('-')) {
      errors.subdomain = "Subdomain cannot start or end with a hyphen";
    }

    return errors;
  }
}
