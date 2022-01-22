import fastCartesian from "fast-cartesian";
// type Cartesian = {};
// type Snap<TInput extends Cartesian, TOutput> = (input: TInput, fn: (input: TInput) => TOutput) => SnapTest<TInput, TOutput>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyArray = readonly any[] | any[];
export const calculate = <T extends AnyArray, TKey extends string>(subject: Record<TKey, OneOf<T>>) => {
	const entries = Object.entries(subject).map(([key, value]) => (value as OneOf<T>).value.map((v) => [key, v] as const));

	return fastCartesian(entries).map(Object.fromEntries);
};

export enum PropertyKind {
	OneOf = "oneOf",
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type OneOf<T extends AnyArray> = { type: PropertyKind.OneOf; value: T };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const oneOf = <T extends AnyArray>(arr: T): OneOf<T> => ({ type: PropertyKind.OneOf, value: arr });
