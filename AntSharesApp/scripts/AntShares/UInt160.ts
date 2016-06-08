/// <reference path="UIntBase.ts"/>

namespace AntShares
{
    export class UInt160 extends UIntBase
    {
        public static Zero = new UInt160();

        constructor(value: Uint8Array = null) { super(20, value); }

        
    }
}
