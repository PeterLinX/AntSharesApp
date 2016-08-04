type PromiseExecutor<T> = (resolve: Action<T | PromiseLike<T>>, reject: Action<any>) => void;

if (window.Promise == null) window.Promise = (function ()
{
    enum PromiseState
    {
        pending,
        fulfilled,
        rejected
    }

    return class Promise<T> implements PromiseLike<T>
    {
        private _state = PromiseState.pending;
        private _callback_attached = false;
        private _value: T;
        private _reason: any;
        private _onFulfilled: Func<T, any | PromiseLike<any>>;
        private _onRejected: Func<T, any | PromiseLike<any>>;
        private _next_promise: Promise<any>;
        private _tag: any;

        constructor(executor: PromiseExecutor<T>)
        {
            if (executor != null)
                executor(this.resolve.bind(this), this.reject.bind(this));
        }

        public static all(iterable: Promise<any>[]): Promise<any[]>
        {
            return new Promise<any[]>((resolve, reject) =>
            {
                if (iterable.length == 0)
                {
                    resolve([]);
                    return;
                }
                let results = new Array(iterable.length);
                let rejected = false;
                let onFulfilled = function (result)
                {
                    results[this._tag] = result;
                    for (let i = 0; i < iterable.length; i++)
                        if (iterable[i]._state != PromiseState.fulfilled)
                            return;
                    resolve(results);
                };
                let onRejected = reason =>
                {
                    if (!rejected)
                    {
                        rejected = true;
                        reject(reason);
                    }
                };
                for (let i = 0; i < iterable.length; i++)
                {
                    iterable[i]._tag = i;
                    iterable[i].then(onFulfilled, onRejected);
                }
            });
        }

        public catch<TResult>(onRejected: Func<any, TResult | PromiseLike<TResult>>): PromiseLike<TResult>
        {
            return this.then(null, onRejected);
        }

        private checkState()
        {
            if (this._state != PromiseState.pending && this._callback_attached)
            {
                let callback = this._state == PromiseState.fulfilled ? this._onFulfilled : this._onRejected;
                let arg = this._state == PromiseState.fulfilled ? this._value : this._reason;
                let value, reason;
                try
                {
                    value = callback == null ? this : callback.call(this, arg);
                }
                catch (ex)
                {
                    reason = ex;
                }
                if (this._next_promise == null)
                {
                    if (reason != null)
                        return Promise.reject(reason);
                    else if (value instanceof Promise)
                        return value;
                    else
                        return Promise.resolve(value);
                }
                else
                {
                    if (reason != null)
                        this._next_promise.reject(reason);
                    else if (value instanceof Promise)
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

        public static reject(reason: any): PromiseLike<any>
        {
            return new Promise((resolve, reject) => reject(reason));
        }

        private resolve(value: T): void
        {
            this._state = PromiseState.fulfilled;
            this._value = value;
            this.checkState();
        }

        public static resolve<T>(value: T | PromiseLike<T>): PromiseLike<T>
        {
            if (value instanceof Promise) return value;
            return new Promise<T>((resolve, reject) => resolve(value));
        }

        public then<TResult>(onFulfilled?: Func<T, TResult | PromiseLike<TResult>>, onRejected?: Func<any, TResult | PromiseLike<TResult>>): PromiseLike<TResult>
        {
            this._onFulfilled = onFulfilled;
            this._onRejected = onRejected;
            this._callback_attached = true;
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
})();
