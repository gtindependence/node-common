import { EventEmitter } from 'events';
import { BaseErrorConstructor } from './base-error-constructor.type';

export class TryCatchEmitter {
    private static emitter = new EventEmitter();

    static baseErrorClass?: BaseErrorConstructor | BaseErrorConstructor[];

    constructor() {}

    /**
     * Pass error to be emitted to listeners
     * @param error
     */
    static emit(error: unknown) {
        this.emitter.emit('error', error);
    }

    /**
     * Pass custom error handling function to be run when the
     * TryCatch emits an error
     * @param cb
     */
    static listen(cb: (error: unknown) => void) {
        this.emitter.on('error', (e) => cb(e));
    }
}
