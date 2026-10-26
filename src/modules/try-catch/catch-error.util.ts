import { Tags } from '../interfaces';
import { getTryCatchOptions } from './get-try-catch-options';
import { isBaseError } from './is-base-error.util';
import { TryCatchEmitter } from './try-catch-emitter';
import { TryCatchException } from './try-catch-exception.interface';
import { TryCatchOptions } from './try-catch-options.interface';


export function catchError(error: unknown, optionsOrException = {} as TryCatchOptions | TryCatchException, options = {} as TryCatchOptions) {
    const {exception, tryCatchOptions} = getTryCatchOptions(optionsOrException, options);
    options = tryCatchOptions;

    // append tags to exception or error and return
    const appendTags = <T>(target: T): T => {
        if (options && options.tags) {
            const tagged = target as T & { tags?: Tags };
            // the preexisting tag values override any added since they are closer
            // to where the error was thrown
            tagged.tags = {
                ...options.tags,
                ...(tagged.tags || {})
            };
        }
        return target;
    };

    // helper function to pass appropriate arguments to exception
    const getException = (caughtError: unknown, exceptionClass: TryCatchException) => {
        if (isBaseError(caughtError)) {
            return appendTags(caughtError);
        }

        // the exception constructors accept the caught error as an Error
        const errorArgument = caughtError as Error;
        if (new exceptionClass(errorArgument).error) {
            if (options.customResponseMessage) {
                return appendTags(new exceptionClass(errorArgument, options.customResponseMessage));
            }
            return appendTags(new exceptionClass(errorArgument));
        }

        if (options.customResponseMessage) {
            return appendTags(new exceptionClass(options.customResponseMessage));
        }
        return appendTags(new exceptionClass());
    };

    // wrap the error if wrapper passed
    if (options.errorWrapperClass) {
        error = new options.errorWrapperClass(error as Error);
    }

    let scopedException: unknown;

    // get exception instance if there is an exception passed in
    if (exception) {
        scopedException = getException(error, exception);
    }

    // if handler passed in capture the exception, otherwise throw it
    if (options.handleOnly) {
        // emit for app to subscribe to and handle
        TryCatchEmitter.emit(appendTags(scopedException || error));
    }
    else {
        throw appendTags(scopedException || error);
    }
}