export interface ICreateSignature {
  total_amount: number;
  transaction_uuid: string;
  product_code: string;
}

interface ITransactor {
  userid: string;
  username: string;
}
export interface ICreatePayment {
  transaction_uuid: string;
  sender: ITransactor;
  receiver: ITransactor;
  amount: number;
  courseid: string;
}

export interface IVerifyPayment {
  data: string;
  studentid: string;
}
