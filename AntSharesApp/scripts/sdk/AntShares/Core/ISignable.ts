namespace AntShares.Core
{
    export interface ISignable extends IO.ISerializable
    {
        // 用于验证该对象的脚本列表
        scripts: Core.Scripts.Script[];

        deserializeUnsigned(reader: IO.BinaryReader): void;
        getScriptHashesForVerifying(): PromiseLike<Uint160[]>;
        serializeUnsigned(writer: IO.BinaryWriter): void;
    }
}
