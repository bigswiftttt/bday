export type Era = "then" | "between" | "now";

export type Photo = {
    src: string;
    w: number;
    h: number;
    era: Era;
    year?: string; // e.g. "2009"
    caption?: string; // e.g. "The year you taught me to ride a bike"
};

// Fill in year and caption for any photo. Leave them out and just the photo shows.
export const PHOTOS: Photo[] = [
    { src: "/photos/01.jpg", w: 780, h: 1040, era: "then" },
    { src: "/photos/02.jpg", w: 780, h: 1040, era: "then" },
    { src: "/photos/03.jpg", w: 715, h: 876, era: "between" },
    { src: "/photos/04.jpg", w: 764, h: 1262, era: "between" },
    { src: "/photos/05.jpg", w: 720, h: 1280, era: "now" },
    { src: "/photos/06.jpg", w: 750, h: 910, era: "now" },
    { src: "/photos/07.jpg", w: 729, h: 729, era: "now" },
    { src: "/photos/08.jpg", w: 715, h: 953, era: "now" },
    { src: "/photos/09.jpg", w: 715, h: 953, era: "now" },
];