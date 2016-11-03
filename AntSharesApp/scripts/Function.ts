//规范：Function文件中只存放全局函数

function formIsValid(formId: string): boolean
{
    let demo = $('#' + formId) as any;
    if (!demo.valid())
    {
        return false;
    }
    else
    {
        return true;
    }
}

function formReset(formId: string)
{
    (document.getElementById(formId) as any).reset();
}

function convert_keyup(obj)
{
    let n = obj.value.replace(/,/g, "") as string;

    let str = n.split('.');
    if (str.length > 2)
        return;
    let z = str[0].split('').reverse().join('');
    let z1 = "";
    for (let i = 0; i < z.length; i++)
    {
        z1 = z1 + z[i];
        if ((i + 1) % 3 == 0 && i < z.length - 1)
            z1 = z1 + ",";
    }
    z1 = z1.split('').reverse().join('');

    let result = z1;
    if (str.length == 2)
    {
        let f = str[1];
        result = result + "." + f;
    }
    obj.value = result;
}

function convert_keydown(obj)
{
    setTimeout(() => { convert_keyup(obj) }, 10);
}

function convertTxType(type: AntShares.Core.TransactionType): string
{
    let typeStr: string;
    switch (type) {
        case AntShares.Core.TransactionType.MinerTransaction:
            typeStr = AntShares.UI.Resources.global.minerTx;
            break;
        case AntShares.Core.TransactionType.IssueTransaction:
            typeStr = AntShares.UI.Resources.global.issueTx;
            break;
        case AntShares.Core.TransactionType.ClaimTransaction:
            typeStr = AntShares.UI.Resources.global.claimTx;
            break;
        case AntShares.Core.TransactionType.EnrollmentTransaction:
            typeStr = AntShares.UI.Resources.global.enrollmentTx;
            break;
        case AntShares.Core.TransactionType.RegisterTransaction:
            typeStr = AntShares.UI.Resources.global.registerTx;
            break;
        case AntShares.Core.TransactionType.ContractTransaction:
            typeStr = AntShares.UI.Resources.global.contractTx;
            break;
        case AntShares.Core.TransactionType.AgencyTransaction:
            typeStr = AntShares.UI.Resources.global.agencyTx;
            break;
        case AntShares.Core.TransactionType.PublishTransaction:
            typeStr = AntShares.UI.Resources.global.publishTx;
            break;
    }
    return typeStr;
}