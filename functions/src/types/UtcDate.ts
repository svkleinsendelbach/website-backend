export class UtcDate {
    public constructor(
        private readonly year: number,
        private readonly month: number,
        private readonly day: number,
        private readonly hour: number,
        private readonly minute: number,
        timezone?: 'Europe/Berlin'
    ) {
        if (timezone !== undefined) {
            const date = new Date(this.year, this.month, this.day, this.hour, this.minute);
            const offset = date.getUTCHours() - new Date(date.toLocaleString('en-US', { timeZone: timezone })).getUTCHours();
            this.hour += offset;
        }
    }

    public static fromDate(date: Date): UtcDate {
        return new UtcDate(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes());
    }

    public static fromIsoDate(date: string): UtcDate {
        return UtcDate.fromDate(new Date(date));
    }

    public static get now(): UtcDate {
        return UtcDate.fromDate(new Date());
    }

    public static decode(encodedDate: string): UtcDate {
        const regex = /^(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})-(?<hour>\d{2})-(?<minute>\d{2})$/g;
        const match = regex.exec(encodedDate);
        if (match === null || match.groups === undefined)
            return new UtcDate(0, 0, 0, 0, 0);
        return new UtcDate(
            Number.parseInt(match.groups['year']),
            Number.parseInt(match.groups['month']),
            Number.parseInt(match.groups['day']),
            Number.parseInt(match.groups['hour']),
            Number.parseInt(match.groups['minute'])
        );
    }

    public get encoded(): string {
        const year = this.year.toString();
        const month = this.month <= 9 ? `0${this.month}` : this.month.toString();
        const day = this.day <= 9 ? `0${this.day}` : this.day.toString();
        const hour = this.hour <= 9 ? `0${this.hour}` : this.hour.toString();
        const minute = this.minute <= 9 ? `0${this.minute}` : this.minute.toString();
        return `${year}-${month}-${day}-${hour}-${minute}`;
    }

    public advanced(components: { year?: number; month?: number; day?: number; hour?: number; minute?: number }): UtcDate {
        const date = new Date(Date.UTC(this.year, this.month, this.day, this.hour, this.minute));
        date.setUTCFullYear(date.getUTCFullYear() + (components.year ?? 0));
        date.setUTCMonth(date.getUTCMonth() + (components.month ?? 0));
        date.setUTCDate(date.getUTCDate() + (components.day ?? 0));
        date.setUTCHours(date.getUTCHours() + (components.hour ?? 0));
        date.setUTCMinutes(date.getUTCMinutes() + (components.minute ?? 0));
        return UtcDate.fromDate(date);
    }

    public compare(other: UtcDate): 'less' | 'equal' | 'greater' {
        if (this.year < other.year)
            return 'less';
        else if (this.year > other.year)
            return 'greater';
        if (this.month < other.month)
            return 'less';
        else if (this.month > other.month)
            return 'greater';
        if (this.day < other.day)
            return 'less';
        else if (this.day > other.day)
            return 'greater';
        if (this.hour < other.hour)
            return 'less';
        else if (this.hour > other.hour)
            return 'greater';
        if (this.minute < other.minute)
            return 'less';
        else if (this.minute > other.minute)
            return 'greater';
        return 'equal';
    }
}
