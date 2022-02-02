import _ from "lodash";
import { AnyArray } from "../util";

export enum CombinatoricStructureType {
	OneOf = "oneOf",
	KOf = "kOf",
}
type PropertyKindBase<TKind extends CombinatoricStructureType> = { type: TKind; array: AnyArray };
export type CombinatoricStructure = {
	[CombinatoricStructureType.OneOf]: PropertyKindBase<CombinatoricStructureType.OneOf>;
	[CombinatoricStructureType.KOf]: PropertyKindBase<CombinatoricStructureType.KOf> & { k: number };
};
export type CombinatoricStructuresUnion = CombinatoricStructure[CombinatoricStructureType];

type MakeReturn<TCast, TStructure extends CombinatoricStructureType, TStrict extends 0 | 1> = TStrict extends 0
	? CombinatoricStructure[TStructure] & TCast
	: CombinatoricStructure[TStructure];
type Make<TStructure extends CombinatoricStructureType, TStrict extends 0 | 1 = 1> = TStructure extends CombinatoricStructureType.OneOf
	? <T>(array: AnyArray<T>) => MakeReturn<T, TStructure, TStrict>
	: <T>(k: number, array: AnyArray<T>) => MakeReturn<AnyArray<T>, TStructure, TStrict>;
export const structureHelpersBy = <TStructure extends CombinatoricStructureType>(structure: TStructure, make: Make<TStructure>) => {
	const isSpecimen = (v: unknown): v is Extract<CombinatoricStructuresUnion, { type: TStructure }> =>
		typeof v === "object" && (v as { type: CombinatoricStructureType } | null)?.["type"] === structure;

	const arrayFnBy = (array: AnyArray) =>
		structure === CombinatoricStructureType.KOf
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

	return { make: make as never as Make<TStructure, 0>, strict: make, isSpecimen, rangeWith, iterateBy } as const;
};
