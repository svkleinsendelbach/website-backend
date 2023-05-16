export type HexChar = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export type HexByte = `${HexChar}${HexChar}`;

export type ByteRepresentation = HexByte | number;

export namespace HexChar {
    export const hexChars: HexChar[] = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];

    export function typeGuard(value: string): value is HexChar {
        return (hexChars as string[]).includes(value);
    }
}

export namespace HexByte {
    export function typeGuard(value: string): value is HexByte {
        if (value.length !== 2)
            return false;
        return HexChar.typeGuard(value[0]) && HexChar.typeGuard(value[1]);
    }

    export function toByte(value: HexByte): number {
        const msb = HexChar.hexChars.indexOf(value[0] as HexChar);
        const lsb = HexChar.hexChars.indexOf(value[1] as HexChar);
        return 16 * msb + lsb;
    }

    export function toPercentage(value: HexByte): number {
        return toByte(value) / 255;
    }

    export function fromByte(value: number): HexByte {
        const msb = HexChar.hexChars[(value & 0xF0) >>> 4];
        const lsb = HexChar.hexChars[value & 0x0F];
        return msb + lsb as HexByte;
    }

    export function fromPercentage(value: number): HexByte {
        return fromByte(value * 255);
    }
}
