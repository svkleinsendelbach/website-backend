import DOMParser from 'dom-parser';

import { toInt, toNumber } from '../utils';

export class HtmlNodeParser {
  public constructor(public readonly dom: DOMParser.Dom) {}

  public map<U>(callbackfn: (value: HtmlNodeParser) => U): U {
    return callbackfn(this);
  }

  public byId(id: string): HtmlNodeParserWithNode {
    return new HtmlNodeParserWithNode(this.dom.getElementById(id) ?? undefined);
  }

  public byClass(className: string): HtmlNodeParserWithNodeList {
    return new HtmlNodeParserWithNodeList(this.dom.getElementsByClassName(className) ?? undefined);
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
    return new HtmlNodeParserWithNode(this.node?.getElementById(id) ?? undefined);
  }

  public byClass(className: string): HtmlNodeParserWithNodeList {
    return new HtmlNodeParserWithNodeList(this.node?.getElementsByClassName(className) ?? undefined);
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

  public get ['children'](): HtmlNodeParserWithNodeList {
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

  public get ['stringValue'](): string | undefined {
    if (this.node?.childNodes == undefined) {
      return undefined;
    }
    return this.node.innerHTML;
  }

  public get ['textContent'](): string | undefined {
    return this.node?.textContent;
  }

  public get ['numberValue'](): number | undefined {
    return toNumber(this.stringValue);
  }

  public get ['intValue'](): number | undefined {
    return toInt(this.stringValue);
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

  public regexGroupToNumber(regex: RegExp, groupName: string): number | undefined {
    return toNumber(this.regexGroup(regex, groupName));
  }

  public regexGroupToInt(regex: RegExp, groupName: string): number | undefined {
    return toInt(this.regexGroup(regex, groupName));
  }

  public regexGroupOnAttribute(name: string, regex: RegExp, groupName: string): string | undefined {
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

  public regexGroupOnAttributeToNumber(name: string, regex: RegExp, groupName: string): number | undefined {
    return toNumber(this.regexGroupOnAttribute(name, regex, groupName));
  }

  public regexGroupOnAttributeToInt(name: string, regex: RegExp, groupName: string): number | undefined {
    return toInt(this.regexGroupOnAttribute(name, regex, groupName));
  }

  public getZahlenProperties<Map extends { [key: string]: string }>(
    mapping: Map,
  ): { [key in keyof Map]: number | undefined } {
    return this.children.getZahlenProperties(mapping);
  }

  public get ['description'](): string {
    if (this.node === undefined) {
      return 'undefined';
    }
    return JSON.stringify(this.nodeObject, undefined, 2);
  }

  private get ['nodeObject'](): any {
    if (this.node === undefined) {
      return undefined;
    }
    if (this.node.childNodes == undefined) {
      return this.node.textContent;
    }
    return this.node.childNodes.flatMap((node, index) => {
      return {
        index: index,
        id: node.getAttribute('id') ?? undefined,
        class: node.getAttribute('class') ?? undefined,
        src: node.getAttribute('src') ?? undefined,
        href: node.getAttribute('href') ?? undefined,
        content: node.childNodes != undefined ? undefined : node.textContent,
        children: node.childNodes != undefined ? new HtmlNodeParserWithNode(node).nodeObject : undefined,
      };
    });
  }
}

export class HtmlNodeParserWithNodeList implements Iterable<HtmlNodeParserWithNode> {
  public constructor(public readonly nodeList: DOMParser.Node[] | undefined) {}

  [Symbol.iterator](): Iterator<HtmlNodeParserWithNode, any, undefined> {
    return (this.nodeList?.map(n => new HtmlNodeParserWithNode(n)) ?? [])[Symbol.iterator]();
  }

  public map<U>(
    callbackfn: (value: HtmlNodeParserWithNode, index: number, array: HtmlNodeParserWithNode[]) => U,
  ): U[] | undefined {
    return this.nodeList?.map(n => new HtmlNodeParserWithNode(n)).map(callbackfn);
  }

  public flatMap<U, This = undefined>(
    callback: (
      this: This,
      value: HtmlNodeParserWithNode,
      index: number,
      array: HtmlNodeParserWithNode[],
    ) => U | ReadonlyArray<U>,
  ): U[] | undefined {
    return this.nodeList?.map(n => new HtmlNodeParserWithNode(n)).flatMap(callback);
  }

  public slice(start?: number, end?: number): HtmlNodeParserWithNodeList {
    return new HtmlNodeParserWithNodeList(this.nodeList?.slice(start, end));
  }

  public forEach(
    callbackfn: (value: HtmlNodeParserWithNode, index: number, array: HtmlNodeParserWithNode[]) => void,
  ): void {
    this.nodeList?.map(n => new HtmlNodeParserWithNode(n)).forEach(callbackfn);
  }

  public getZahlenProperties<Map extends { [key: string]: string }>(
    mapping: Map,
  ): { [key in keyof Map]: number | undefined } {
    const values: { [key: string]: number | undefined } = {};
    for (const node of this) {
      for (const entry of Object.entries(mapping)) {
        if (node.childAt(0).childAt(1).stringValue == entry[1]) {
          values[entry[0]] = node.childAt(0).childAt(2).childAt(0).intValue;
          break;
        }
      }
    }
    return values as { [key in keyof Map]: number | undefined };
  }
}
