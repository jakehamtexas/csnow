import fastCartesian from "fast-cartesian";
// type Cartesian = {};
// type Snap<TInput extends Cartesian, TOutput> = (input: TInput, fn: (input: TInput) => TOutput) => SnapTest<TInput, TOutput>;

const isOneOf = (v: unknown): v is OneOf<unknown[]> =>
	typeof v === "object" && (v as { type: PropertyKind } | null)?.["type"] === PropertyKind.OneOf;
const castValuesArray = (v: unknown): unknown[] => {
	if (isOneOf(v)) return v.value;
	return [v];
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyArray = readonly any[] | any[];
type Subject<T extends AnyArray, TKey extends string> =
	| Record<TKey, OneOf<T> | string | number | symbol | object>
	| AnyArray[]
	| (AnyArray | unknown)[];
export const calculate = <T extends AnyArray, TKey extends string>(subject: Subject<T, TKey>) => {
	if (Array.isArray(subject)) return fastCartesian(subject.map((v) => (Array.isArray(v) ? v : [v])) as unknown[][]);

	const entries = Object.entries(subject).map(([key, value]) => castValuesArray(value).map((v) => [key, v] as const));

	return fastCartesian(entries).map(Object.fromEntries);
};

export enum PropertyKind {
	OneOf = "oneOf",
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type OneOf<T extends AnyArray> = { type: PropertyKind.OneOf; value: T };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const oneOf = <T extends AnyArray>(arr: T): OneOf<T> => ({ type: PropertyKind.OneOf, value: arr });
