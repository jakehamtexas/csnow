import _ from "lodash";
import { AnyArray } from "../util";

export enum CombinatoricStructure {
	OneOf = "oneOf",
	KOf = "kOf",
}
type PropertyKindBase<TKind extends CombinatoricStructure> = { type: TKind; array: AnyArray };
export type CombinatoricStructures = {
	[CombinatoricStructure.OneOf]: PropertyKindBase<CombinatoricStructure.OneOf>;
	[CombinatoricStructure.KOf]: PropertyKindBase<CombinatoricStructure.KOf> & { k: number };
};
export type CombinatoricStructuresUnion = CombinatoricStructures[CombinatoricStructure];

export const structureHelpersBy = <TStructure extends CombinatoricStructure>(
	structure: TStructure,
	make: TStructure extends CombinatoricStructure.OneOf
		? (array: AnyArray) => CombinatoricStructures[CombinatoricStructure.OneOf]
		: (k: number, array: AnyArray) => CombinatoricStructures[CombinatoricStructure.KOf]
) => {
	const isSpecimen = (v: unknown): v is Extract<CombinatoricStructuresUnion, { type: TStructure }> =>
		typeof v === "object" && (v as { type: CombinatoricStructure } | null)?.["type"] === structure;

	const arrayFnBy = (array: AnyArray) =>
		structure === CombinatoricStructure.KOf
			? (k: number) => make(k as number & AnyArray, array)
			: () => make(array as number & AnyArray, undefined as never);
	const rangeWith = (start: number, endExclusive: number, step = 1) => {
		const array = _.range(start, endExclusive, step);
		return arrayFnBy(array);
	};

	const iterateBy = <T>(n: number, start: T, f: (current: T) => T) => {
		const array = new Array(n).fill(null).reduce(
			(arr) => {
				const mostRecent = _.last(arr);
				return [...arr, f(mostRecent as T)];
			},
			[start] as T[]
		);
		return arrayFnBy(array);
	};
	return { make, isSpecimen, rangeWith, iterateBy } as const;
};
