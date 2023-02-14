export type BfvLiveticker = {
    loadNew: boolean;
    ifModifiedSinceTimestamp: string;
    results: BfvLiveticker.Result[];
};

export namespace BfvLiveticker {    
    export function mapBfvLiveticker(ticker: BfvApiLiveticker, homeImageId: string): BfvLiveticker {
        return {
            loadNew: ticker.loadNew,
            ifModifiedSinceTimestamp: ticker.ifModifiedSinceTimestamp,
            results: ticker.results.compactMap(result => {
                try {
                    switch (result.eventIcon) {
                    case null: return mapCommentResult(result);
                    case '24/whistle': return mapTitledResult(result, 'whistle');
                    case '24/specialAction': return mapTitledResult(result, 'specialAction');
                    case '24/football': return mapGoalResult(result as BfvApiLiveticker.Result.Football, 'goal', homeImageId);
                    case '24/substitute': return mapSubstituteResult(result as BfvApiLiveticker.Result.Substitute, homeImageId);
                    case '24/yellowCard': return mapCardResult(result as BfvApiLiveticker.Result.YellowCard, 'yellowCard', homeImageId);
                    case '24/secondYellowCard': return mapCardResult(result as BfvApiLiveticker.Result.SecondYellowCard, 'secondYellowCard', homeImageId);
                    case '24/redCard': return mapCardResult(result as BfvApiLiveticker.Result.RedCard, 'redCard', homeImageId);
                    case '24/corner': return mapTitledResult(result, 'corner');
                    case '24/freeKick': return mapTitledResult(result, 'freeKick');
                    case '24/shotOnGoal': return mapTitledResult(result, 'shotOnGoal');
                    case '24/penalty': return mapTitledResult(result, 'penalty');
                    case '24/penaltyGoal': return mapGoalResult(result as BfvApiLiveticker.Result.PenaltyGoal, 'penaltyGoal', homeImageId);
                    case '24/ownGoal': return mapTitledResult(result, 'ownGoal');
                    case '24/time': return mapTitledResult(result, 'time');
                    default: throw new Error(`Invalid event icon: ${result.eventIcon}`);
                    }
                } catch {
                    return undefined;
                }
            })
        };
    }

    export function mapCommentResult(result: BfvApiLiveticker.Result.Comment): Result.Comment | Result.Section {
        if (result.section !== null) {
            return {
                type: 'section',
                text: result.section
            };
        }
        return mapResultProperties(result, 'comment');
    }

    export function mapTitledResult(result: BfvApiLiveticker.Result.Whistle | BfvApiLiveticker.Result.Corner | BfvApiLiveticker.Result.Penalty | BfvApiLiveticker.Result.OwnGoal | BfvApiLiveticker.Result.Time | BfvApiLiveticker.Result.SpecialAction | BfvApiLiveticker.Result.FreeKick | BfvApiLiveticker.Result.ShotOnGoal, type: 'whistle' | 'corner' | 'penalty' | 'ownGoal' | 'time' | 'specialAction' | 'freeKick' | 'shotOnGoal'): Result.TitledResult {
        return {
            headline: result.headline,
            ...mapResultProperties(result, type)
        };
    }

    export function mapGoalResult(result: BfvApiLiveticker.Result.Football | BfvApiLiveticker.Result.PenaltyGoal, type: 'goal' | 'penaltyGoal', homeImageId: string): Result.Goal {
        if (result.goal === null)
            throw new Error(`Couldn' get goal from ${type} result.`);
        const imageId = /^\/\/service-prod\.bfv\.de\/export\.media\?action=getLogo&format=7&id=(?<id>\S+?)$/g.exec(result.goal.player.teamLogo.teamIcon)?.groups?.id;
        const playerImageId = /^https:\/\/cdn.bfv.de\/public\/(?<imageId>\S+?)\.stamp$/.exec(result.goal.player.image.src)?.groups?.imageId;
        if (playerImageId === undefined) 
            throw new Error('Couldn\' get player image id from result.');
        return {
            headline: result.headline,
            team: imageId === homeImageId ? 'home' : 'away',
            player: {
                id: result.goal.player.id,
                imageId: playerImageId,
                name: result.goal.player.name,
                number: Number.parseInt(result.goal.player.number)
            },
            result: {
                home: result.goal.result.teams[0].actualGoals, 
                away: result.goal.result.teams[1].actualGoals
            },
            ...mapResultProperties(result, type)
        };
    }

    export function mapSubstituteResult(result: BfvApiLiveticker.Result.Substitute, homeImageId: string): Result.Substitute {
        if (result.substitution === null)
            throw new Error('Couldn\' get substitution from substitution result.');
        const imageId = /^\/\/service-prod\.bfv\.de\/export\.media\?action=getLogo&format=7&id=(?<id>\S+?)$/g.exec(result.substitution.player.teamLogo.teamIcon)?.groups?.id;
        const playerInImageId = /^https:\/\/cdn.bfv.de\/public\/(?<imageId>\S+?)\.stamp$/.exec(result.substitution.player.image.src)?.groups?.imageId;
        const playerOutImageId = /^https:\/\/cdn.bfv.de\/public\/(?<imageId>\S+?)\.stamp$/.exec(result.substitution.player2.image.src)?.groups?.imageId;
        if (playerInImageId === undefined || playerOutImageId === undefined) 
            throw new Error('Couldn\' get player image id from result.');
        return {
            headline: result.headline,
            team: imageId === homeImageId ? 'home' : 'away',
            playerIn: {
                id: result.substitution.player.id,
                imageId: playerInImageId,
                name: result.substitution.player.name,
                number: Number.parseInt(result.substitution.player.number)
            },
            playerOut: {
                id: result.substitution.player2.id,
                imageId: playerOutImageId,
                name: result.substitution.player2.name,
                number: Number.parseInt(result.substitution.player2.number)
            },
            ...mapResultProperties(result, 'substitute')
        };
    }

    export function mapCardResult(result: BfvApiLiveticker.Result.YellowCard | BfvApiLiveticker.Result.SecondYellowCard | BfvApiLiveticker.Result.RedCard, type: 'yellowCard' | 'secondYellowCard' | 'redCard', homeImageId: string): Result.Card {
        if (result.statistic === null)
            throw new Error(`Couldn' get statistic from ${type} result.`);
        const imageId = /^\/\/service-prod\.bfv\.de\/export\.media\?action=getLogo&format=7&id=(?<id>\S+?)$/g.exec(result.statistic.player.teamLogo.teamIcon)?.groups?.id;
        let entries: Record<'games' | 'goals' | 'yellowCards' | 'secondYellowCards' | 'redCards', number> | null = null;
        if (result.statistic.entries !== null) {
            const keyMap: Record<string, 'games' | 'goals' | 'yellowCards' | 'secondYellowCards' | 'redCards'> = {
                '16/player': 'games', '24/football': 'goals', '24/yellowCard': 'yellowCards', '24/secondYellowCard': 'secondYellowCards', '24/redCard': 'redCards'
            };
            entries = {
                games: 0, goals: 0, yellowCards: 0, secondYellowCards: 0, redCards: 0
            };
            for (const entry of result.statistic.entries)
                entries[keyMap[entry.icon]] = entry.count;
        }
        const playerImageId = /^https:\/\/cdn.bfv.de\/public\/(?<imageId>\S+?)\.stamp$/.exec(result.statistic.player.image.src)?.groups?.imageId;
        if (playerImageId === undefined) 
            throw new Error('Couldn\' get player image id from result.');
        return {
            headline: result.headline,
            team: imageId === homeImageId ? 'home' : 'away',
            player: {
                id: result.statistic.player.id,
                imageId: playerImageId,
                name: result.statistic.player.name,
                number: Number.parseInt(result.statistic.player.number)
            },
            entries: entries,
            ...mapResultProperties(result, type)
        };
    }

    export function mapResultProperties<Type extends string>(result: BfvApiLiveticker.Result, type: Type): Result.ResultProperties<Type> {
        if (type === 'comment' && 'section' in result && result.section !== null || result.likeApiRoute === null || result.unlikeApiRoute === null)
            throw new Error('Couldn\' get like api route from section result.');
        return {
            type: type,
            resultLikes: {
                likes: result.likes,
                liked: result.liked,
                likeApiRoute: result.likeApiRoute,
                unlikeApiRoute: result.unlikeApiRoute
            },
            text: result.text || null,
            time: result.time !== null ? Number.parseInt(/^(?<time>\d+?)'$/g.exec(result.time)?.groups?.time ?? 'NaN') : null,
            reportLink: result.options?.reportLink.href ?? null
        };
    }

    export type Result = Result.Comment | Result.Section | Result.TitledResult | Result.Goal | Result.Substitute | Result.Card;

    export namespace Result {
        export type ResultProperties<Type extends string> = {
            type: Type;
            resultLikes: {
                likes: number;
                liked: boolean;
                likeApiRoute: string;
                unlikeApiRoute: string;
            };
            text: string | null;
            time: number | null;
            reportLink: string | null;
        }

        export type Player = {
            id: string;
            imageId: string;
            name: string;
            number: number;
        }

        export type Comment = ResultProperties<'comment'>;

        export type Section = {
            type: 'section',
            text: string;
        }

        export type TitledResult = ResultProperties<'whistle' | 'corner' | 'penalty' | 'ownGoal' | 'time' | 'specialAction' | 'freeKick' | 'shotOnGoal'> & {
            headline: string | null;
        }

        export type Goal = ResultProperties<'goal' | 'penaltyGoal'> & {
            headline: string | null;
            team: 'home' | 'away';
            player: Player;
            result: {
                home: number,
                away: number 
            }
        }

        export type Substitute = ResultProperties<'substitute'> & {
            headline: string | null;
            team: 'home' | 'away';
            playerIn: Player;
            playerOut: Player;
        }

        export type Card = ResultProperties<'yellowCard' | 'secondYellowCard' | 'redCard'> & {
            headline: string | null;
            team: 'home' | 'away';
            player: Player;
            entries: Record<'games' | 'goals' | 'yellowCards' | 'secondYellowCards' | 'redCards', number> | null;
        }
    }
}

export type BfvApiLiveticker = {
    loadNew: boolean;
    ifModifiedSinceTimestamp: string;
    results: BfvApiLiveticker.Result[];
};

export namespace BfvApiLiveticker {    
    export type Result = 
        | Result.Comment 
        | Result.Whistle 
        | Result.SpecialAction 
        | Result.Football 
        | Result.Substitute 
        | Result.YellowCard 
        | Result.SecondYellowCard 
        | Result.RedCard 
        | Result.Corner 
        | Result.FreeKick 
        | Result.ShotOnGoal 
        | Result.Penalty 
        | Result.PenaltyGoal 
        | Result.OwnGoal 
        | Result.Time;    

    export namespace Result {        
        export type Comment = {
            headline: null | string;
            eventIcon: null;
            likes: number;
            liked: boolean;
            likeApiRoute: null | string;
            unlikeApiRoute: null | string;
            ownGoal: boolean;
            text: null | string;
            time: null | string;
            section: null | string;
            options: null | Utils.Options;
        };
        
        export type Whistle = Utils.DefaultProperties & {
            headline: string;
        };
        
        export type SpecialAction = Utils.DefaultProperties & {
            headline: null | string;
        };
        
        export type Football = Utils.DefaultProperties & {
            headline: string;
            goal: null | Utils.Goal
        };
        
        export type Substitute = Utils.DefaultProperties & {
            headline: string;
            substitution: null | Utils.Substitution
        };
        
        export type YellowCard = Utils.DefaultProperties & {
            headline: string;
            card: string;
            statistic: null | Utils.Statistic
            team: Utils.Team
        };
        
        export type SecondYellowCard = Utils.DefaultProperties & {
            headline: string;
            card: string;
            statistic: null | Utils.Statistic
            team: Utils.Team
        };
        
        export type RedCard = Utils.DefaultProperties & {
            headline: string;
            card: string;
            statistic: null | Utils.Statistic
            team: Utils.Team
        };
        
        export type Corner = Utils.DefaultProperties & {
            headline: string;
        };
        
        export type FreeKick = Utils.DefaultProperties & {
            headline: null | string;
        };
        
        export type ShotOnGoal = Utils.DefaultProperties & {
            headline: null | string;
        };
        
        export type Penalty = Utils.DefaultProperties & {
            headline: string;
        };
        
        export type PenaltyGoal = Utils.DefaultProperties & {
            headline: string;
            goal: null | Utils.Goal
        };
        
        export type OwnGoal = Utils.DefaultProperties & {
            headline: string;
        };
        
        export type Time = Utils.DefaultProperties & {
            headline: string;
        };

        export namespace Utils {
            export type Options = {
                reportLink: {
                    href: string;
                    text: string;
                    title: string;
                };
                socialsharing: {
                    services: unknown[];
                };
            };
        
            export type DefaultProperties = {
                eventIcon: string;
                likes: number;
                liked: boolean;
                likeApiRoute: string;
                unlikeApiRoute: string;
                ownGoal: boolean;
                text: string;
                time: string;
                options: Options;
            }
            
            export type TeamLogo = {
                teamName: string;
                teamIcon: string;
            }
            
            export type Player = {
                id: string;
                name: string;
                number: string;
                teamLogo: TeamLogo
                image: {
                    src: string;
                    alt: string;
                    title: string;
                };
                link: {
                    href: string;
                };
            };
            
            export type Goal = {
                teamName: string;
                player: Player;
                result: {
                    halftime: boolean;
                    teams: {
                        teamIcon: string;
                        actualGoals: number;
                        type: string;
                    }[];
                };
            };
            
            export type Substitution = {
                headline: string;
                player: Player
                player2: Player
                teamLogo: TeamLogo
            }
            
            export type Statistic = {
                text: null | string;
                player: Player
                entries: null | {
                    count: number;
                    icon: string;
                }[];
            };
            
            export type Team = {
                name: string;
            };
        }
    }
}
