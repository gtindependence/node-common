import * as Sentry from '@sentry/node';
import { faker } from '@faker-js/faker/locale/en';
import { Logger } from 'log4js';
import { Tags } from '../interfaces';
import { TryCatchEmitter } from '../try-catch';
import { StaticErrorHandlerService } from './static-error-handler';

class StubError extends Error {

    extraData: unknown;

    tags?: Tags;

    constructor(message: string, extraData: unknown, tags?: Tags) {
        super(message);

        this.extraData = extraData;

        this.tags = tags;
    }
}

describe('StaticErrorHandlerService', () => {

    const OLD_ENV = process.env;

    beforeEach(() => {

        jest.resetModules() // Most important - it clears the cache
        process.env = { ...OLD_ENV, DEPLOYMENT: 'aws' }; // Make a copy

        jest.spyOn(Sentry, 'captureException').mockImplementation(() => faker.string.uuid());

        StaticErrorHandlerService.logger = {
            error: jest.fn(),
            info: jest.fn()
        } as unknown as Logger;
        StaticErrorHandlerService.setConfiguration({
            useSentry: true
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
        process.env = OLD_ENV;
    })

    describe('isAcceptableSize', () => {
        it('should return false when given data is larger than the limit', async () => {
            const extraData = new Array(1000).map(() => faker.lorem.paragraph());

            const error = new StubError('Test Error', extraData);

            const result: boolean = StaticErrorHandlerService.isAcceptableSize(error, 1000);

            expect(result).toBe(false)
        });

        it('should return true when given data smaller than the limit', async () => {

            const error = new StubError('Test Error', []);

            const result: boolean = StaticErrorHandlerService.isAcceptableSize(error, 1000);

            expect(result).toBe(false)
        });
    });

    describe('sanitizeUnacceptablyLargeError', () => {
        it('should remove any key that is not stack or message', () => {
            let error = new StubError('test', ['data'], { tag1: 'otherData' });

            error = StaticErrorHandlerService.sanitizeUnacceptablyLargeError(error);

            expect(error.extraData).toBeUndefined();
            expect(error.tags).toBeUndefined();

            expect(error.stack).toBeDefined();
            expect(error.message).toEqual('test');
        })
    });

    describe('captureException with a baseErrorClass', () => {

        class BaseStubException extends Error {
            error?: Error;

            tags?: Tags;

            constructor(message: string, error?: Error, tags?: Tags) {
                super(message);

                this.error = error;

                this.tags = tags;
            }
        }

        class OtherBaseStubException extends BaseStubException {}

        afterEach(() => {
            TryCatchEmitter.baseErrorClass = undefined;
        });

        it('should report the wrapped error, named after the exception, with the exception tags', () => {
            TryCatchEmitter.baseErrorClass = BaseStubException;
            const innerError = new Error('inner');
            const exception = new BaseStubException('outer', innerError, { tag1: 'value' });

            StaticErrorHandlerService.captureException(exception);

            expect(Sentry.captureException).toHaveBeenCalledWith(innerError, { tags: { tag1: 'value' } });
            expect(innerError.name).toEqual('BaseStubException');
        });

        it('should report the exception itself when it wraps no error', () => {
            TryCatchEmitter.baseErrorClass = BaseStubException;
            const exception = new BaseStubException('outer', undefined, { tag1: 'value' });

            StaticErrorHandlerService.captureException(exception);

            expect(Sentry.captureException).toHaveBeenCalledWith(exception, { tags: { tag1: 'value' } });
        });

        it('should unwrap exceptions of any class when the baseErrorClass is an array', () => {
            TryCatchEmitter.baseErrorClass = [Error, OtherBaseStubException];
            const innerError = new Error('inner');
            const exception = new OtherBaseStubException('outer', innerError, { tag1: 'value' });

            StaticErrorHandlerService.captureException(exception);

            expect(Sentry.captureException).toHaveBeenCalledWith(innerError, { tags: { tag1: 'value' } });
        });

        it('should merge configured error tags with the exception tags, exception tags winning', () => {
            TryCatchEmitter.baseErrorClass = BaseStubException;
            StaticErrorHandlerService.setConfiguration({ useSentry: true, errorTags: { app: 'test', tag1: 'configured' } });
            const exception = new BaseStubException('outer', undefined, { tag1: 'value' });

            StaticErrorHandlerService.captureException(exception);

            expect(Sentry.captureException).toHaveBeenCalledWith(exception, { tags: { app: 'test', tag1: 'value' } });
        });

        it('should still report a plain error when a baseErrorClass is configured', () => {
            TryCatchEmitter.baseErrorClass = BaseStubException;
            const error = new Error('plain');

            StaticErrorHandlerService.captureException(error);

            expect(Sentry.captureException).toHaveBeenCalledWith(error, { tags: {} });
        });
    });

    describe('sanitizeException', () => {

        it('should sanitize an exception that is unacceptably large', () => {
            const extraData = new Array(1000).map(() => faker.lorem.paragraph());
            const largeError = new StubError('Test Error', extraData, {tag1: 'value'});
            const sanitizedError = new StubError('Sanitized Test Error', undefined);

            jest.spyOn(StaticErrorHandlerService, 'isAcceptableSize').mockImplementation(() => false);
            jest.spyOn(StaticErrorHandlerService, 'sanitizeUnacceptablyLargeError').mockImplementation(() => sanitizedError);

            StaticErrorHandlerService.captureException(largeError);

            expect(Sentry.captureException).toHaveBeenCalledWith(sanitizedError, {tags: {tag1: 'value'}});
        });

        it('should not sanitize an exception that is acceptably large', () => {
            const extraData = new Array(1000).map(() => faker.lorem.paragraph());
            const largeError = new StubError('Test Error', extraData, {tag1: 'value'});
            const sanitizedError = new StubError('Sanitized Error', undefined);

            jest.spyOn(StaticErrorHandlerService, 'isAcceptableSize').mockImplementation(() => true);
            jest.spyOn(StaticErrorHandlerService, 'sanitizeUnacceptablyLargeError').mockImplementation(() => sanitizedError);

            StaticErrorHandlerService.captureException(largeError);

            expect(Sentry.captureException).toHaveBeenCalledWith(largeError, {tags: {tag1: 'value'}});
        });


        it('it should create an error to capture if the function is called with an undefined error', () => {
            jest.spyOn(StaticErrorHandlerService, 'captureUndefinedException').mockImplementation(() =>{})
            StaticErrorHandlerService.captureException(undefined);

            expect(StaticErrorHandlerService.captureUndefinedException).toHaveBeenCalled()
        })
    })
});
