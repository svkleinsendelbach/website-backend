import { HtmlDom, HtmlNode } from '../HtmlNode';
import { PersonParameters } from '../PersonParameters';
import { TeamSquad } from './TeamSquad';

export class TeamSquadParser {
    public constructor(
        private readonly dom: HtmlDom
    ) {}

    public parse(): TeamSquad {
        return {
            squad: this.parseSquad(),
            coach: this.parseCoach(),
            stab: this.parseStab()
        };
    }

    private parseSquad(): TeamSquad['squad'] {
        let currentPosition: keyof TeamSquad['squad'] = 'notSpecified';
        const squad: TeamSquad['squad'] = {
            goalkeeper: [],
            defence: [],
            midfield: [],
            offence: [],
            notSpecified: []
        };
        this.dom
            .nodeById('ctl00_cph__ctrl_4_divSpielerkader')
            .nthChild(1)
            .children
            .forEach(node => {
                const position = this.getPosition(node);
                if (position !== null) {
                    currentPosition = position;
                    return;
                }
                const person = this.parseSquadPerson(node);
                if (person !== null)
                    squad[currentPosition].push(person);
            });
        return squad;
    }

    private getPosition(node: HtmlNode): keyof TeamSquad['squad'] | null {
        const position = node.nthChild(3).nthChild(1).nthChild(1).nthChild(0).value.toString();
        switch (position) {            
        case 'Torwart': return 'goalkeeper';
        case 'Abwehr': return 'defence';
        case 'Mittelfeld': return 'midfield';
        case 'Sturm': return 'offence';
        case 'ohne Positionsangabe': return 'notSpecified';
        }
        return null;
    }

    private parseSquadPerson(node: HtmlNode): TeamSquad.Person | null {
        const firstName = node.nthChild(3).nthChild(1).nthChild(2).text;
        const lastName = node.nthChild(3).nthChild(1).nthChild(0).value.toString();
        if ((firstName === null || firstName === '') && (lastName === null || lastName === '')) return null;
        return {
            imageId: node.nthChild(1).nthChild(1).nthChild(0).attribute('src').regexGroup(/^\S+\/(?<id>\d+)\.(?:png|jpg)$/g, 'id').toInt(),
            firstName: firstName,
            lastName: lastName,
            personParameters: PersonParameters.fromHtmlValue(node.nthChild(3).nthChild(1).attribute('href')),
            age: node.nthChild(5).nthChild(1).value.regexGroup(/^\((?<age>\d+)\)$/g, 'age').toInt(),
            countInSquad: node.nthChild(7).nthChild(1).value.regexGroup(/^(?<n>\d+)[\s\S]*$/g, 'n').toInt(),
            goals: node.nthChild(7).nthChild(3).value.regexGroup(/^(?<n>\d+)[\s\S]*$/g, 'n').toInt(),
            assists: node.nthChild(7).nthChild(5).value.toInt()
        };
    }

    private parseCoach(): TeamSquad['coach'] {
        return this.dom
            .nodeById('ctl00_cph__ctrl_5_divTrainer')
            .nthChild(1)
            .nthChild(1)
            .map(node => {
                return {
                    imageId: node.nthChild(1).nthChild(1).attribute('src').regexGroup(/^\S+\/(?<id>\d+)\.(?:png|jpg)$/g, 'id').toInt(),
                    name: node.nthChild(3).nthChild(1).nthChild(0).value.toString(),
                    personParameters: PersonParameters.fromHtmlValue(node.nthChild(3).nthChild(1).attribute('href')),
                    age: node.nthChild(3).nthChild(3).value.regexGroup(/^\s*\((?<age>\d+)\)\s*$/g, 'age').toInt()
                };
            });
    }

    private parseStab(): TeamSquad['stab'] {
        return this.dom
            .nodeById('ctl00_cph__ctrl_6_divMitarbeiter')
            .children
            .compactMap(node => {
                const aFunction = node.nthChild(3).nthChild(1).nthChild(1).value.toString();
                const name = node.nthChild(3).nthChild(3).nthChild(1).nthChild(0).value.toString();
                if ((aFunction === null || aFunction === '') && (name === null || name === '')) return null;
                return {
                    imageId: node.nthChild(1).nthChild(1).attribute('src').regexGroup(/^\S+\/(?<id>\d+)\.(?:png|jpg)$/g, 'id').toInt(),
                    function: aFunction,
                    name: name,
                    personParameters: PersonParameters.fromHtmlValue(node.nthChild(3).nthChild(3).nthChild(1).attribute('href'))
                };
            }) ?? [];
    }
}
