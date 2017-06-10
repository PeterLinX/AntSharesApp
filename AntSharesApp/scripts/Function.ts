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

function convert(value: string): string
{
    let n = value.replace(/,/g, "") as string;

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
    return result;
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

let isMobileWeb = {
    Android: function () {
        return navigator.userAgent.match(/Android/i);
    },
    iOS: function () {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Opera: function () {
        return navigator.userAgent.match(/Opera Mini/i);
    },
    IE: function () {
        return navigator.userAgent.match(/IEMobile/i);
    },
    Mozilla: function () {
        return navigator.userAgent.match(/Mozilla/i);
    },
    Safari: function () {
        return navigator.userAgent.match(/Safari/i);
    },
    Edge: function () {
        return navigator.userAgent.match(/Edge/i);
    },
    PC: function (): boolean {
        if (isMobileWeb.Opera() || isMobileWeb.IE() || isMobileWeb.Mozilla() || isMobileWeb.Safari() || isMobileWeb.Edge()) {
            return true;
        } else {
            return false;
        }
    },
    Web: function (): boolean {
        if (isMobileWeb.Android() || isMobileWeb.iOS()) {
            return true;
        } else {
            return false;
        }
    }
}

function setTitle(index: number)
{
    $(".header-title").hide();
    $(".header-title").eq(index).show();
}

let isMobileApp = {
    Android: function (): boolean {
        try {
            if (device.platform == "Android") {
                return true;
            } else {
                return false;
            }
        } catch (ReferenceError){
            return false;
        }
    },
    iOS: function (): boolean {
        try {
            if (device.platform == "iOS") {
                return true;
            } else {
                return false;
            }
        } catch (ReferenceError) {
            return false;
        }
    },
    App: function (): boolean {
        try
        {
            return device.platform != "";
        } catch (e)
        {
            return false;
        }
    }
}

function is_weixin()//only for Android and IOS
{
    let ua: any = navigator.userAgent.toLowerCase();
    return ua.match(/MicroMessenger/i) == "micromessenger";
}

function is_weibo()//only for Android and IOS
{
    let ua: any = navigator.userAgent.toLowerCase();
    return ua.match(/weibo/i) == "weibo";
}

function is_qq()//only for Android and IOS
{
    let ua: any = navigator.userAgent.toLowerCase();
    return ua.match(/qq/i) == "qq";
}


function cordovaFileError(errorCode: number): string {
    let errorMessage: string = "";
    switch (errorCode) {
        case 1:
            errorMessage = "NOT_FOUND_ERR";
            break;
        case 2:
            errorMessage = "SECURITY_ERR";
            break;
        case 3:
            errorMessage = "ABORT_ERR";
            break;
        case 4:
            errorMessage = "NOT_READABLE_ERR";
            break;
        case 5:
            errorMessage = "ENCODING_ERR";
            break;
        case 6:
            errorMessage = "NO_MODIFICATION_ALLOWED_ERR";
            break;
        case 7:
            errorMessage = "INVALID_STATE_ERR";
            break;
        case 8:
            errorMessage = "SYNTAX_ERR";
            break;
        case 9:
            errorMessage = "INVALID_MODIFICATION_ERR";
            break;
        case 10:
            errorMessage = "QUOTA_EXCEEDED_ERR";
            break;
        case 11:
            errorMessage = "TYPE_MISMATCH_ERR";
            break;
        case 12:
            errorMessage = "PATH_EXISTS_ERR";
            break;
        default:
            errorMessage = "UNKOWN_ERR";
            break;
    }
    return errorMessage;
}

function wait()
{
	$(".hello").focus();
	var hello = $(".hello").clone();
	hello.addClass("new-hello");
	hello.show();
	$("body").append(hello);
	$("body nav").addClass("blur");
	$("#page").addClass("blur");
}

function wait_cancel() {
	$(".new-hello").remove();
	$("body nav").removeClass("blur");
	$("#page").removeClass("blur");
}

let noResume = false;
function scan()
{
    noResume = true;
    (<any>cordova).plugins.barcodeScanner.scan(result => {
        let address: string = result.text;
        AntShares.UI.TabBase.showTab("#Tab_Account_Send", address);
    }, error => {
        alert("Scanning failed: " + error);
    }, {
            showFlipCameraButton: true, // iOS and Android
            showTorchButton: true, // iOS and Android
            torchOn: false, // Android, launch with the torch switched on (if available)
            prompt: "Place a barcode inside the scan area", // Android
            resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
            formats: "QR_CODE", // default: all but PDF_417 and RSS_EXPANDED
        });
}

function delay(t) {
    return new Promise(function (resolve) {
        setTimeout(resolve, t)
    });
}

function debugLog(p: any) {
    console.log(p);
    $("#debugLog").prepend(p + "|" + new Date().toLocaleString()+ "</br>");
}