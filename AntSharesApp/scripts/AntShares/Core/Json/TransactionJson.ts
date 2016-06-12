namespace AntShares.Core
{
    export class TransactionJson
    {
        private txid: string;
        private hex: string;
        private type: TransactionType;
        private attributes: string;
        private vin: TransactionInputJson[];
        private vout: TransactionOutputJson[];
        private scripts: string;

        public deserialize(): Transaction
        {
            let result;
            if (this.type == TransactionType.RegisterTransaction)
                result = new RegisterTransaction();
            //if (this.type == TransactionType.AgencyTransaction)
            //    r = new AgencyTransaction();
            //if (this.type == TransactionType.ClaimTransaction)
            //    r = new ClaimTransaction();
            //if (this.type == TransactionType.ContractTransaction)
            //    r = new ContractTransaction();
            //if (this.type == TransactionType.EnrollmentTransaction)
            //    r = new EnrollmentTransaction();
            //if (this.type == TransactionType.IssueTransaction)
            //    r = new IssueTransaction();
            //if (this.type == TransactionType.MinerTransaction)
            //    r = new MinerTransaction();
            //if (this.type == TransactionType.VotingTransaction)
            //    r = new VotingTransaction();

            let r = result as Transaction;
            r.transactionId = this.txid;
            r.transactionType = this.type;

            //r.transactionAttribute = this.attributes;

            r.transactionInput = new Array<TransactionInput>();
            for (let input of this.vin)
            {
                r.transactionInput.push(input.deserialize());
            }

            r.transactionOutput = new Array<TransactionOutput>();
            for (let output of this.vout)
            {
                r.transactionOutput.push(output.deserialize());
            }
            return r;
        }
    }
}