interface Uint8Array
{
    asSerializable(T: Function): AntShares.IO.ISerializable;
}

interface Uint8ArrayConstructor
{
    fromSerializable(obj: AntShares.IO.ISerializable): Uint8Array;
}

Uint8Array.prototype.asSerializable = function (T: Function): AntShares.IO.ISerializable
{
    let ms = new AntShares.IO.MemoryStream(this.buffer, false);
    let reader = new AntShares.IO.BinaryReader(ms);
    return reader.readSerializable(T);
}

Uint8Array.fromSerializable = function (obj: AntShares.IO.ISerializable): Uint8Array
{
    let ms = new AntShares.IO.MemoryStream();
    let writer = new AntShares.IO.BinaryWriter(ms);
    obj.serialize(writer);
    return new Uint8Array(ms.toArray());
}
