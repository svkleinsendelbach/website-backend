import { HtmlValue } from './HtmlNode';

export interface PersonParameters {
    spielkreis: number,
    personId: number
}

export namespace PersonParameters {
    export function fromHtmlValue(value: HtmlValue): PersonParameters | null {
        const spielkreis = value.regexGroup(/^\S*?\?\S*?SK=(?<SK>\d+)\S*?$/g, 'SK').toInt();
        const personId = value.regexGroup(/^\S*?\?\S*?Pers=(?<Pers>\d+)\S*?$/g, 'Pers').toInt();
        if (spielkreis === null || personId === null) 
            return null;
        return {
            spielkreis: spielkreis,
            personId: personId
        };
    }
}
