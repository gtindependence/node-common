import { Tags } from '../interfaces';

/**
 * Shape shared by the application's base exception class. `error` is the wrapped error (if any)
 * and `tags` are attached to the error when it is reported.
 */
export interface BaseErrorInstance extends Error {
    error?: Error;
    tags?: Tags;
}

// abstract so abstract base classes can be assigned; the constructor args vary by application
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type BaseErrorConstructor = abstract new (...args: any[]) => BaseErrorInstance;
