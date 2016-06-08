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

interface Touch
{
    radiusX: number;
    radiusY: number;
    force: number;
}

interface Window
{
    msCrypto?: Crypto;
}
