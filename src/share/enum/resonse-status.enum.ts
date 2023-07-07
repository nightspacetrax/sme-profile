export type ResponseStatus = {
  code: number;
  description: string;
};

export enum Status {
  Success,
  Fail,
}

export const StatusData: Array<ResponseStatus> = [
  { code: 200, description: 'success' },
  { code: 400, description: 'bad request' },
  { code: 500, description: 'fail' },
];
