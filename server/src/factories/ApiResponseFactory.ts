/**
 * Standard API JSON bodies for success and error responses (Express `res.json(...)`).
 */
export class ApiResponseFactory {
  static successData<T>(data: T): { success: true; data: T } {
    return { success: true, data };
  }

  static successMessage(message: string): { success: true; message: string } {
    return { success: true, message };
  }

  /** Register / login / refresh: cookies + token payload */
  static authSession(user: unknown, accessToken: string): { success: true; user: unknown; accessToken: string } {
    return { success: true, user, accessToken };
  }

  static user(user: unknown): { success: true; user: unknown } {
    return { success: true, user };
  }

  static clientError(message: string): { success: false; message: string } {
    return { success: false, message };
  }

  static error(message: string, code: string): { success: false; message: string; code: string } {
    return { success: false, message, code };
  }
}
