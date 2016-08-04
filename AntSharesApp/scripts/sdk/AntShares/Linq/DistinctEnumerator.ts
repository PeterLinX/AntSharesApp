namespace AntShares.Linq
{
    export class DistinctEnumerator<T> extends Enumerator<T>
    {
        private set = new Array<T>();

        constructor(private enumerator: Enumerator<T>, private comparer: Func2<T, T, boolean>)
        {
            super();
        }

        public next(): boolean
        {
            while (this.enumerator.next())
            {
                let flag = false;
                for (let i = 0; i < this.set.length; i++)
                {
                    if (this.comparer(this.enumerator.value(), this.set[i]))
                    {
                        flag = true;
                        break;
                    }
                }
                if (!flag)
                {
                    this.set.push(this.value());
                    return true;
                }
            }
            return false;
        }

        public reset(): void
        {
            this.set.length = 0;
            this.enumerator.reset();
        }

        public value(): T
        {
            return this.enumerator.value();
        }
    }
}
