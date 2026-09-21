import { catchError } from './catch-error.util';
import { TryCatchException } from './try-catch-exception.interface';
import { TryCatchOptions } from './try-catch-options.interface';

export function TryCatch(exception: TryCatchException, options?: TryCatchOptions): MethodDecorator;
export function TryCatch(options: TryCatchOptions): MethodDecorator;
export function TryCatch(optionsOrException = {} as TryCatchOptions | TryCatchException, options = {} as TryCatchOptions) {
    // return the decorator function
    return (_target: any, _key: any, descriptor: any) => {
        // store original method
        const originalMethod = descriptor.value;

        // check if original methods is async
        if (!options.isSynchronous) {
            descriptor.value = async function(...args: any[]) {
                const runFunctionAsync = async (finallyFn?: () => void) => {
                    try {
                        return await originalMethod.apply(this, args);
                    }
                    catch (error) {
                        catchError(error, optionsOrException, options);
                    } finally {
                        if (finallyFn) {
                            finallyFn()
                        }
                    }
                }
                return await runFunctionAsync();
            };
        } else {
            descriptor.value = function(...args: any[]) {
                const runFunction = (finallyFn?: () => void) => {
                    try {
                        return originalMethod.apply(this, args);
                    }
                    catch (error) {
                        catchError(error, optionsOrException, options);
                    } finally {
                        if (finallyFn) {
                            finallyFn()
                        }
                    }
                }

                return runFunction()
            };
        }

        return descriptor;
    };
}
