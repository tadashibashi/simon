
declare interface ICopyable {
    copy(): any;
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

// Able to make a deep-clone of itself via "copy()"

