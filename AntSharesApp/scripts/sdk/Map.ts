if (window.Map == null) window.Map = class <TKey, TValue>
{
    private _map = new Object();
    private _size = 0;

    public get size() { return this._size; }

    public clear(): void
    {
        for (let key in this._map)
            delete this._map[key];
        this._size = 0;
    }

    public delete(key: TKey): boolean
    {
        if (!this._map.hasOwnProperty(<any>key))
            return false;
        this._size--;
        return delete this._map[<any>key];
    }

    public forEach(callback: (value: TValue, key: TKey, map: Map<TKey, TValue>) => void): void
    {
        for (let key in this._map)
            callback(this._map[key], <any>key, this);
    }

    public get(key: TKey): TValue
    {
        return this._map[<any>key];
    }

    public has(key: TKey): boolean
    {
        return this._map.hasOwnProperty(<any>key);
    }

    public set(key: TKey, value: TValue): void
    {
        if (!this._map.hasOwnProperty(<any>key))
            this._size++;
        this._map[<any>key] = value;
    }
}
