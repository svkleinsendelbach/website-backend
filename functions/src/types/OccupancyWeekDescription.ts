import { IDatabaseSnapshot, UtcDate } from 'firebase-function';
import { DatabaseScheme } from '../DatabaseScheme';
import { Occupancy } from './Occupancy';

export class OccupancyWeekDescription {
    public constructor(
        private readonly snapshot: IDatabaseSnapshot<DatabaseScheme['occupancies']>
    ) {}

    public get descriptions(): Record<Occupancy.Location, string> {
        const groupedOccupancies = this.groupedOccupancies;
        return {
            'sportshome': this.locationDescription(groupedOccupancies['sportshome']),
            'a-field': this.locationDescription(groupedOccupancies['a-field']),
            'b-field': this.locationDescription(groupedOccupancies['b-field'])
        };
    }

    public dayDescription(date: UtcDate): string {
        return `${date.day}.${date.month}.${date.year}`;
    }

    public get weekDescription(): string {
        const currentWeek = this.currentWeek;
        return `${this.dayDescription(currentWeek.start)} - ${this.dayDescription(currentWeek.end)}`;
    }

    public dateDescription(occupancy: Omit<Occupancy, 'id'>): string {
        return `${occupancy.start.description('de-DE', 'Europe/Berlin')} - ${occupancy.end.description('de-DE', 'Europe/Berlin')}`;
    }

    public get currentWeek(): { start: UtcDate; end: UtcDate } {
        const today = UtcDate.now.setted({ hour: 0, minute: 0 });
        const currentWeekDay = today.toDate.getDay();
        const start = today.advanced({ day: -currentWeekDay + 1 });
        return {
            start: start,
            end: start.advanced({ day: 7 })
        };
    }

    private get groupedOccupancies(): Record<Occupancy.Location, Omit<Occupancy, 'id'>[]> {
        const currentWeek = this.currentWeek;
        return this.snapshot.flatMap<Omit<Occupancy, 'id'>>(snapshot => {
            if (snapshot.key === null)
                return [];
            const occupancy = Occupancy.concrete(snapshot.value('decrypt'));
            if (!occupancy.recurring) {
                if (occupancy.end.compare(currentWeek.start) !== 'greater' || occupancy.start.compare(currentWeek.end) !== 'less')
                    return [];
                return [occupancy];
            }
            const occupancies: Omit<Occupancy, 'id'>[] = [];
            let i = 0;
            // eslint-disable-next-line no-constant-condition
            while (true) {
                const newOccupancy: Omit<Occupancy, 'id'> = {
                    ...occupancy,
                    end: occupancy.end.advanced(Occupancy.Recurring.advancement(occupancy.recurring.repeatEvery, i)),
                    start: occupancy.start.advanced(Occupancy.Recurring.advancement(occupancy.recurring.repeatEvery, i))
                };
                const startDay = occupancy.start.advanced(Occupancy.Recurring.advancement(occupancy.recurring.repeatEvery, i)).setted({ hour: 0, minute: 0 });
                if (occupancy.recurring.untilIncluding.compare(startDay) === 'less')
                    break;
                if (!occupancy.recurring.excludingDates.some(excludingDate => excludingDate.compare(startDay) === 'equal') && newOccupancy.end.compare(currentWeek.start) !== 'less' && newOccupancy.start.compare(currentWeek.end) !== 'greater')
                    occupancies.push(newOccupancy);
                i += 1;                
            }
            return occupancies;
        }).reduce<Record<Occupancy.Location, Omit<Occupancy, 'id'>[]>>((groupedOccupancies, occupancy) => {
            groupedOccupancies[occupancy.location].push(occupancy);
            return groupedOccupancies;
        }, { 'sportshome': [], 'a-field': [], 'b-field': [] });
    }

    private collisions(occupancies: Omit<Occupancy, 'id'>[]): [Omit<Occupancy, 'id'>, Omit<Occupancy, 'id'>][] {
        const collisions: [Omit<Occupancy, 'id'>, Omit<Occupancy, 'id'>][] = [];
        for (let i = 0; i < occupancies.length - 1; i++) {
            for (let j = i + 1; j < occupancies.length; j++) {
                if (occupancies[j].start.compare(occupancies[i].start) === 'greater' && occupancies[j].start.compare(occupancies[i].end) === 'less')
                    collisions.push([occupancies[i], occupancies[j]]);
            }
        }
        return collisions;
    }

    private locationDescription(occupancies: Omit<Occupancy, 'id'>[]): string {
        occupancies.sort((a, b) => a.start.compare(b.start) === 'less' ? -1 : 1);
        if (occupancies.length === 0)
            return 'Keine Belegungen';
        const occupanciesDescription = occupancies.map(occupancy => {
            return `${this.dateDescription(occupancy)} | ${occupancy.title}`;
        }).join('\n');
        const collisions = this.collisions(occupancies);
        if (collisions.length === 0)
            return occupanciesDescription;
        const collisionsDescription = collisions.map(collision => {
            return `${this.dayDescription(collision[1].start)} | ${collision[0].title} - ${collision[1].title}`;
        }).join('\n');
        return `${occupanciesDescription}\n\n\nÜberschneidungen:\n${collisionsDescription}`;
    }
}