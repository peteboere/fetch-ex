export { ms } from "space-time";
export const assign: {
    <T extends {}, U>(target: T, source: U): T & U;
    <T extends {}, U, V>(target: T, source1: U, source2: V): T & U & V;
    <T extends {}, U, V, W>(target: T, source1: U, source2: V, source3: W): T & U & V & W;
    (target: object, ...sources: any[]): any;
};
export const defineProperties: <T>(o: T, properties: PropertyDescriptorMap & ThisType<any>) => T;
export function sleep(time: any): Promise<any>;
export function countOf(it: any, subject?: string): string;
