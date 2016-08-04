type Func2<T1, T2, TResult> = (arg1: T1, arg2: T2) => TResult;

function linq<T>(array: ArrayLike<T>): AntShares.Linq.Enumerator<T>
{
    return new AntShares.Linq.ArrayEnumerator(array);
}
