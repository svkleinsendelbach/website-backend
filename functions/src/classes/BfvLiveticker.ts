export type BfvLiveticker = {
    loadNew: boolean;
    ifModifiedSinceTimestamp: string;
    results: BfvLiveticker.Result[];
};

export namespace BfvLiveticker {    
    export function toBfvLiveticker(ticker: BfvApiLiveticker): BfvLiveticker {
        return {
            loadNew: ticker.loadNew,
            ifModifiedSinceTimestamp: ticker.ifModifiedSinceTimestamp,
            results: ticker.results.map(result => {
                switch (result.eventIcon) {
                case null: return {
                    type: 'comment',
                    ...result as BfvApiLiveticker.Result.Comment
                };
                case '24/whistle': return {
                    type: 'whistle',
                    ...result as BfvApiLiveticker.Result.Whistle
                };
                case '24/specialAction': return {
                    type: 'specialAction',
                    ...result as BfvApiLiveticker.Result.SpecialAction
                };
                case '24/football': return {
                    type: 'goal',
                    ...result as BfvApiLiveticker.Result.Football
                };
                case '24/substitute': return {
                    type: 'substitute',
                    ...result as BfvApiLiveticker.Result.Substitute
                };
                case '24/yellowCard': return {
                    type: 'yellowCard',
                    ...result as BfvApiLiveticker.Result.YellowCard
                };
                case '24/secondYellowCard': return {
                    type: 'secondYellowCard',
                    ...result as BfvApiLiveticker.Result.SecondYellowCard
                };
                case '24/redCard': return {
                    type: 'redCard',
                    ...result as BfvApiLiveticker.Result.RedCard
                };
                case '24/corner': return {
                    type: 'corner',
                    ...result as BfvApiLiveticker.Result.Corner
                };
                case '24/freeKick': return {
                    type: 'freeKick',
                    ...result as BfvApiLiveticker.Result.FreeKick
                };
                case '24/shotOnGoal': return {
                    type: 'shotOnGoal',
                    ...result as BfvApiLiveticker.Result.ShotOnGoal
                };
                case '24/penalty': return {
                    type: 'penalty',
                    ...result as BfvApiLiveticker.Result.Penalty
                };
                case '24/penaltyGoal': return {
                    type: 'penaltyGoal',
                    ...result as BfvApiLiveticker.Result.PenaltyGoal
                };
                case '24/ownGoal': return {
                    type: 'ownGoal',
                    ...result as BfvApiLiveticker.Result.OwnGoal
                };
                case '24/time': return {
                    type: 'time',
                    ...result as BfvApiLiveticker.Result.Time
                };
                default:
                    throw new Error(`Invalid event icon: ${result.eventIcon}`);
                }
            })
        };
    }

    export type Result = 
        | Result.Comment 
        | Result.TitledAction 
        | Result.OptionalTitledAction 
        | Result.Goal 
        | Result.Substitute 
        | Result.Card  

    export namespace Result {        
        export type Comment = {
            type: 'comment';
            headline: null | string;
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
        
        export type TitledAction = Utils.DefaultProperties & {
            type: 'whistle' | 'corner' | 'penalty' | 'ownGoal' | 'time';
            headline: string;
        };
        
        export type OptionalTitledAction = Utils.DefaultProperties & {
            type: 'specialAction' | 'freeKick' | 'shotOnGoal';
            headline: null | string;
        };

        export type Goal = Utils.DefaultProperties & {
            type: 'goal' | 'penaltyGoal';
            headline: string;
            goal: null | Utils.Goal
        };
        
        export type Substitute = Utils.DefaultProperties & {
            type: 'substitute';
            headline: string;
            substitution: null | Utils.Substitution
        };
        
        export type Card = Utils.DefaultProperties & {
            type: 'yellowCard' | 'secondYellowCard' | 'redCard';
            headline: string;
            card: string;
            statistic: null | Utils.Statistic
            team: Utils.Team
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
