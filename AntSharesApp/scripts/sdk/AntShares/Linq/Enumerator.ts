namespace AntShares.Linq
{
    export abstract class Enumerator<T>
    {
        public abstract next(): boolean;
        public abstract reset(): void;
        public abstract value(): T;

        public aggregate<TAccumulate>(seed: TAccumulate, func: Func2<TAccumulate, T, TAccumulate>): TAccumulate
        {
            this.reset();
            while (this.next())
                seed = func(seed, this.value());
            return seed;
        }

        public all(predicate: Func<T, boolean>): boolean
        {
            this.reset();
            while (this.next())
                if (!predicate(this.value()))
                    return false;
            return true;
        }

        public any(predicate: Func<T, boolean> = Enumerator.defaultPredicate): boolean
        {
            this.reset();
            while (this.next())
                if (predicate(this.value()))
                    return true;
            return false;
        }

        public average(selector: Func<T, number> = p => <any>p): number
        {
            this.reset();
            let sum = 0;
            let count = 0;
            while (this.next())
            {
                sum += selector(this.value());
                count++;
            }
            if (count == 0) throw new Error();
            else return sum / count;
        }

        public concat(second: Enumerator<T>): Enumerator<T>
        {
            return new ConcatEnumerator(new ArrayEnumerator([this, second]));
        }

        public contains(value: T, comparer: Func2<T, T, boolean> = Enumerator.defaultEqualityComparer): boolean
        {
            this.reset();
            while (this.next())
                if (comparer(value, this.value()))
                    return true;
            return false;
        }

        public count(predicate: Func<T, boolean> = Enumerator.defaultPredicate): number
        {
            this.reset();
            let n = 0;
            while (this.next())
                if (predicate(this.value()))
                    n++;
            return n;
        }

        private static defaultAddition<T extends { add?: (other: T) => T }>(a: T, b: T): T
        {
            if (a.add)
                return a.add(b);
            else
                return <any>a + <any>b;
        }

        private static defaultComparer<T extends { compareTo?: (other: T) => number }>(a: T, b: T): number
        {
            if (a.compareTo)
                return a.compareTo(b);
            else
                return <any>a - <any>b;
        }

        private static defaultEqualityComparer<T extends { equals?: (other: T) => boolean }>(a: T, b: T): boolean
        {
            if (a.equals)
                return a.equals(b);
            else
                return a === b;
        }

        private static defaultPredicate<T>(p: T): boolean
        {
            return true;
        }

        public distinct(comparer: Func2<T, T, boolean> = Enumerator.defaultEqualityComparer): Enumerator<T>
        {
            return new DistinctEnumerator(this, comparer);
        }

        public elementAt(index: number): T
        {
            this.reset();
            for (let i = 0; i <= index; i++)
                if (!this.next())
                    throw new RangeError();
            return this.value();
        }

        public elementAtOrDefault(index: number, defaultValue: T): T
        {
            this.reset();
            for (let i = 0; i <= index; i++)
                if (!this.next())
                    return defaultValue;
            return this.value();
        }

        public static empty<T>(): Enumerator<T>
        {
            return new ArrayEnumerator<T>([]);
        }

        public except(second: Enumerator<T>, comparer: Func2<T, T, boolean> = Enumerator.defaultEqualityComparer): Enumerator<T>
        {
            return new ExceptEnumerator(this, second, comparer);
        }

        public first(predicate: Func<T, boolean> = Enumerator.defaultPredicate): T
        {
            this.reset();
            while (this.next())
            {
                let value = this.value();
                if (predicate(value))
                    return value;
            }
            throw new Error();
        }

        public firstOrDefault(predicate: Func<T, boolean>, defaultValue: T): T
        {
            this.reset();
            while (this.next())
            {
                let value = this.value();
                if (predicate(value))
                    return value;
            }
            return defaultValue;
        }

        public groupBy<TKey, TResult>(keySelector: Func<T, TKey>, resultSelector: Func2<TKey, Enumerator<T>, TResult>, comparer: Func2<TKey, TKey, boolean> = Enumerator.defaultEqualityComparer): Enumerator<TResult>
        {
            return new GroupByEnumerator(this, keySelector, resultSelector, comparer);
        }

        public intersect(second: Enumerator<T>, comparer: Func2<T, T, boolean> = Enumerator.defaultEqualityComparer): Enumerator<T>
        {
            return new IntersectEnumerator(this, second, comparer);
        }

        public last(predicate: Func<T, boolean> = Enumerator.defaultPredicate): T
        {
            this.reset();
            let last: T;
            let found = false;
            while (this.next())
            {
                let value = this.value();
                if (predicate(value))
                {
                    last = value;
                    found = true;
                }
            }
            if (found) return last;
            else throw new Error();
        }

        public lastOrDefault(predicate: Func<T, boolean>, defaultValue: T): T
        {
            this.reset();
            while (this.next())
            {
                let value = this.value();
                if (predicate(value))
                    defaultValue = value;
            }
            return defaultValue;
        }

        public max(): T;
        public max<TResult>(selector: Func<T, TResult>): TResult;
        public max<TResult>(selector?: Func<T, TResult>): T | TResult
        {
            this.reset();
            let max: T | TResult;
            let count = 0;
            while (this.next())
            {
                let value = selector ? selector(this.value()) : this.value();
                if (count == 0 || Enumerator.defaultComparer(max, value) < 0)
                    max = value;
            }
            if (count == 0) throw new Error();
            return max;
        }

        public min(): T;
        public min<TResult>(selector: Func<T, TResult>): TResult;
        public min<TResult>(selector?: Func<T, TResult>): T | TResult
        {
            this.reset();
            let min: T | TResult;
            let count = 0;
            while (this.next())
            {
                let value = selector ? selector(this.value()) : this.value();
                if (count == 0 || Enumerator.defaultComparer(min, value) > 0)
                    min = value;
            }
            if (count == 0) throw new Error();
            return min;
        }

        public orderBy(): OrderByEnumerator<T, T>
        public orderBy<TKey>(keySelector: Func<T, TKey>, comparer?: Func2<TKey, TKey, number>): OrderByEnumerator<T, TKey>
        public orderBy<TKey>(keySelector: Func<T, TKey> = p => <any>p, comparer: Func2<TKey, TKey, number> = Enumerator.defaultComparer): OrderByEnumerator<T, TKey>
        {
            return new OrderByEnumerator(this, keySelector, comparer);
        }

        public orderByDescending(): OrderByEnumerator<T, T>
        public orderByDescending<TKey>(keySelector: Func<T, TKey>, comparer?: Func2<TKey, TKey, number>): OrderByEnumerator<T, TKey>
        public orderByDescending<TKey>(keySelector: Func<T, TKey> = p => <any>p, comparer: Func2<TKey, TKey, number> = Enumerator.defaultComparer): OrderByEnumerator<T, TKey>
        {
            return new OrderByEnumerator(this, keySelector, (a, b) => -comparer(a, b));
        }

        public static range(start: number, count: number): Enumerator<number>
        {
            let array = new Array<number>();
            for (let i = 0; i < count; i++)
                array.push(i + start);
            return new ArrayEnumerator(array);
        }

        public static repeat<T>(element: T, count: number): Enumerator<T>
        {
            let array = new Array<T>(count);
            array.fill(element);
            return new ArrayEnumerator(array);
        }

        public reverse(): Enumerator<T>
        {
            return new ReverseEnumerator(this);
        }

        public select<TResult>(selector: Func<T, TResult>): Enumerator<TResult>;
        public select<TResult>(selector: Func2<T, number, TResult>): Enumerator<TResult>;
        public select<TResult>(selector: Func2<T, number, TResult>): Enumerator<TResult>
        {
            return new SelectEnumerator(this, selector);
        }

        public selectMany<TResult>(selector: Func<T, Enumerator<TResult>>): Enumerator<TResult>
        public selectMany<TResult>(selector: Func2<T, number, Enumerator<TResult>>): Enumerator<TResult>
        public selectMany<TResult>(selector: Func2<T, number, Enumerator<TResult>>): Enumerator<TResult>
        {
            return new ConcatEnumerator(this.select(selector));
        }

        public sequenceEqual(second: Enumerator<T>, comparer: Func2<T, T, boolean> = Enumerator.defaultEqualityComparer): boolean
        {
            this.reset();
            second.reset();
            while (true)
            {
                let b1 = this.next();
                let b2 = second.next();
                if (b1 != b2) return false;
                if (b1)
                {
                    if (!comparer(this.value(), second.value()))
                        return false;
                }
                else
                {
                    return true;
                }
            }
        }

        public single(predicate: Func<T, boolean> = Enumerator.defaultPredicate): T
        {
            this.reset();
            let single: T;
            let found = false;
            while (this.next())
            {
                let value = this.value();
                if (predicate(value))
                {
                    if (found) throw new Error();
                    single = value;
                    found = true;
                }
            }
            if (!found) throw new Error();
            return single;
        }

        public singleOrDefault(predicate: Func<T, boolean>, defaultValue: T): T
        {
            this.reset();
            let single: T;
            let found = false;
            while (this.next())
            {
                let value = this.value();
                if (predicate(value))
                {
                    if (found) return defaultValue;
                    single = value;
                    found = true;
                }
            }
            if (!found) return defaultValue;
            return single;
        }

        public skip(count: number): Enumerator<T>
        {
            return this.skipWhile((p, i) => i < count);
        }

        public skipWhile(predicate: Func<T, boolean>): Enumerator<T>;
        public skipWhile(predicate: Func2<T, number, boolean>): Enumerator<T>;
        public skipWhile(predicate: Func2<T, number, boolean>): Enumerator<T>
        {
            return new SkipWhileEnumerator(this, predicate);
        }

        public sum(selector: Func<T, number>): number
        {
            this.reset();
            let sum = 0;
            while (this.next())
                sum += selector(this.value());
            return sum;
        }

        public take(count: number): Enumerator<T>
        {
            return this.takeWhile((p, i) => i < count);
        }

        public takeWhile(predicate: Func<T, boolean>): Enumerator<T>;
        public takeWhile(predicate: Func2<T, number, boolean>): Enumerator<T>;
        public takeWhile(predicate: Func2<T, number, boolean>): Enumerator<T>
        {
            return new TakeWhileEnumerator(this, predicate);
        }

        public toArray(): T[]
        {
            this.reset();
            let array = new Array<T>();
            while (this.next())
                array.push(this.value());
            return array;
        }

        public union(second: Enumerator<T>, comparer: Func2<T, T, boolean> = Enumerator.defaultEqualityComparer): Enumerator<T>
        {
            return this.concat(second).distinct(comparer);
        }

        public where(predicate: Func<T, boolean>): Enumerator<T>;
        public where(predicate: Func2<T, number, boolean>): Enumerator<T>;
        public where(predicate: Func2<T, number, boolean>): Enumerator<T>
        {
            return new WhereEnumerator(this, predicate);
        }
    }
}
