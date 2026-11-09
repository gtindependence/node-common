import { TryCatchEmitter } from './try-catch-emitter';

/**
 * Whether the value is an instance of the configured TryCatchEmitter.baseErrorClass (or any of them if an array).
 * Intentionally not a type guard: BaseErrorInstance is structurally satisfied by Error, so a guard would narrow
 * Error to never in the false branch.
 */
export function isBaseError(value: unknown): boolean {
    const { baseErrorClass } = TryCatchEmitter;
    if (!baseErrorClass) {
        return false;
    }

    const baseErrorClasses = Array.isArray(baseErrorClass) ? baseErrorClass : [baseErrorClass];
    return baseErrorClasses.some((errorClass) => value instanceof errorClass);
}
