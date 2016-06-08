/// <reference path="UIntBase.ts"/>

namespace AntShares
{
    export class UInt256 extends UIntBase
    {
        public static Zero = new UInt256();

        constructor(value: Uint8Array = null) { super(32, value); }

    }
}
