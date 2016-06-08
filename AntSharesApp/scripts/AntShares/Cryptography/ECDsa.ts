namespace AntShares.Cryptography
{
    export class ECDsa
    {
        constructor(private key: ECDsaCryptoKey)
        {
        }

        private static calculateE(n: BigInteger, message: ArrayBuffer | ArrayBufferView): BigInteger
        {
            return BigInteger.fromUint8Array(new Uint8Array(Sha256.computeHash(message)), 1, false);
        }

        public static generateKey(curve: ECCurve): { privateKey: ECDsaCryptoKey, publicKey: ECDsaCryptoKey }
        {
            let prikey = new Uint8Array(32);
            window.crypto.getRandomValues(prikey);
            let pubkey = ECPoint.multiply(curve.G, prikey);
            return {
                privateKey: new ECDsaCryptoKey(pubkey, prikey),
                publicKey: new ECDsaCryptoKey(pubkey)
            };
        }

        public sign(message: ArrayBuffer | ArrayBufferView): ArrayBuffer
        {
            if (this.key.privateKey == null) throw new Error();
            let e = ECDsa.calculateE(this.key.publicKey.curve.N, message);
            let d = BigInteger.fromUint8Array(this.key.privateKey, 1, false);
            let r: BigInteger, s: BigInteger;
            do
            {
                let k: BigInteger;
                do
                {
                    do
                    {
                        k = BigInteger.random(this.key.publicKey.curve.N.bitLength(), window.crypto);
                    }
                    while (k.sign() == 0 || k.compare(this.key.publicKey.curve.N) >= 0);
                    let p = ECPoint.multiply(this.key.publicKey.curve.G, k);
                    let x = p.x.value;
                    r = x.mod(this.key.publicKey.curve.N);
                }
                while (r.sign() == 0);
                s = k.modInverse(this.key.publicKey.curve.N).multiply(e.add(d.multiply(r))).mod(this.key.publicKey.curve.N);
                if (s.compare(this.key.publicKey.curve.N.divide(2)) > 0)
                {
                    s = this.key.publicKey.curve.N.subtract(s);
                }
            }
            while (s.sign() == 0);
            let arr = new Uint8Array(64);
            Array.copy(r.toUint8Array(false, 32), 0, arr, 0, 32);
            Array.copy(s.toUint8Array(false, 32), 0, arr, 32, 32);
            return arr.buffer;
        }

        private static sumOfTwoMultiplies(P: ECPoint, k: BigInteger, Q: ECPoint, l: BigInteger): ECPoint
        {
            let m = Math.max(k.bitLength(), l.bitLength());
            let Z = ECPoint.add(P, Q);
            let R = P.curve.Infinity;
            for (let i = m - 1; i >= 0; --i)
            {
                R = R.twice();
                if (k.testBit(i))
                {
                    if (l.testBit(i))
                        R = ECPoint.add(R, Z);
                    else
                        R = ECPoint.add(R, P);
                }
                else
                {
                    if (l.testBit(i))
                        R = ECPoint.add(R, Q);
                }
            }
            return R;
        }

        public verify(message: ArrayBuffer | ArrayBufferView, signature: ArrayBuffer | ArrayBufferView): boolean
        {
            let arr = Uint8Array.fromArrayBuffer(signature);
            let r = BigInteger.fromUint8Array(arr.subarray(0, 32), 1, false);
            let s = BigInteger.fromUint8Array(arr.subarray(32, 64), 1, false);
            if (r.compare(this.key.publicKey.curve.N) >= 0 || s.compare(this.key.publicKey.curve.N) >= 0)
                return false;
            let e = ECDsa.calculateE(this.key.publicKey.curve.N, message);
            let c = s.modInverse(this.key.publicKey.curve.N);
            let u1 = e.multiply(c).mod(this.key.publicKey.curve.N);
            let u2 = r.multiply(c).mod(this.key.publicKey.curve.N);
            let point = ECDsa.sumOfTwoMultiplies(this.key.publicKey.curve.G, u1, this.key.publicKey, u2);
            let v = point.x.value.mod(this.key.publicKey.curve.N);
            return v.equals(r);
        }
    }
}
