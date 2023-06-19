// Implements a function dispose(), which destructs the object.
// Call to dispose() should free resources and references those
// resources.
declare interface IDisposable {
    // Call when destructing this object.
    dispose(): void;
}

declare type TypedArray =
    | Int8Array
    | Uint8Array
    | Uint8ClampedArray
    | Int16Array
    | Uint16Array
    | Int32Array
    | Uint32Array
    | Float32Array
    | Float64Array;
