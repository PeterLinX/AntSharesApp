namespace AntShares.Core
{
    export interface ISignable extends IO.ISerializable
    {
        deserializeUnsigned(reader: IO.BinaryReader): void;
        getScriptHashesForVerifying(): PromiseLike<Uint160[]>;
        serializeUnsigned(writer: IO.BinaryWriter): void;
    }
}
