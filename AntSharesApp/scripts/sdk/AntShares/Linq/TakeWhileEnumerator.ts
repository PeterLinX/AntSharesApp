namespace AntShares.Linq
{
    export class TakeWhileEnumerator<T> extends Enumerator<T>
    {
        private finished = false;
        private index = 0;

        constructor(private enumerator: Enumerator<T>, private predicate: Func2<T, number, boolean>)
        {
            super();
        }

        public next(): boolean
        {
            if (this.finished) return false;
            if (!this.enumerator.next()) return false;
            if (this.predicate(this.enumerator.value(), this.index++))
                return true;
            this.finished = true;
            return false;
        }

        public reset(): void
        {
            this.finished = false;
            this.index = 0;
            this.enumerator.reset();
        }

        public value(): T
        {
            return this.enumerator.value();
        }
    }
}
