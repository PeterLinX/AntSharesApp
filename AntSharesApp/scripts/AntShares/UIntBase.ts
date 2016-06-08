namespace AntShares
{
    export abstract class UIntBase
    {
        protected _bytes: Uint8Array;

        public get data_bytes()
        {
            return this._bytes;
        }

        constructor(bytes:number, value:Uint8Array)
        {
            if (value == null)
            {
                this._bytes = new Uint8Array(bytes);
                return;
            }
            if (value.length != bytes) throw new RangeError();
            this._bytes = value;
        }

        
        
    }
}
