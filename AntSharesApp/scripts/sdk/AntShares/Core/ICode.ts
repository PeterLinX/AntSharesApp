namespace AntShares.Core {
    export interface ICode {

        Script: ArrayBuffer;
        ParameterList: ContractParameterType[];
        ReturnType: ContractParameterType;
        ScriptHash: Uint160;
    }
}