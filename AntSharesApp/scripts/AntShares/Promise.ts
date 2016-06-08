namespace AntShares
{
    type Func<TResult, T> = (T) => TResult;
    type Action<T> = Func<void, T>;
    type PromiseExecutor<T> = (resolve: Action<T>, reject: Action<any>) => void;

    enum PromiseState
    {
        pending,
        fulfilled,
        rejected
    }

    export class Promise<T> implements PromiseLike<T>
    {
        private _state = PromiseState.pending;
        private _value: T;
        private _reason: any;
        private _onFulfilled: Func<any | PromiseLike<any>, T>;
        private _onRejected: Func<any | PromiseLike<any>, T>;
        private _next_promise: Promise<any>;

        constructor(executor: PromiseExecutor<T>)
        {
            if (executor != null)
                executor(this.resolve.bind(this), this.reject.bind(this));
        }

        public catch<TResult>(onRejected: Func<TResult | PromiseLike<TResult>, any>): PromiseLike<TResult>
        {
            return this.then(null, onRejected);
        }

        private checkState()
        {
            if (this._state != PromiseState.pending && (this._onFulfilled != null || this._onRejected != null))
            {
                let value = null;
                if (this._state == PromiseState.fulfilled && this._onFulfilled != null)
                    value = this._onFulfilled(this._value);
                else if (this._state == PromiseState.rejected && this._onRejected != null)
                    value = this._onRejected(this._reason);
                if (this._next_promise == null)
                {
                    if (value instanceof Promise)
                        return value;
                    else
                        return new Promise((resolve, reject) => resolve(value));
                }
                else
                {
                    if (value instanceof Promise)
                        value.then(this.resolve.bind(this._next_promise), this.reject.bind(this._next_promise));
                    else
                        this._next_promise.resolve(value);
                }
            }
        }

        private reject(reason: any): void
        {
            this._state = PromiseState.rejected;
            this._reason = reason;
            this.checkState();
        }

        private resolve(value: T): void
        {
            this._state = PromiseState.fulfilled;
            this._value = value;
            this.checkState();
        }

        public then<TResult>(onFulfilled?: Func<TResult | PromiseLike<TResult>, T>, onRejected?: Func<TResult | PromiseLike<TResult>, any>): PromiseLike<TResult>
        {
            this._onFulfilled = onFulfilled;
            this._onRejected = onRejected;
            if (this._state == PromiseState.pending)
            {
                this._next_promise = new Promise<TResult>(null);
                return this._next_promise;
            }
            else
            {
                return this.checkState();
            }
        }
    }
}
