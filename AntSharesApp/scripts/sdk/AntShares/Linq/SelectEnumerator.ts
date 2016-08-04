namespace AntShares.Linq
{
    export class SelectEnumerator<TSource, TResult> extends Enumerator<TResult>
    {
        private index = -1;

        constructor(private enumerator: Enumerator<TSource>, private selector: Func2<TSource, number, TResult>)
        {
            super();
        }

        public next(): boolean
        {
            let b = this.enumerator.next();
            if (b) this.index++;
            return b;
        }

        public reset(): void
        {
            this.index = -1;
            this.enumerator.reset();
        }

        public value(): TResult
        {
            return this.selector(this.enumerator.value(), this.index);
        }
    }
}
