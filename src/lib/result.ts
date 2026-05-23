export interface Failure<E = unknown> {
  _tag: 'Failure';
  error: E;
}

export interface Success<T = void> {
  _tag: 'Success';
  value: T;
}

export type Result<T = void, E = unknown> = Failure<E> | Success<T>;

export function ok<T = void>(value: T): Success<T> {
  return {
    _tag: 'Success',
    value,
  };
}

export function err<const E = unknown>(error: E): Failure<E> {
  return {
    _tag: 'Failure',
    error,
  };
}

export function isOk<T, E>(result: Result<T, E>): result is Success<T> {
  return result._tag === 'Success';
}

export function isErr<T, E>(result: Result<T, E>): result is Failure<E> {
  return result._tag === 'Failure';
}
