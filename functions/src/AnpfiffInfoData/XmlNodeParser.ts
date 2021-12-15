import { toNumber, toInt } from "./utils";
import { XmlNode } from "fsp-xml-parser";

export class XmlNodeParser {
  public constructor(public readonly node: XmlNode | undefined) {}

  public get ["children"](): XmlNodeParserWithNodeList {
    return new XmlNodeParserWithNodeList(this.node?.children);
  }

  public getContent(name: string): string | undefined {
    for (const child of this.node?.children ?? []) {
      if (child.name == name) {
        return child.content;
      }
    }
    return undefined;
  }

  public getNumberContent(name: string): number | undefined {
    return toNumber(this.getContent(name));
  }

  public getIntContent(name: string): number | undefined {
    return toInt(this.getContent(name));
  }
}

export class XmlNodeParserWithNodeList {
  public constructor(public readonly nodeList: XmlNode[] | undefined) {}

  public map<U>(
    callbackfn: (
      value: XmlNodeParser,
      index: number,
      array: XmlNodeParser[]
    ) => U
  ): U[] | undefined {
    return this.nodeList?.map((n) => new XmlNodeParser(n)).map(callbackfn);
  }

  public flatMap<U, This = undefined>(
    callback: (
      this: This,
      value: XmlNodeParser,
      index: number,
      array: XmlNodeParser[]
    ) => U | ReadonlyArray<U>
  ): U[] | undefined {
    return this.nodeList?.map((n) => new XmlNodeParser(n)).flatMap(callback);
  }

  public slice(start?: number, end?: number): XmlNodeParserWithNodeList {
    return new XmlNodeParserWithNodeList(this.nodeList?.slice(start, end));
  }

  public forEach(
    callbackfn: (
      value: XmlNodeParser,
      index: number,
      array: XmlNodeParser[]
    ) => void
  ): void {
    this.nodeList?.map((n) => new XmlNodeParser(n)).forEach(callbackfn);
  }
}
