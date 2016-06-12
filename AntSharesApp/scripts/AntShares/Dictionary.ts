namespace AntShares
{
    export class Dictionary
    {
        private length: number;
        public array: any[];

        constructor(_length: number = null)
        {
            this.array = new Array();
            this.length = _length;
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
            if (this.length == null || (0 <= index && index < this.length))
            {
                this.array[index] = new DictionaryItem(key, value);
                if (this.length == null) this.length = 0;
                this.length++;
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