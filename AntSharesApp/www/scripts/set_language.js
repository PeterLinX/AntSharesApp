var currentLanguage = navigator.language || navigator.browserLanguage;
if (currentLanguage.split('-')[0] == 'zh') {
    document.getElementById('lang').href = 'css/zh.css';
    $("#en_help").hide();
    $("#zh_help").show();
    $("#en_about").hide();
    $("#zh_about").show();
    $("#en_privacy").hide();
    $("#zh_privacy").show();
}
else {
    document.getElementById('lang').href = 'css/en.css';
    $("#en_help").show();
    $("#zh_help").hide();
    $("#en_about").show();
    $("#zh_about").hide();
    $("#en_privacy").show();
    $("#zh_privacy").hide();
}
//初始化fileinput控件 http://www.cnblogs.com/wuhuacong/p/4774396.html
function resetFileinput()
{
    if (currentLanguage.split('-')[0] == 'zh') {
        document.getElementById('lang').href = 'css/zh.css';
        $("#files").fileinput({
            language: 'zh',
            previewFileIcon: "<i class='glyphicon glyphicon-king'></i>",
        });
    }
    else {
        document.getElementById('lang').href = 'css/en.css';
        $("#files").fileinput({
            previewFileIcon: "<i class='glyphicon glyphicon-king'></i>",
        });
    }
}
resetFileinput();

var global = AntShares.UI.Resources.global;
$("#create_password").attr("placeholder", global.createPasswordPlaceholder);
$("#create_password").attr("data-val-required", global.createPasswordRequired);
$("#create_password").attr("data-val-length", global.createPasswordLength);
$("#create_password_confirm").attr("placeholder", global.createPasswordConfirmPlaceholder);
$("#create_password_confirm").attr("data-val-required", global.createPasswordConfirmRequired);
$("#create_password_confirm").attr("data-val-equalto", global.createPasswordConfirmEqualtoOther);
$("#input_wallet_name").attr("placeholder", global.inputWalletNamePlaceholder);
$("#open_password").attr("placeholder", global.openPasswordPlaceholder);
$("#open_password").attr("data-val-required", global.openPasswordRequired);
$("#old_password").attr("placeholder", global.oldPasswordPlaceholder);
$("#old_password").attr("data-val-required", global.oldPasswordRequired);
$("#new_password").attr("placeholder", global.newPasswordPlaceholder);
$("#new_password").attr("data-val-required", global.newPasswordRequired);
$("#new_password").attr("data-val-length", global.newPasswordLength);
$("#new_password_confirm").attr("placeholder", global.newPasswordConfirmPlaceholder);
$("#new_password_confirm").attr("data-val-required", global.newPasswordConfirmRequired);
$("#new_password_confirm").attr("data-val-equalto", global.newPasswordConfirmEqualto);
$("#import_prikey_input").attr("placeholder", global.importPrikeyInputPlaceholder);
$("#import_prikey_input").attr("data-val-required", global.importPrikeyInputRequired);
$("#import_prikey_input").attr("data-val-length", global.importPrikeyInputLength);
$("#input_m").attr("placeholder", global.inputMPlaceholder);
$("#input_m").attr("data-val-required", global.inputMRequired);
$("#public_input_tpl").attr("placeholder", global.publicInputTplPlaceholder);
$("#publickeyitem").attr("placeholder", global.publickeyitemPlaceholder);
$("#add_public").attr("title", global.addPublicTitle);
$("#transfer_txout").attr("placeholder", global.transferTxoutPlaceholder);
$("#transfer_value").attr("placeholder", global.transferValuePlaceholder);
$("#input_data").attr("placeholder", global.inputDataPlaceholder);
$("#input_asset_name").attr("placeholder", global.inputAssetNamePlaceholder);
$("#input_amount").attr("placeholder", global.inputAmountPlaceholder);
$(".issue_output_addr").attr("placeholder", global.issueOutputAddrPlaceholder);
$(".issue_output_value").attr("placeholder", global.issueOutputValuePlaceholder);
$("#input_antcoin").attr("placeholder", global.inputAntcoinPlaceholder);
$("#relay_data").attr("placeholder", global.relayDataPlaceholder);
$("#transfer_txout").attr("data-val-required", global.transferTxoutRequired);
$("#transfer_txout").attr("data-val-regex", global.transferTxoutRegex);
$("#transfer_value").attr("data-val-required", global.transferValueRequired);
$("#transfer_asset").attr("data-val-required", global.transferAssetRequired);
$("#input_asset_name").attr("data-val-required", global.assetNameRequired);
$("#input_amount").attr("data-val-required", global.assetAmountRequired);
$("#select_issue_assets").attr("data-val-required", global.issueAssetsRequired);
$("#relay_data").attr("data-val-required", global.relayDataRequired);
$("#input_data").attr("data-val-required", global.inputDataRequired);
$("#contact_address").attr("data-val-required", global.contactAddressRequired);
$("#contact_name").attr("data-val-required", global.contactNameRequired);
$("#contact_name").attr("data-val-length", global.contactNameLength);
$("#contact_address").attr("data-val-regex", global.contactAddressRegex);
$("#contact_name").attr("data-val-regex", global.contactNameRegex);

