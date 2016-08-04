namespace AntShares.Linq
{
    export class WhereEnumerator<T> extends Enumerator<T>
    {
        private index = 0;

        constructor(private enumerator: Enumerator<T>, private predicate: Func2<T, number, boolean>)
        {
            super();
        }

        public next(): boolean
        {
            while (this.enumerator.next())
                if (this.predicate(this.enumerator.value(), this.index++))
                    return true;
            return false;
        }

        public reset(): void
        {
            this.index = 0;
            this.enumerator.reset();
        }

        public value(): T
        {
            return this.enumerator.value();
        }
    }
}
