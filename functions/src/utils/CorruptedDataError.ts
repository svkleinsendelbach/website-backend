export class CorruptedDataError implements Error {
  public readonly name: string = 'CorruptedDataError';

  public constructor(public readonly message: string) {}
}
