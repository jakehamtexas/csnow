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
export type CombinatoricStructureUnion = CombinatoricStructure[CombinatoricStructureType];

type MakeReturn<TCast, TStructure extends CombinatoricStructureType, TStrict extends 0 | 1> = TStrict extends 0
	? CombinatoricStructure[TStructure] & TCast
	: CombinatoricStructure[TStructure];
export type Collection<T> = Record<string, T> | Record<number, T> | AnyArray<T>;

type MakeOneOf<TStrict extends 0 | 1, U = never> = <T>(
	collection: Collection<[U] extends [never] ? T : U>
) => MakeReturn<[U] extends [never] ? T : U, CombinatoricStructureType.OneOf, TStrict>;
type MakeKOf<TStrict extends 0 | 1, U = never> = <T, TCollection extends Collection<[U] extends [never] ? T : U>>(
	k: number,
	collection: TCollection
) => MakeReturn<TCollection, CombinatoricStructureType.KOf, TStrict>;
type Make<TStructure extends CombinatoricStructureType, TStrict extends 0 | 1 = 1> = TStructure extends CombinatoricStructureType.OneOf
	? MakeOneOf<TStrict>
	: MakeKOf<TStrict>;

type CollectionFunctionBy<TStructure, U> = TStructure extends CombinatoricStructureType.KOf
	? (k: number) => ReturnType<MakeKOf<0, U>>
	: () => ReturnType<MakeOneOf<0, U>>;
type RangeWith<TStructure extends CombinatoricStructureType> = (
	start: number,
	endExclusive: number,
	step?: number
) => CollectionFunctionBy<TStructure, number>;
type IterateBy<TStructure extends CombinatoricStructureType> = <T>(
	n: number,
	start: T,
	f: (current: T) => T
) => CollectionFunctionBy<TStructure, T>;
type Helpers<TStructure extends CombinatoricStructureType> = {
	make: Make<TStructure, 0>;
	strict: Make<TStructure>;
	isSpecimen: (v: unknown) => v is CombinatoricStructure[TStructure];
	rangeWith: RangeWith<TStructure>;
	iterateBy: IterateBy<TStructure>;
};
export const structureHelpersBy = <TStructure extends CombinatoricStructureType>(
	structure: TStructure,
	make: Make<TStructure>
): Helpers<TStructure> => {
	const isSpecimen = (v: unknown): v is Extract<CombinatoricStructure[TStructure], { type: TStructure }> =>
		typeof v === "object" && (v as { type: CombinatoricStructureType } | null)?.["type"] === structure;

	const collectionFnBy = (collection: Collection<unknown>) =>
		structure === CombinatoricStructureType.KOf
			? (k: number) => (make as MakeKOf<1>)(k, collection)
			: () => (make as MakeOneOf<1>)(collection);
	const rangeWith = ((start: number, endExclusive: number, step = 1) => {
		const array = _.range(start, endExclusive, step);
		return collectionFnBy(array);
	}) as RangeWith<TStructure>;

	const iterateBy = (<T>(n: number, start: T, f: (current: T) => T) => {
		const array = new Array(n).fill(null).reduce(
			(arr) => {
				const mostRecent = _.last(arr);
				return [...arr, f(mostRecent as T)];
			},
			[start] as T[]
		);
		return collectionFnBy(array);
	}) as IterateBy<TStructure>;

	return { make: make as never as Make<TStructure, 0>, strict: make, isSpecimen, rangeWith, iterateBy };
};

export const extractValues = <T>(collection: Collection<T>) => (Array.isArray(collection) ? collection : Object.values(collection));
