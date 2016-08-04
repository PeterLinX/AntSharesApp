namespace AntShares.Linq
{
    export class OrderByEnumerator<TSource, TKey> extends Enumerator<TSource>
    {
        private arrayEnumerator: Enumerator<TSource>;

        constructor(private enumerator: Enumerator<TSource>, private keySelector: Func<TSource, TKey>, private comparer: Func2<TKey, TKey, number>)
        {
            super();
        }

        public next(): boolean
        {
            if (this.arrayEnumerator == null)
                this.arrayEnumerator = new ArrayEnumerator(this.enumerator.toArray().sort((a, b) => this.comparer(this.keySelector(a), this.keySelector(b))));
            return this.arrayEnumerator.next();
        }

        public reset(): void
        {
            this.arrayEnumerator = null;
        }

        public value(): TSource
        {
            return this.arrayEnumerator.value();
        }
    }
}
