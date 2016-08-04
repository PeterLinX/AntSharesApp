namespace AntShares.Linq
{
    export class SkipWhileEnumerator<T> extends Enumerator<T>
    {
        private skipped = false;

        constructor(private enumerator: Enumerator<T>, private predicate: Func2<T, number, boolean>)
        {
            super();
        }

        public next(): boolean
        {
            if (!this.skipped)
            {
                let index = 0;
                while (this.enumerator.next())
                    if (!this.predicate(this.enumerator.value(), index++))
                        return this.skipped = true;
                this.skipped = true;
            }
            return this.enumerator.next();
        }

        public reset(): void
        {
            this.skipped = false;
            this.enumerator.reset();
        }

        public value(): T
        {
            return this.enumerator.value();
        }
    }
}
