namespace AntShares.UI
{
    export class Resources
    {
        static get global()
        {
            let currentLanguage = navigator.language || navigator.browserLanguage;
            if (currentLanguage.split('-')[0] == 'zh')
                return global_zh;
            else
                return global_en;
        }
    }

    class global_zh
    {
        static openWalletAlert = "打开钱包成功";
        static createWalletAlert = "创建钱包成功";
        static createAccountAlert = "创建账户成功";
        static importAccountAlert = "导入账户成功";
        static pleaseInputData = "请输入数据";
        static WIFis = 'WIF格式的私钥为：';
        static dataFormatError = "数据格式有误";
        static relaySuccess = "数据广播成功";
        static relayFaild = "数据广播失败";
        static insufficientFunds = "余额不足";
        static canNotSign = "无法签名";
        static thisVersion1 = "当前版本APP不支持多方签名或接收方签名的交易";
        static txError1 = "钱包金额已发生变化，交易无法完成";
        static electionInfo = "选举信息已经发送，等待区块确认";
        static voteInfo = "投票信息已经发送，等待区块确认";
        static issueInfo = "分发资产信息已经发送，等待区块确认";
        static registInfo = "注册资产信息已经发送，等待区块确认，交易ID: ";
        static contractInfo = "交易信息已经发送，等待区块确认";
        static publisher = "发行者";
        static admin = "管理员";
        static amount = "总量";
        static sameWalletName = "已经存在重名的钱包文件，你可以打开钱包或者创建新的钱包。";
        static sameWalletName1 = "已经存在重名的钱包文件";
        static selectAssetType = "请选择资产类型";
        static pleaseChoose = "请选择";
        static signFinish = "完成签名";
        static signError1 = "没有足够的私钥对数据进行签名";
        static walletJsonError = "钱包格式有误，不正确的JSON格式";
        static createMultiContractError = "无法添加多方签名合约，因为当前钱包中不包含签署该合约的私钥。";
        static createMultiContractSuccess = "智能合约创建成功";
        static changePwdSuccess = "修改钱包密码成功";
        static menu = "菜单";

        static walletName = "钱包名称";
        static walletNameRequired = "钱包名称不能为空";
        static createPasswordPlaceholder = "钱包密码";
        static createPasswordRequired = "钱包密码不能为空";
        static createPasswordLength = "密码必须至少包含 6 个字符";
        static createPasswordConfirmPlaceholder = "钱包密码";
        static createPasswordConfirmRequired = "确认密码不能为空";
        static createPasswordConfirmEqualtoOther = "密码和确认密码不匹配";
        static inputWalletNamePlaceholder = "钱包名称";
        static openPasswordPlaceholder = "钱包密码";
        static openPasswordRequired = "钱包密码不能为空";
        static oldPasswordPlaceholder = "钱包密码";
        static oldPasswordRequired = "钱包密码不能为空";
        static newPasswordPlaceholder = "钱包密码";
        static newPasswordRequired = "钱包密码不能为空";
        static newPasswordLength = "密码必须至少包含6个字符";
        static newPasswordConfirmPlaceholder = "钱包密码";
        static newPasswordConfirmRequired = "确认密码不能为空";
        static newPasswordConfirmEqualto = "密码和确认密码不匹配";
        static importPrikeyInputPlaceholder = "输入私钥，要求WIF格式";
        static importPrikeyInputRequired = "私钥不能为空";
        static importPrikeyInputLength = "私钥必须是52位的Base58编码格式";
        static inputMPlaceholder = "最小为1";
        static inputMRequired = "最小签名数量不能为空";
        static publicInputTplPlaceholder = "公钥";
        static publickeyitemPlaceholder = "公钥";
        static addPublicTitle = "添加公钥";
        static transferTxoutPlaceholder = "对方小蚁地址";
        static transferValuePlaceholder = "金额";
        static inputDataPlaceholder = "待签名的交易";
        static inputAssetNamePlaceholder = "输入资产名称";
        static inputAmountPlaceholder = "输入资产总量";
        static issueOutputAddrPlaceholder = "地址";
        static issueOutputValuePlaceholder = "金额";
        static inputAntcoinPlaceholder = "输入抵押的小蚁币数量";
        static relayDataPlaceholder = "要广播的数据包";
        static addInputTitle = "添加输出";
        static accountAlreadyExits = "该账户已经存在";
        static theAntsharesSystem = "小蚁系统";
        static transferTxoutRequired = "对方小蚁地址不能为空";
        static transferValueRequired = "交易金额不能为空";
        static transferAssetRequired = "交易资产不能为空";
        static assetNameRequired = "资产名称不能为空";
        static assetAmountRequired = "资产总量不能为空";
        static issueAssetsRequired = "分发资产不能为空";
        static relayDataRequired = "数据包不能为空";
        static inputDataRequired = "待签名的交易不能为空";
        static issuer = "发行人： "
        static issuerPubKey = "发行人公钥： "
        static unConfirmed = "未确认";
        static minerTx = "矿工交易";
        static issueTx = "资产发行";
        static claimTx = "小蚁币提取";
        static enrollmentTx = "记账报名";
        static registerTx = "资产注册";
        static contractTx = "合约交易";
        static agencyTx = "代理交易";
        static publishTx = "合约发布";
        static noTxs = "您目前还没有交易";
        static RPCError = "很抱歉，我们这边出了一些问题，暂不能创建钱包，请过一会儿再试。";
        static txId = "交易已经发送，等待区块确认，交易id: ";
        static addressError = "地址信息有误";
    }

    class global_en
    {
        static openWalletAlert = "Wallet Open Complete";
        static createWalletAlert = "Wallet Creation Complete";
        static createAccountAlert = "Account Creation Complete";
        static importAccountAlert = "Account Import Complete";
        static pleaseInputData = "Please input data";
        static WIFis = 'Private Key in WIF format: ';
        static dataFormatError = "Incorrect Data Format";
        static relaySuccess = "Broadcast Successful";
        static relayFaild = "Broadcast Failed";
        static insufficientFunds = "Insufficient Funds";
        static canNotSign = "Signing Failed";
        static thisVersion1 = "Multi-Sig and Recipient Sig transactions not supported under current App version";
        static txError1 = "Wallet Balance changed, transaction failed";
        static electionInfo = "Election Info. Transmitted, pending confirmation";
        static voteInfo = "Voting Info. Transmitted, pending confirmation";
        static issueInfo = "Asset Distribution Info. Transmitted, pending confirmation";
        static registInfo = "Asset has been registered, please wait for confirmations, txid= ";
        static contractInfo = "Transaction Info. Transmitted, pending confirmation";
        static publisher = "Issuer";
        static admin = "Administrator";
        static amount = "Total Amount";
        static sameWalletName = "Wallet File already exist, open this wallet or create one under a new name";
        static sameWalletName1 = "Wallet File already exist";
        static selectAssetType = "Please select the type of the asset";
        static pleaseChoose = "Select";
        static signFinish = "Signautre Complete";
        static signError1 = "Insufficient Private Keys to complete this signing";
        static walletJsonError = "Incorrect Wallet Format, JSON format error";
        static createMultiContractError = "Multi-Sig Contract failed, private key to this contract not in the wallet";
        static createMultiContractSuccess = "Smart Contract Creation Complete";
        static changePwdSuccess = "Wallet Password Change Complete";
        static menu = "Menu";

        static walletName = "wallet name";
        static walletNameRequired = "Wallet name is required";
        static createPasswordPlaceholder = "wallet password";
        static createPasswordRequired = "Wallet password is required";
        static createPasswordLength = "The password must be at least 6 bits long";
        static createPasswordConfirmPlaceholder = "wallet password";
        static createPasswordConfirmRequired = "Password confirm is required";
        static createPasswordConfirmEqualtoOther = "Password and confirm password do not match";
        static inputWalletNamePlaceholder = "wallet name";
        static openPasswordPlaceholder = "wallet password";
        static openPasswordRequired = "Wallet password is required";
        static oldPasswordPlaceholder = "wallet password";
        static oldPasswordRequired = "Wallet password is required";
        static newPasswordPlaceholder = "wallet password";
        static newPasswordRequired = "Wallet password is required";
        static newPasswordLength = "The password must be at least 6 bits long";
        static newPasswordConfirmPlaceholder = "wallet password";
        static newPasswordConfirmRequired = "Password confirm is required";
        static newPasswordConfirmEqualto = "Password and confirm password do not match";
        static importPrikeyInputPlaceholder = "WIF Format";
        static importPrikeyInputRequired = "Private key is required";
        static importPrikeyInputLength = "Private key must be a 52-bit Base58 encoding";
        static inputMPlaceholder = "Minimum is 1";
        static inputMRequired = "Minimum number of signatures is required";
        static publicInputTplPlaceholder = "public key";
        static publickeyitemPlaceholder = "public key";
        static addPublicTitle = "add key";
        static transferTxoutPlaceholder = "Other antshares address";
        static transferValuePlaceholder = "value";
        static inputDataPlaceholder = "Ready to sign Tx";
        static inputAssetNamePlaceholder = "Enter the asset's name";
        static inputAmountPlaceholder = "Enter the total assets";
        static issueOutputAddrPlaceholder = "address";
        static issueOutputValuePlaceholder = "value";
        static inputAntcoinPlaceholder = "Enter number of ANC guarantee";
        static relayDataPlaceholder = "Broadcast packets";
        static addInputTitle = "add input";
        static accountAlreadyExits = "The Account had been imported";
        static theAntsharesSystem = "The Antshares System";
        static transferTxoutRequired = "Other antshares address is required";
        static transferValueRequired = "Transfer value is required";
        static transferAssetRequired = "Transfer asset is required";
        static assetNameRequired = "Asset name is required";
        static assetAmountRequired = "Asset amount is required";
        static issueAssetsRequired = "Issue asset is required";
        static relayDataRequired = "Broadcast packets is required";
        static inputDataRequired = "Ready to sign Tx is required";
        static issuer = "issuer: ";
        static issuerPubKey = "issuer public key: "
        static unConfirmed = "unconfirmed";
        static minerTx = "Miner";
        static issueTx = "Issue";
        static claimTx = "Claim";
        static enrollmentTx = "Enrollment";
        static registerTx = "Registration";
        static contractTx = "Contract";
        static agencyTx = "Agency";
        static publishTx = "Publish";
        static noTxs = "You have no transactions yet";
        static RPCError = "Sorry, we have some problems here, cannot create wallets now, please try again later.";
        static txId = "Transaction has been made, please wait for confirmations, txid: ";
        static addressError = "Improper Address";
    }
}