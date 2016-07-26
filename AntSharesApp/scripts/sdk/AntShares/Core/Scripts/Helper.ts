interface ArrayBuffer
{
    toScriptHash(): PromiseLike<AntShares.Uint160>;
}

interface Uint8Array
{
    toScriptHash(): PromiseLike<AntShares.Uint160>;
}

ArrayBuffer.prototype.toScriptHash = Uint8Array.prototype.toScriptHash = function (): PromiseLike<AntShares.Uint160>
{
    return window.crypto.subtle.digest("SHA-256", this).then(result =>
    {
        return window.crypto.subtle.digest("RIPEMD-160", result);
    }).then(result =>
    {
        return new AntShares.Uint160(result);
    });
}
