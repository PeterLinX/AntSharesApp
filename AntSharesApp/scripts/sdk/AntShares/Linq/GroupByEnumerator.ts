namespace AntShares.Linq
{
    export class GroupByEnumerator<TSource, TKey, TResult> extends Enumerator<TResult>
    {
        private enumerator: Enumerator<TResult>;

        constructor(private source: Enumerator<TSource>, private keySelector: Func<TSource, TKey>, private resultSelector: Func2<TKey, Enumerator<TSource>, TResult>, private comparer: Func2<TKey, TKey, boolean>)
        {
            super();
        }

        public next(): boolean
        {
            if (this.enumerator == null)
            {
                let groups = new Array<{ key: TKey, group: Array<TSource>}>();
                while (this.source.next())
                {
                    let value = this.source.value();
                    let key = this.keySelector(value);
                    let flag = false;
                    for (let i = 0; i < groups.length; i++)
                    {
                        if (this.comparer(key, groups[i].key))
                        {
                            groups[i].group.push(value);
                            flag = true;
                            break;
                        }
                    }
                    if (!flag)
                        groups.push({ key: key, group: [value] });
                }
                let results = new Array<TResult>();
                for (let i = 0; i < groups.length; i++)
                    results.push(this.resultSelector(groups[i].key, new ArrayEnumerator(groups[i].group)));
                this.enumerator = new ArrayEnumerator(results);
            }
            return this.enumerator.next();
        }

        public reset(): void
        {
            this.enumerator = null;
            this.source.reset();
        }

        public value(): TResult
        {
            return this.enumerator.value();
        }
    }
}
