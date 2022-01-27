import fastCartesian from "fast-cartesian";
import { Combination } from "js-combinatorics";
import _ from "lodash";

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

const pathDelimiter = "." as const;
const traverseAndBuildPlan = (object: object) => {
	const isTraversable = (v: unknown): v is object => typeof v === "object" && v !== null;
	function rTraverse(obj: object, pathParts: string[], paths: Record<string, boolean>) {
		if (!isTraversable(obj)) return paths;
		const merged = Object.entries(obj)
			.map(([key, value]) => {
				const nextPathParts = pathParts.concat(key);
				const path = nextPathParts.join(pathDelimiter);

				const isExpandable = isOneOf(value) || isKOf(value);
				paths[path] = isExpandable;
				return rTraverse(value, nextPathParts, paths);
			})
			.reduce((acc, cur) => ({ ...acc, ...cur }), {}) as Record<string, boolean>;
		return merged;
	}

	const shouldExpandByPath = rTraverse(object, [], {});
	return Object.fromEntries(Object.entries(shouldExpandByPath).filter(([, v]) => v));
};

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
	const plan = traverseAndBuildPlan(subject);
	_.chain(plan)
		.keys()
		.filter((key) => key.includes("array"))
		.sortBy((a) => a.split(pathDelimiter).length)
		.reduceRight(
			([objs, currentSubjects], path) => {
				const values = _.chain(subject)
					.get(path)
					.thru(castValuesArray)
					.flatMap((v) =>
						_.chain(currentSubjects)
							.map((currentSubject) => _.chain(currentSubject).clone().set(path, v).value())
							.value()
					)
					.value();
			},
			[[], [subject]] as [any[], Subject[]]
		);
	return plan;
	// if (Array.isArray(subject)) return fastCartesian(subject.map((v) => (Array.isArray(v) ? v : [v])) as unknown[][]);

	// const entries = Object.entries(subject).map(([key, value]) => castValuesArray(value).map((v) => [key, v] as const));

	// return fastCartesian(entries).map(Object.fromEntries);
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
