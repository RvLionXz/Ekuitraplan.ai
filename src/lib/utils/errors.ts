export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly code: string,
    public readonly statusCode: number,
    public readonly isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super(`${resource} not found${id ? `: ${id}` : ''}`, "NOT_FOUND", 404);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = "Validation failed", public readonly errors?: any) {
    super(message, "VALIDATION_ERROR", 422);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized access") {
    super(message, "UNAUTHORIZED", 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden access") {
    super(message, "FORBIDDEN", 403);
  }
}