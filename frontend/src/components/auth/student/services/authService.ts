import { studentCourseService } from '../../../../features/student/studentCourses/services';
import { apiFetch } from '../../../../services/api';

export interface StudentLoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface StudentSignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

export interface PendingCommunity {
  subdirectory: string;
  communityName: string;
}

export class StudentAuthService {
  /**
   * Check for pending community join from localStorage
   */
  static checkPendingCommunity(): PendingCommunity | null {
    try {
      const pending = localStorage.getItem('pendingCommunityJoin');
      return pending ? JSON.parse(pending) : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Clear pending community from localStorage
   */
  static clearPendingCommunity(): void {
    localStorage.removeItem('pendingCommunityJoin');
  }

  /**
   * Handle auto-joining a pending community
   */
  static async handlePendingCommunityJoin(pendingCommunity: PendingCommunity): Promise<void> {
    try {
      await studentCourseService.joinCommunity(pendingCommunity.subdirectory);
      
      this.clearPendingCommunity();
      return Promise.resolve();
    } catch (error: any) {
      this.clearPendingCommunity();
      throw error;
    }
  }

  /**
   * Validate student login form data
   */
  static validateLoginForm(data: StudentLoginData): Record<string, string> {
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
   * Validate student signup form data
   */
  static validateSignupForm(data: StudentSignupData): Record<string, string> {
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
}
