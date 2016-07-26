namespace AntShares.IO.Caching
{
    export class TrackableCollection<TKey, TItem extends ITrackable<TKey>>
    {
        private _map = new Map<TKey, TItem>();

        constructor(items?: ArrayLike<TItem>)
        {
            if (items != null)
            {
                for (let i = 0; i < items.length; i++)
                {
                    this._map.set(items[i].key, items[i]);
                    items[i].trackState = TrackState.None;
                }
            }
        }

        public add(item: TItem): void
        {
            this._map.set(item.key, item);
            item.trackState = TrackState.Added;
        }

        public clear(): void
        {
            this._map.forEach((value, key, map) =>
            {
                if (value.trackState == TrackState.Added)
                    map.delete(key);
                else
                    value.trackState = TrackState.Deleted;
            });
        }

        public commit(): void
        {
            this._map.forEach((value, key, map) =>
            {
                if (value.trackState == TrackState.Deleted)
                    map.delete(key);
                else
                    value.trackState = TrackState.None;
            });
        }

        public forEach(callback: (value: TItem, key: TKey, collection: TrackableCollection<TKey, TItem>) => void): void
        {
            this._map.forEach((value, key) =>
            {
                callback(value, key, this);
            });
        }

        public get(key: TKey): TItem
        {
            return this._map.get(key);
        }

        public getChangeSet(): TItem[]
        {
            let array = new Array<TItem>();
            this._map.forEach(value =>
            {
                if (value.trackState != TrackState.None)
                    array.push(value);
            });
            return array;
        }

        public has(key: TKey): boolean
        {
            return this._map.has(key);
        }

        public remove(key: TKey): void
        {
            let item = this._map.get(key);
            if (item.trackState == TrackState.Added)
                this._map.delete(key);
            else
                item.trackState = TrackState.Deleted;
        }
    }
}
