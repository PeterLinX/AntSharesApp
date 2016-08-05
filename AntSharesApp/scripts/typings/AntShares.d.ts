declare function escape(s: string): string;
declare function unescape(s: string): string;

interface Algorithm
{
    hash?: Algorithm;
    iv?: ArrayBuffer | ArrayBufferView;
    length?: number;
    namedCurve?: string;
}

interface Crypto
{
    webkitSubtle?: SubtleCrypto;
}

interface Map<TKey, TValue>
{
    size: number;
    clear(): void;
    delete(key: TKey): boolean;
    forEach(callback: (value: TValue, key: TKey, map: Map<TKey, TValue>) => void): void;
    get(key: TKey): TValue;
    has(key: TKey): boolean;
    set(key: TKey, value: TValue): void;
}

interface MapConstructor
{
    new <TKey, TValue>(): Map<TKey, TValue>;
    prototype: Map<any, any>;
}

interface PromiseConstructor
{
    new <T>(executor: (resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void): PromiseLike<T>;
    all<T>(iterable: PromiseLike<T>[]): PromiseLike<T[]>;
    resolve<T>(value: T | PromiseLike<T>): PromiseLike<T>;
    resolve(): PromiseLike<void>;
    prototype: PromiseLike<any>;
}

interface PromiseLike<T>
{
    catch<TResult>(onRejected: Func<any, TResult | PromiseLike<TResult>>): PromiseLike<TResult>;
}

interface SubtleCrypto
{
    digest(algorithm: string | Algorithm, data: ArrayBuffer): any;
}

interface Touch
{
    radiusX: number;
    radiusY: number;
    force: number;
}

interface Window
{
    msCrypto?: Crypto;
    Promise: PromiseConstructorLike;
    Map: MapConstructor;
    mozIndexedDB: IDBFactory;
    webkitIndexedDB: IDBFactory;
}

declare var Map: MapConstructor;
declare var Promise: PromiseConstructor;
