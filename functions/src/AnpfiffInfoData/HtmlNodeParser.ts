import DOMParser from "dom-parser";
import { toNumber, toInt } from "./utils";

export class HtmlNodeParser {
  public constructor(public readonly dom: DOMParser.Dom) {}

  public map<U>(callbackfn: (value: HtmlNodeParser) => U): U {
    return callbackfn(this);
  }

  public byId(id: string): HtmlNodeParserWithNode {
    return new HtmlNodeParserWithNode(this.dom.getElementById(id) ?? undefined);
  }

  public byClass(className: string): HtmlNodeParserWithNodeList {
    return new HtmlNodeParserWithNodeList(
      this.dom.getElementsByClassName(className) ?? undefined
    );
  }

  public byClassAt(className: string, index: number): HtmlNodeParserWithNode {
    const nodeList = this.dom.getElementsByClassName(className) ?? undefined;
    if (nodeList == undefined) {
      return new HtmlNodeParserWithNode(undefined);
    }
    if (index < 0 || index >= nodeList.length) {
      return new HtmlNodeParserWithNode(undefined);
    }
    return new HtmlNodeParserWithNode(nodeList[index]);
  }
}

export class HtmlNodeParserWithNode {
  public constructor(public readonly node: DOMParser.Node | undefined) {}

  public map<U>(callbackfn: (value: HtmlNodeParserWithNode) => U): U {
    return callbackfn(this);
  }

  public byId(id: string): HtmlNodeParserWithNode {
    return new HtmlNodeParserWithNode(
      this.node?.getElementById(id) ?? undefined
    );
  }

  public byClass(className: string): HtmlNodeParserWithNodeList {
    return new HtmlNodeParserWithNodeList(
      this.node?.getElementsByClassName(className) ?? undefined
    );
  }

  public byClassAt(className: string, index: number): HtmlNodeParserWithNode {
    const nodeList = this.node?.getElementsByClassName(className) ?? undefined;
    if (nodeList == undefined) {
      return new HtmlNodeParserWithNode(undefined);
    }
    if (index < 0 || index >= nodeList.length) {
      return new HtmlNodeParserWithNode(undefined);
    }
    return new HtmlNodeParserWithNode(nodeList[index]);
  }

  public get ["children"](): HtmlNodeParserWithNodeList {
    return new HtmlNodeParserWithNodeList(this.node?.childNodes);
  }

  public childAt(index: number): HtmlNodeParserWithNode {
    const nodeList = this.node?.childNodes;
    if (nodeList == undefined) {
      return new HtmlNodeParserWithNode(undefined);
    }
    if (index < 0 || index >= nodeList.length) {
      return new HtmlNodeParserWithNode(undefined);
    }
    return new HtmlNodeParserWithNode(nodeList[index]);
  }

  public attribute(name: string): string | undefined {
    return this.node?.getAttribute(name) ?? undefined;
  }

  public get ["stringValue"](): string | undefined {
    return this.node?.innerHTML;
  }

  public get ["textContent"](): string | undefined {
    return this.node?.textContent;
  }

  public get ["numberValue"](): number | undefined {
    return toNumber(this.node?.innerHTML);
  }

  public get ["intValue"](): number | undefined {
    return toInt(this.node?.innerHTML);
  }

  public regexGroup(regex: RegExp, groupName: string): string | undefined {
    if (this.node == undefined) {
      return undefined;
    }
    const groupList = regex.exec(this.node.innerHTML)?.groups;
    if (groupList == undefined) {
      return undefined;
    }
    return groupList[groupName];
  }

  public regexGroupToNumber(
    regex: RegExp,
    groupName: string
  ): number | undefined {
    return toNumber(this.regexGroup(regex, groupName));
  }

  public regexGroupToInt(regex: RegExp, groupName: string): number | undefined {
    return toInt(this.regexGroup(regex, groupName));
  }

  public regexGroupOnAttribute(
    name: string,
    regex: RegExp,
    groupName: string
  ): string | undefined {
    const attribute = this.node?.getAttribute(name) ?? undefined;
    if (attribute == undefined) {
      return undefined;
    }
    const groupList = regex.exec(attribute)?.groups;
    if (groupList == undefined) {
      return undefined;
    }
    return groupList[groupName];
  }

  public regexGroupOnAttributeToNumber(
    name: string,
    regex: RegExp,
    groupName: string
  ): number | undefined {
    return toNumber(this.regexGroupOnAttribute(name, regex, groupName));
  }

  public regexGroupOnAttributeToInt(
    name: string,
    regex: RegExp,
    groupName: string
  ): number | undefined {
    return toInt(this.regexGroupOnAttribute(name, regex, groupName));
  }
}

export class HtmlNodeParserWithNodeList
  implements Iterable<HtmlNodeParserWithNode>
{
  public constructor(public readonly nodeList: DOMParser.Node[] | undefined) {}

  [Symbol.iterator](): Iterator<HtmlNodeParserWithNode, any, undefined> {
    return (this.nodeList?.map((n) => new HtmlNodeParserWithNode(n)) ?? [])[
      Symbol.iterator
    ]();
  }

  public map<U>(
    callbackfn: (
      value: HtmlNodeParserWithNode,
      index: number,
      array: HtmlNodeParserWithNode[]
    ) => U
  ): U[] | undefined {
    return this.nodeList
      ?.map((n) => new HtmlNodeParserWithNode(n))
      .map(callbackfn);
  }

  public flatMap<U, This = undefined>(
    callback: (
      this: This,
      value: HtmlNodeParserWithNode,
      index: number,
      array: HtmlNodeParserWithNode[]
    ) => U | ReadonlyArray<U>
  ): U[] | undefined {
    return this.nodeList
      ?.map((n) => new HtmlNodeParserWithNode(n))
      .flatMap(callback);
  }

  public slice(start?: number, end?: number): HtmlNodeParserWithNodeList {
    return new HtmlNodeParserWithNodeList(this.nodeList?.slice(start, end));
  }

  public forEach(
    callbackfn: (
      value: HtmlNodeParserWithNode,
      index: number,
      array: HtmlNodeParserWithNode[]
    ) => void
  ): void {
    this.nodeList
      ?.map((n) => new HtmlNodeParserWithNode(n))
      .forEach(callbackfn);
  }
}
