namespace AntShares.Linq
{
    export class ExceptEnumerator<T> extends Enumerator<T>
    {
        private array2: T[];

        constructor(private e1: Enumerator<T>, private e2: Enumerator<T>, private comparer: Func2<T, T, boolean>)
        {
            super();
        }

        public next(): boolean
        {
            while (this.e1.next())
            {
                if (this.array2 == null)
                    this.array2 = this.e2.toArray();
                let flag = false;
                for (let i = 0; i < this.array2.length; i++)
                {
                    if (this.comparer(this.e1.value(), this.array2[i]))
                    {
                        flag = true;
                        break;
                    }
                }
                if (!flag) return true;
            }
            return false;
        }

        public reset(): void
        {
            this.array2 = null;
            this.e1.reset();
        }

        public value(): T
        {
            return this.e1.value();
        }
    }
}
