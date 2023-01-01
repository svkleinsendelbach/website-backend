/**
 * Build a string from multiple substrings.
 */
export class StringBuilder {

    /**
     * List of all substrings.
     */
    private stringArray: string[] = [];

    /**
     * Constructs the string builder with an intial string.
     * @param { string | undefined } initialString Intial string of the string builder
     */
    public constructor(initialString?: string) {
        if (initialString !== undefined)
            this.stringArray.push(initialString);
    }

    /**
     * Indicates whether the result string would be empty.
     * @return { boolean } `true` if the result string would be empty, `false` otherwise.
     */
    public get isEmpty(): boolean {
        return this.stringArray.length == 0;
    }

    /**
     * Append a new substring to the string builder.
     * @param { string } string Substring to append to the string builder.
     */
    public append(string: string) {
        this.stringArray.push(string);
    }

    /**
     * Append a new sting with a new line feed to the string builder.
     * @param { string } string Substring to append with a new line feed to the string builder.
     */
    public appendLine(string: string) {
        this.stringArray.push(`${string}\n`);
    }

    /**
     * Joins all substring to the result string.
     * @return { string } Result string of the string builder,
     */
    public toString(): string {
        return this.stringArray.join('');
    }

    /**
     * Clears the string builder.
     */
    public clear() {
        this.stringArray = [];
    }
}
