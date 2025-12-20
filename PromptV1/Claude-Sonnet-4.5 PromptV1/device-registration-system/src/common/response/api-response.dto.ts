export class ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    timestamp: string;
  
    constructor(success: boolean, data?: T, message?: string) {
      this.success = success;
      this.data = data;
      this.message = message;
      this.timestamp = new Date().toISOString();
    }
  
    static success<T>(data: T, message?: string): ApiResponse<T> {
      return new ApiResponse(true, data, message);
    }
  
    static error(message: string): ApiResponse<null> {
      return new ApiResponse(false, null, message);
    }
  }