/// <reference path="Enumerator.ts"/>

namespace AntShares.Linq
{
    export class ArrayEnumerator<T> extends Enumerator<T>
    {
        private index = -1;

        constructor(private array: ArrayLike<T>)
        {
            super();
        }

        public any(predicate?: Func<T, boolean>): boolean
        {
            if (predicate == null)
                return this.array.length > 0;
            else
                return super.any(predicate);
        }

        public count(predicate?: Func<T, boolean>): number
        {
            if (predicate == null)
                return this.array.length;
            else
                return super.count(predicate);
        }

        public elementAt(index: number): T
        {
            if (index >= this.array.length)
                throw new RangeError();
            else
                return this.array[index];
        }

        public elementAtOrDefault(index: number, defaultValue: T): T
        {
            if (index >= this.array.length)
                return defaultValue;
            else
                return this.array[index];
        }

        public first(predicate?: Func<T, boolean>): T
        {
            if (predicate == null)
                return this.array[0];
            else
                return super.first(predicate);
        }

        public last(predicate?: Func<T, boolean>): T
        {
            if (predicate == null)
            {
                return this.array[this.array.length - 1];
            }
            else
            {
                for (let i = this.array.length - 1; i >= 0; i--)
                    if (predicate(this.array[i]))
                        return this.array[i];
                throw new Error();
            }
        }

        public lastOrDefault(predicate: Func<T, boolean>, defaultValue: T): T
        {
            for (let i = this.array.length - 1; i >= 0; i--)
                if (predicate(this.array[i]))
                    return this.array[i];
            return defaultValue;
        }

        public next(): boolean
        {
            if (this.index >= this.array.length)
                return false;
            this.index++;
            return this.index < this.array.length;
        }

        public reset(): void
        {
            this.index = -1;
        }

        public single(predicate?: Func<T, boolean>): T
        {
            if (predicate == null)
            {
                if (this.array.length != 1)
                    throw new Error();
                else
                    return this.array[0];
            }
            else
            {
                return super.single(predicate);
            }
        }

        public value(): T
        {
            return this.array[this.index];
        }
    }
}
