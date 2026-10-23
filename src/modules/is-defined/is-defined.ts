export function isDefined(obj: unknown) {
    if (obj === null) {
        return false;
    }
    if (obj === undefined) {
        return false;
    }
    return true;
}
