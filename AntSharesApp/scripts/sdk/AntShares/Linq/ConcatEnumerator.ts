namespace AntShares.Linq
{
    export class ConcatEnumerator<T> extends Enumerator<T>
    {
        private enumerator: Enumerator<T>;

        constructor(private enumerators: Enumerator<Enumerator<T>>)
        {
            super();
        }

        public next(): boolean
        {
            if (this.enumerator == null)
                if (!this.nextEnumerator())
                    return false;
            while (!this.enumerator.next())
                if (!this.nextEnumerator())
                    return false;
            return true;
        }

        private nextEnumerator(): boolean
        {
            if (!this.enumerators.next())
                return false;
            this.enumerator = this.enumerators.value();
            this.enumerator.reset();
            return true;
        }

        public reset(): void
        {
            this.enumerator = null;
            this.enumerators.reset();
        }

        public value(): T
        {
            return this.enumerator.value();
        }
    }
}
