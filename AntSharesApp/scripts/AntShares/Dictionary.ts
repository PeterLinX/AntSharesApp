namespace AntShares
{
    export class Dictionary
    {
        public array: any[];

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