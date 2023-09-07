export type GameInfo = {
    id: string;
    competition: {
        name: string;
        link: string | null;
        gameDay: number;
    };
    result: {
        home: number | null;
        away: number | null;
    };
    date: string;
    homeTeam: GameInfo.Team;
    awayTeam: GameInfo.Team;
    adress: string | null;
    adressDescription: string | null;
    report: GameInfo.Report | null;
};

export namespace GameInfo {
    export type Team = {
        id: string;
        name: string;
        imageId: string;
    };

    export type Report = { 
        title: string; 
        paragraphs: { text: string; link: string | null }[][];
    };
}
