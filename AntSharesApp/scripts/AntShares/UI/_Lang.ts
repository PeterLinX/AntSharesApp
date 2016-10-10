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
        static createWalletAlert = "创建钱包成功";
        static createAccountAlert = "创建账户成功";
        static importAccountAlert = "导入账户成功";
        static pleaseInputData = "请输入数据！";
        static WIFis = 'WIF格式的私钥为：';
        static dataFormatError = "数据格式有误！";
        static relaySuccess = "数据广播成功！";
        static relayFaild = "数据广播失败！";
        static insufficientFunds = "余额不足";
        static canNotSign = "无法签名";
        static thisVersion1 = "当前版本APP不支持多方签名或接收方签名的交易";
        static txError1 = "钱包金额已发生变化，交易无法完成";
        static electionInfo = "选举信息已经发送，等待区块确认";
        static voteInfo = "投票信息已经发送，等待区块确认";
        static issueInfo = "分发资产信息已经发送，等待区块确认";
        static registInfo = "注册资产信息已经发送，等待区块确认";
        static contractInfo = "交易信息已经发送，等待区块确认";
        static publisher = "发行者";
        static admin = "管理员";
        static amount = "总量";
        static sameWalletName = "已经存在重名的钱包文件，你可以打开钱包或者创建新的钱包。";
        static sameWalletName1 = "已经存在重名的钱包文件！";
        static selectAssetType = "请选择资产类型";
        static pleaseChoose = "请选择";
        static signFinish = "完成签名";
        static signError1 = "没有足够的私钥对数据进行签名！";
        static walletJsonError = "钱包格式有误，不正确的JSON格式！";
        static createMultiContractError = "无法添加多方签名合约，因为当前钱包中不包含签署该合约的私钥。";
        static createMultiContractSuccess = "智能合约创建成功";
        static changePwdSuccess = "修改钱包密码成功";
    }

    class globel_en
    {
        static openWalletAlert = "open wallet successed";
        static createWalletAlert = "创建钱包成功";
        static createAccountAlert = "创建账户成功";
        static importAccountAlert = "导入账户成功";
        static pleaseInputData = "请输入数据！";
        static WIFis = 'WIF格式的私钥为：';
        static dataFormatError = "数据格式有误！";
        static relaySuccess = "数据广播成功！";
        static relayFaild = "数据广播失败！";
        static insufficientFunds = "余额不足";
        static canNotSign = "无法签名";
        static thisVersion1 = "当前版本APP不支持多方签名或接收方签名的交易";
        static txError1 = "钱包金额已发生变化，交易无法完成";
        static electionInfo = "选举信息已经发送，等待区块确认";
        static voteInfo = "投票信息已经发送，等待区块确认";
        static issueInfo = "分发资产信息已经发送，等待区块确认";
        static registInfo = "注册资产信息已经发送，等待区块确认";
        static contractInfo = "交易信息已经发送，等待区块确认";
        static publisher = "发行者";
        static admin = "管理员";
        static amount = "总量";
        static sameWalletName = "已经存在重名的钱包文件，你可以打开钱包或者创建新的钱包。";
        static sameWalletName1 = "已经存在重名的钱包文件！";
        static selectAssetType = "请选择资产类型";
        static pleaseChoose = "请选择";
        static signFinish = "完成签名";
        static signError1 = "没有足够的私钥对数据进行签名！";
        static walletJsonError = "钱包格式有误，不正确的JSON格式！";
        static createMultiContractError = "无法添加多方签名合约，因为当前钱包中不包含签署该合约的私钥。";
        static createMultiContractSuccess = "智能合约创建成功";
        static changePwdSuccess = "修改钱包密码成功";
    }
}