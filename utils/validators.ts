export class Validators {
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private static readonly PASSWORD_MIN_LENGTH = 8;

  /**
   * Validates an email address
   * @param email The email to validate
   * @returns An error message if invalid, empty string if valid
   */
  static validateEmail(email: string): string {
    if (!email) {
      return "Email is required";
    }
    if (!this.EMAIL_REGEX.test(email)) {
      return "Please enter a valid email address";
    }
    return "";
  }

  /**
   * Validates a password against security requirements
   * @param password The password to validate
   * @returns An error message if invalid, empty string if valid
   */
  static validatePassword(password: string): string {
    if (!password) {
      return "Password is required";
    }

    const requirements = {
      hasLower: /[a-z]/.test(password),
      hasUpper: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>_]/.test(password),
      minLength: password.length >= this.PASSWORD_MIN_LENGTH,
    };

    const missingRequirements = Object.entries(requirements)
      .filter(([_, met]) => !met)
      .map(([req]) => {
        switch (req) {
          case "hasLower":
            return "lowercase letter";
          case "hasUpper":
            return "uppercase letter";
          case "hasNumber":
            return "number";
          case "hasSpecial":
            return "special character";
          case "minLength":
            return `minimum ${this.PASSWORD_MIN_LENGTH} characters`;
          default:
            return "";
        }
      })
      .filter(Boolean);

    if (missingRequirements.length > 0) {
      return `Password must contain at least one ${missingRequirements.join(
        ", "
      )}`;
    }

    return "";
  }

  /**
   * Sanitizes an email address
   * @param email The email to sanitize
   * @returns The sanitized email
   */
  static sanitizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }
}
