namespace AntShares.Cryptography
{
    export class ECFieldElement
    {
        constructor(public value: BigInteger, private curve: ECCurve)
        {
            if (BigInteger.compare(value, curve.Q) >= 0)
                throw new RangeError("x value too large in field element");
        }

        public add(other: ECFieldElement): ECFieldElement
        {
            return new ECFieldElement(this.value.add(other.value).mod(this.curve.Q), this.curve);
        }

        public compareTo(other: ECFieldElement): number
        {
            if (this === other) return 0;
            return this.value.compareTo(other.value);
        }

        public divide(other: ECFieldElement): ECFieldElement
        {
            return new ECFieldElement(this.value.multiply(other.value.modInverse(this.curve.Q)).mod(this.curve.Q), this.curve);
        }

        public equals(other: ECFieldElement): boolean
        {
            return this.value.equals(other.value);
        }

        private static fastLucasSequence(p: BigInteger, P: BigInteger, Q: BigInteger, k: BigInteger): BigInteger[]
        {
            let n = k.bitLength();
            let s = k.getLowestSetBit();

            console.assert(k.testBit(s));

            let Uh = BigInteger.One;
            let Vl = new BigInteger(2);
            let Vh = P;
            let Ql = BigInteger.One;
            let Qh = BigInteger.One;

            for (let j = n - 1; j >= s + 1; --j)
            {
                Ql = BigInteger.mod(BigInteger.multiply(Ql, Qh), p);

                if (k.testBit(j))
                {
                    Qh = Ql.multiply(Q).mod(p);
                    Uh = Uh.multiply(Vh).mod(p);
                    Vl = Vh.multiply(Vl).subtract(P.multiply(Ql)).mod(p);
                    Vh = Vh.multiply(Vh).subtract(Qh.leftShift(1)).mod(p);
                }
                else
                {
                    Qh = Ql;
                    Uh = Uh.multiply(Vl).subtract(Ql).mod(p);
                    Vh = Vh.multiply(Vl).subtract(P.multiply(Ql)).mod(p);
                    Vl = Vl.multiply(Vl).subtract(Ql.leftShift(1)).mod(p);
                }
            }

            Ql = Ql.multiply(Qh).mod(p);
            Qh = Ql.multiply(Q).mod(p);
            Uh = Uh.multiply(Vl).subtract(Ql).mod(p);
            Vl = Vh.multiply(Vl).subtract(P.multiply(Ql)).mod(p);
            Ql = Ql.multiply(Qh).mod(p);

            for (let j = 1; j <= s; ++j)
            {
                Uh = Uh.multiply(Vl).multiply(p);
                Vl = Vl.multiply(Vl).subtract(Ql.leftShift(1)).mod(p);
                Ql = Ql.multiply(Ql).mod(p);
            }

            return [Uh, Vl];
        }

        public multiply(other: ECFieldElement): ECFieldElement
        {
            return new ECFieldElement(this.value.multiply(other.value).mod(this.curve.Q), this.curve);
        }

        public negate(): ECFieldElement
        {
            return new ECFieldElement(this.value.negate().mod(this.curve.Q), this.curve);
        }

        public sqrt(): ECFieldElement
        {
            if (this.curve.Q.testBit(1))
            {
                let z = new ECFieldElement(BigInteger.modPow(this.value, this.curve.Q.rightShift(2).add(1), this.curve.Q), this.curve);
                return z.square().equals(this) ? z : null;
            }
            let qMinusOne = this.curve.Q.subtract(1);
            let legendreExponent = qMinusOne.rightShift(1);
            if (BigInteger.modPow(this.value, legendreExponent, this.curve.Q).equals(1))
                return null;
            let u = qMinusOne.rightShift(2);
            let k = u.leftShift(1).add(1);
            let Q = this.value;
            let fourQ = Q.leftShift(2).mod(this.curve.Q);
            let U: BigInteger, V: BigInteger;
            do
            {
                let P: BigInteger;
                do
                {
                    P = BigInteger.random(this.curve.Q.bitLength());
                }
                while (P.compareTo(this.curve.Q) >= 0 || !BigInteger.modPow(P.multiply(P).subtract(fourQ), legendreExponent, this.curve.Q).equals(qMinusOne));
                let result = ECFieldElement.fastLucasSequence(this.curve.Q, P, Q, k);
                U = result[0];
                V = result[1];
                if (V.multiply(V).mod(this.curve.Q).equals(fourQ))
                {
                    if (V.testBit(0))
                    {
                        V = V.add(this.curve.Q);
                    }
                    V = V.rightShift(1);
                    console.assert(V.multiply(V).mod(this.curve.Q).equals(this.value));
                    return new ECFieldElement(V, this.curve);
                }
            }
            while (U.equals(BigInteger.One) || U.equals(qMinusOne));
            return null;
        }

        public square(): ECFieldElement
        {
            return new ECFieldElement(this.value.multiply(this.value).mod(this.curve.Q), this.curve);
        }

        public subtract(other: ECFieldElement): ECFieldElement
        {
            return new ECFieldElement(this.value.subtract(other.value).mod(this.curve.Q), this.curve);
        }
    }
}
