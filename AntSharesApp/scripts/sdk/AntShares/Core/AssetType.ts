namespace AntShares.Core
{
    export enum AssetType
    {
        CreditFlag = 0x40,
        DutyFlag = 0x80,

        AntShare = 0x00,
        AntCoin = 0x01,
        Currency = 0x08,
        Share = DutyFlag | 0x10,
        Invoice = DutyFlag | 0x18,
        Token = CreditFlag | 0x20,
    }
}
