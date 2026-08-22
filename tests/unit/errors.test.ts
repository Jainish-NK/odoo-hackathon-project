import {
  AppError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from '@/utils/errors';

describe('application errors', () => {
  it('AppError carries statusCode, code and message', () => {
    const err = new AppError(418, 'IM_A_TEAPOT', 'short and stout');
    expect(err).toBeInstanceOf(Error);
    expect(err.statusCode).toBe(418);
    expect(err.code).toBe('IM_A_TEAPOT');
    expect(err.message).toBe('short and stout');
  });

  it('ValidationError defaults to 400', () => {
    const err = new ValidationError();
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe('VALIDATION_ERROR');
  });

  it('UnauthorizedError defaults to 401', () => {
    expect(new UnauthorizedError().statusCode).toBe(401);
  });

  it('ForbiddenError defaults to 403', () => {
    expect(new ForbiddenError().statusCode).toBe(403);
  });

  it('NotFoundError derives its code from the resource name', () => {
    const err = new NotFoundError('Trip stop');
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe('TRIP_STOP_NOT_FOUND');
    expect(err.message).toBe('Trip stop not found');
  });

  it('ConflictError defaults to 409', () => {
    expect(new ConflictError().statusCode).toBe(409);
  });
});
