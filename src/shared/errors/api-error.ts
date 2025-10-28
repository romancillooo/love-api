export class ApiError extends Error {
  readonly statusCode: number;
  readonly details?: unknown;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export const createNotFoundError = (message = 'Resource not found') =>
  new ApiError(404, message);

export const createUnauthorizedError = (message = 'Unauthorized') =>
  new ApiError(401, message);

