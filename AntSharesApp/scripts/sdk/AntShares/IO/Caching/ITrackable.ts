namespace AntShares.IO.Caching
{
    export interface ITrackable<TKey>
    {
        key: TKey;
        trackState: TrackState;
    }
}
