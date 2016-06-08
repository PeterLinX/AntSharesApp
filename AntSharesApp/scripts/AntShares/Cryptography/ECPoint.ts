namespace AntShares.Cryptography
{
    export class ECPoint
    {
        constructor(public x: ECFieldElement, public y: ECFieldElement, public curve: ECCurve)
        {
            if ((x == null) != (y == null))
                throw new RangeError("Exactly one of the field elements is null");
        }

        public static add(x: ECPoint, y: ECPoint): ECPoint
        {
            if (x.isInfinity()) return y;
            if (y.isInfinity()) return x;
            if (x.x.equals(y.x))
            {
                if (x.y.equals(y.y)) return x.twice();
                console.assert(x.y.equals(y.y.negate()));
                return x.curve.Infinity;
            }
            let gamma = y.y.subtract(x.y).divide(y.x.subtract(x.x));
            let x3 = gamma.square().subtract(x.x).subtract(y.x);
            let y3 = gamma.multiply(x.x.subtract(x3)).subtract(x.y);
            return new ECPoint(x3, y3, x.curve);
        }

        public static decodePoint(encoded: Uint8Array, curve: ECCurve): ECPoint
        {
            let p: ECPoint;
            let expectedLength = Math.ceil(curve.Q.bitLength() / 8);
            switch (encoded[0])
            {
                case 0x00: // infinity
                    {
                        if (encoded.length != 1)
                            throw new RangeError("Incorrect length for infinity encoding");
                        p = curve.Infinity;
                        break;
                    }
                case 0x02: // compressed
                case 0x03: // compressed
                    {
                        if (encoded.length != (expectedLength + 1))
                            throw new RangeError("Incorrect length for compressed encoding");
                        let yTilde = encoded[0] & 1;
                        let X1 = BigInteger.fromUint8Array(encoded.subarray(1), 1, false);
                        p = ECPoint.decompressPoint(yTilde, X1, curve);
                        break;
                    }
                case 0x04: // uncompressed
                case 0x06: // hybrid
                case 0x07: // hybrid
                    {
                        if (encoded.length != (2 * expectedLength + 1))
                            throw new RangeError("Incorrect length for uncompressed/hybrid encoding");
                        let X1 = BigInteger.fromUint8Array(encoded.subarray(1, 1 + expectedLength), 1, false);
                        let Y1 = BigInteger.fromUint8Array(encoded.subarray(1 + expectedLength), 1, false);
                        p = new ECPoint(new ECFieldElement(X1, curve), new ECFieldElement(Y1, curve), curve);
                        break;
                    }
                default:
                    throw new RangeError("Invalid point encoding " + encoded[0]);
            }
            return p;
        }

        private static decompressPoint(yTilde: number, X1: BigInteger, curve: ECCurve): ECPoint
        {
            let x = new ECFieldElement(X1, curve);
            let alpha = x.multiply(x.square().add(curve.A)).add(curve.B);
            let beta = alpha.sqrt();

            //
            // if we can't find a sqrt we haven't got a point on the
            // curve - run!
            //
            if (beta == null)
                throw new RangeError("Invalid point compression");

            let betaValue = beta.value;
            let bit0 = betaValue.isEven() ? 0 : 1;

            if (bit0 != yTilde)
            {
                // Use the other root
                beta = new ECFieldElement(curve.Q.subtract(betaValue), curve);
            }

            return new ECPoint(x, beta, curve);
        }

        public encodePoint(commpressed: boolean): Uint8Array
        {
            if (this.isInfinity()) return new Uint8Array(1);
            let data: Uint8Array;
            if (commpressed)
            {
                data = new Uint8Array(33);
            }
            else
            {
                data = new Uint8Array(65);
                let yBytes = this.y.value.toUint8Array();
                for (let i = 0; i < yBytes.length; i++)
                    data[65 - yBytes.length + i] = yBytes[yBytes.length - 1 - i];
            }
            let xBytes = this.x.value.toUint8Array();
            for (let i = 0; i < xBytes.length; i++)
                data[33 - xBytes.length + i] = xBytes[xBytes.length - 1 - i];
            data[0] = commpressed ? this.y.value.isEven() ? 0x02 : 0x03 : 0x04;
            return data;
        }

        public static fromUint8Array(arr: Uint8Array, curve: ECCurve): ECPoint
        {
            switch (arr.length)
            {
                case 33:
                case 65:
                    return ECPoint.decodePoint(arr, curve);
                case 64:
                case 72:
                    {
                        let arr_new = new Uint8Array(65);
                        arr_new[0] = 0x04;
                        arr_new.set(arr.subarray(arr.length - 64), 1);
                        return ECPoint.decodePoint(arr_new, curve);
                    }
                case 96:
                case 104:
                    {
                        let arr_new = new Uint8Array(65);
                        arr_new[0] = 0x04;
                        arr_new.set(arr.subarray(arr.length - 96, arr.length - 32), 1);
                        return ECPoint.decodePoint(arr_new, curve);
                    }
                default:
                    throw new RangeError();
            }
        }

        public isInfinity(): boolean
        {
            return this.x == null && this.y == null;
        }

        public static multiply(p: ECPoint, n: Uint8Array | BigInteger): ECPoint
        {
            let k = n instanceof Uint8Array ? BigInteger.fromUint8Array(n, 1, false) : n as BigInteger;
            if (p.isInfinity()) return p;
            if (k.isZero()) return p.curve.Infinity;

            // floor(log2(k))
            let m = k.bitLength();

            // width of the Window NAF
            let width: number;

            // Required length of precomputation array
            let reqPreCompLen: number;

            // Determine optimal width and corresponding length of precomputation
            // array based on literature values
            if (m < 13)
            {
                width = 2;
                reqPreCompLen = 1;
            }
            else if (m < 41)
            {
                width = 3;
                reqPreCompLen = 2;
            }
            else if (m < 121)
            {
                width = 4;
                reqPreCompLen = 4;
            }
            else if (m < 337)
            {
                width = 5;
                reqPreCompLen = 8;
            }
            else if (m < 897)
            {
                width = 6;
                reqPreCompLen = 16;
            }
            else if (m < 2305)
            {
                width = 7;
                reqPreCompLen = 32;
            }
            else
            {
                width = 8;
                reqPreCompLen = 127;
            }

            // The length of the precomputation array
            let preCompLen = 1;

            let preComp = [p];
            let twiceP = p.twice();

            if (preCompLen < reqPreCompLen)
            {
                // Precomputation array must be made bigger, copy existing preComp
                // array into the larger new preComp array
                let oldPreComp = preComp;
                preComp = new Array<ECPoint>(reqPreCompLen);
                for (let i = 0; i < preCompLen; i++)
                    preComp[i] = oldPreComp[i];
                for (let i = preCompLen; i < reqPreCompLen; i++)
                {
                    // Compute the new ECPoints for the precomputation array.
                    // The values 1, 3, 5, ..., 2^(width-1)-1 times p are
                    // computed
                    preComp[i] = ECPoint.add(twiceP, preComp[i - 1]);
                }
            }

            // Compute the Window NAF of the desired width
            let wnaf = ECPoint.windowNaf(width, k);
            let l = wnaf.length;

            // Apply the Window NAF to p using the precomputed ECPoint values.
            let q = p.curve.Infinity;
            for (let i = l - 1; i >= 0; i--)
            {
                q = q.twice();

                if (wnaf[i] != 0)
                {
                    if (wnaf[i] > 0)
                    {
                        q = ECPoint.add(q, preComp[Math.floor((wnaf[i] - 1) / 2)]);
                    }
                    else
                    {
                        // wnaf[i] < 0
                        q = ECPoint.subtract(q, preComp[Math.floor((-wnaf[i] - 1) / 2)]);
                    }
                }
            }

            return q;
        }

        public negate(): ECPoint
        {
            return new ECPoint(this.x, this.y.negate(), this.curve);
        }

        public serialize(): Uint8Array
        {
            return this.encodePoint(true);
        }

        public static subtract(x: ECPoint, y: ECPoint): ECPoint
        {
            if (y.isInfinity()) return x;
            return ECPoint.add(x, y.negate());
        }

        public twice(): ECPoint
        {
            if (this.isInfinity()) return this;
            if (this.y.value.sign() == 0) return this.curve.Infinity;
            let TWO = new ECFieldElement(new BigInteger(2), this.curve);
            let THREE = new ECFieldElement(new BigInteger(3), this.curve);
            let gamma = this.x.square().multiply(THREE).add(this.curve.A).divide(this.y.multiply(TWO));
            let x3 = gamma.square().subtract(this.x.multiply(TWO));
            let y3 = gamma.multiply(this.x.subtract(x3)).subtract(this.y);
            return new ECPoint(x3, y3, this.curve);
        }

        private static windowNaf(width: number, k: BigInteger): number[]
        {
            let wnaf = new Array<number>(k.bitLength() + 1);
            let pow2wB = 1 << width;
            let i = 0;
            let length = 0;
            while (k.sign() > 0)
            {
                if (!k.isEven())
                {
                    let remainder = BigInteger.remainder(k, pow2wB);
                    if (remainder.testBit(width - 1))
                    {
                        wnaf[i] = BigInteger.subtract(remainder, pow2wB).toInt32();
                    }
                    else
                    {
                        wnaf[i] = remainder.toInt32();
                    }
                    k = k.subtract(wnaf[i]);
                    length = i;
                }
                else
                {
                    wnaf[i] = 0;
                }
                k = k.rightShift(1);
                i++;
            }
            wnaf.length = length + 1;
            return wnaf;
        }
    }
}
