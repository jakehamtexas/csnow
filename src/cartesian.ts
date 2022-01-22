import fastCartesian from "fast-cartesian";
import { Combination } from "js-combinatorics";
// type Cartesian = {};
// type Snap<TInput extends Cartesian, TOutput> = (input: TInput, fn: (input: TInput) => TOutput) => SnapTest<TInput, TOutput>;
export enum PropertyKind {
	OneOf = "oneOf",
	KOf = "kOf",
}

const isPropertyKindBy =
	<TPropertyKind extends PropertyKind>(kind: TPropertyKind) =>
	(v: unknown): v is Extract<PropertyKindsUnion, { type: TPropertyKind }> =>
		typeof v === "object" && (v as { type: PropertyKind } | null)?.["type"] === kind;
const isOneOf = isPropertyKindBy(PropertyKind.OneOf);
const isKOf = isPropertyKindBy(PropertyKind.KOf);
const castValuesArray = (v: unknown): AnyArray => {
	if (isOneOf(v)) return v.array;

	// TODO: This may be best left as an iterator instead of eagerly evaluated.
	if (isKOf(v)) return [...Combination.of(v.array, v.k)];

	return [v];
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyArray = readonly any[] | any[];
type Subject = Record<string, OneOf | KOf | string | number | symbol | object> | AnyArray[] | (AnyArray | unknown)[];
export const calculate = (subject: Subject) => {
	if (Array.isArray(subject)) return fastCartesian(subject.map((v) => (Array.isArray(v) ? v : [v])) as unknown[][]);

	const entries = Object.entries(subject).map(([key, value]) => castValuesArray(value).map((v) => [key, v] as const));

	return fastCartesian(entries).map(Object.fromEntries);
};

type PropertyKindBase<TKind extends PropertyKind> = { type: TKind; array: AnyArray };

type OneOf = PropertyKindBase<PropertyKind.OneOf>;
type KOf = PropertyKindBase<PropertyKind.KOf> & { k: number };

type PropertyKindsUnion = OneOf | KOf;
const arrayPropertyOf =
	<TPropertyKind extends PropertyKind>(kind: TPropertyKind) =>
	(array: AnyArray): PropertyKindBase<TPropertyKind> => ({ type: kind, array });

export const oneOf = arrayPropertyOf(PropertyKind.OneOf);
export const kOf = (k: number, array: AnyArray) => ({ ...arrayPropertyOf(PropertyKind.KOf)(array), k });
