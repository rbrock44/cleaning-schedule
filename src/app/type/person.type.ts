export type Person = {
    color: string;
    shades: Shades
};

export type People = { [name: string]: Person };

export type Shades = {
    [meetingTitle: string]: string
}