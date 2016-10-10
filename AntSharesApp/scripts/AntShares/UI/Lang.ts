namespace AntShares.UI
{
    export class Resources
    {
        static get globel()
        {
            let currentLanguage = getCookie('lang');
            if (currentLanguage == 'en')
                return globel_en;
            if (currentLanguage == 'zh')
                return globel_zh;
        }
    }

    class globel_zh
    {
        static openWalletAlert = "打开钱包成功";
    }

    class globel_en
    {
        static openWalletAlert = "open wallet successed";
    }
}