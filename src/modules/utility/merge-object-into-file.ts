import * as path from 'path';
import { deepmerge } from 'deepmerge-ts';

export function mergeObjectIntoFile(currentDir: string, pathName: string, object) {
    const filePath = path.join(currentDir, pathName);
    let fileObj;
    try {
        fileObj = require(filePath);
    } catch {
        fileObj = {};
    }
    return deepmerge(fileObj, object);
}
