namespace AntShares
{
    export class Sync
    {
        public static getblockcount(): void
        {
            Core.Blockchain.Default.getBlockCount().then(result =>
            {
                let height = result - 1;
                $("#remote_height").text(height);
                setTimeout(Sync.getblockcount, 5000);
            }, reason => setTimeout(Sync.getblockcount, 5000));
        }
    }
}
