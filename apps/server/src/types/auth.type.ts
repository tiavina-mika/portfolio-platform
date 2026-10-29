export interface ICode {
  code: string;
  expiredAt: Date;
}

export interface IPlatform {
  name: 'bo' | 'web' | 'android' | 'ios';
  count: number;
  lastConnectedAt: Date;
}
