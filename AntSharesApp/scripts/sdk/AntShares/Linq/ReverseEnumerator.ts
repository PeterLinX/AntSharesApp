namespace AntShares.Linq
{
    export class ReverseEnumerator<T> extends Enumerator<T>
    {
        private arrayEnumerator: Enumerator<T>;

        constructor(private enumerator: Enumerator<T>)
        {
            super();
        }

        public next(): boolean
        {
            if (this.arrayEnumerator == null)
            {
                let array = new Array<T>();
                while (this.enumerator.next())
                    array.unshift(this.enumerator.value());
                this.arrayEnumerator = new ArrayEnumerator(array);
            }
            return this.arrayEnumerator.next();
        }

        public reset(): void
        {
            this.arrayEnumerator = null;
            this.enumerator.reset();
        }

        public value(): T
        {
            return this.arrayEnumerator.value();
        }
    }
}
