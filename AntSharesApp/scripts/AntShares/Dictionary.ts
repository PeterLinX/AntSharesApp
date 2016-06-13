namespace AntShares
{
    export class Dictionary
    {
        private lengthLimit: number;
        private array: any[];

        private _count: number;
        get count(): number
        {
            if (this.lengthLimit == null)
            {
                this._count = this.array.length;
            } else
            {
                this._count = this.lengthLimit;
            }
            return this._count;
        }
        
        constructor(_length: number = null)
        {
            this.array = new Array();
            this.lengthLimit = _length;
        }

        public containsKey(key): boolean
        {
            for (let i of this.array)
            {
                if (i.key === key)
                    return true;
            }
            return false;
        }

        public set(key, value)
        {
            for (let i = 0; i < this.array.length; i++)
            {
                if (this.array[i].key === key)
                    this.array[i].value = value;
            }
        }

        public add(key, value)
        {
            this.array.push(new DictionaryItem(key, value));
        }

        public addItem(index, key, value)
        {
            if (this.lengthLimit == null || (0 <= index && index < this.lengthLimit))
            {
                this.array[index] = new DictionaryItem(key, value);
            }
            else
            {
                throw new RangeError();
            }
        }

        public getKeys(): Array<any>
        {
            let keys = new Array<any>();
            for (let i of this.array)
            {
                keys.push(i.key);
            }
            return keys;
        }
    }

    export class DictionaryItem
    {
        constructor(public key: any, public value: any) { };
    }
}