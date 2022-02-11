import _ from "lodash";
import { Combination } from "ts-combinatorics";
import { PATH_DELIMITER } from "./constant";
import { isCombinatoricStructure, KOf } from "./combinatoric";
import { CombinatoricStructureUnion } from "./combinatoric/combinatoric";
import { Lazy, ILazyArray } from "./lazy";
import { AnyNode, TerminalNode, NonTerminalNode, traverseWith, RTraverseFn } from "./traverse";
import { ObjectKey } from "./lazy/abstract";
import hasType from "./lazy/hasType";

type CombinatoricTuple = readonly [string, never, string[]];
type Paths = Set<string>;
type TraverseTuple = readonly [never, string[], Paths];
const combinatoricToTraverseTupleBy =
	(paths: Paths) =>
	(tuples: CombinatoricTuple[]): TraverseTuple[] =>
		tuples.map(([path, value, nextPathParts]) => [value, nextPathParts, paths.add(path)] as const);
const nonCombinatoricToTraverseTupleBy =
	(paths: Paths) =>
	(tuples: CombinatoricTuple[]): TraverseTuple[] =>
		tuples.map(([, value, nextPartPaths]) => [value, nextPartPaths, paths] as const);
type MakeLazy<TType extends "and" | "or"> = TType extends "and"
	? typeof Lazy.array & typeof Lazy.object
	: typeof Lazy.array | typeof Lazy.object;
type MakeLazyU = MakeLazy<"or">;
type MakeLazyI = MakeLazy<"and">;

export const combinatoricStructurePaths = (object: unknown) => {
	function rTraverse(node: unknown, pathParts: string[], paths: Paths): Paths {
		const combinatoricToTraverseTuple = combinatoricToTraverseTupleBy(paths);
		const nonCombinatoricToTraverseTuple = nonCombinatoricToTraverseTupleBy(paths);
		if (hasType.value(node) || hasType.lazyValue(node)) return paths;
		const traverseTuples = _.chain(node as Record<ObjectKey, never>)
			.map((value, key) => [pathParts.concat((key as ObjectKey).toString()), value] as const)
			.map(([nextPathParts, value]) => [nextPathParts.join(PATH_DELIMITER), value, nextPathParts] as const)
			.partition(([, value]) => isCombinatoricStructure(value))
			.thru(([combinatoric, nonCombinatoric]) =>
				combinatoricToTraverseTuple(combinatoric).concat(nonCombinatoricToTraverseTuple(nonCombinatoric))
			)
			.value();
		return new Set(
			_.chain(traverseTuples)
				.map((args) => rTraverse(...args))
				.flatMap((set) => [...set])
				.value()
		);
	}

	return rTraverse(object, [], new Set());
};

export const shortestCombinatoricStructurePath = (v: AnyNode) => {
	const paths = combinatoricStructurePaths(v);
	return _.chain([...paths])
		.sortBy((key) => key.split(PATH_DELIMITER).length)
		.first()
		.value() as string;
};

export type Subject = Record<string, AnyNode>;

const possibilities = (combinatoricStructure: CombinatoricStructureUnion): ILazyArray<TerminalNode | NonTerminalNode> => {
	const possibilitiesIterable = KOf.isSpecimen(combinatoricStructure)
		? new Combination(combinatoricStructure.array, combinatoricStructure.k)
		: combinatoricStructure.array;
	return Lazy.array(possibilitiesIterable as Iterable<TerminalNode | NonTerminalNode>);
};

const traverseAndExpandWith =
	<TMakeLazy extends MakeLazyU>(makeLazy: TMakeLazy) =>
	<TIterableHookRT, TMapHookRT>(traverse: RTraverseFn<TIterableHookRT, TMapHookRT>) =>
	(node: AnyNode) => {
		const path = shortestCombinatoricStructurePath(node);
		if (path) {
			const combinatoric = _.get(node, path) as CombinatoricStructureUnion;
			return possibilities(combinatoric)
				.map((inner) => _.chain(node).cloneDeep().set(path, inner).value())
				.flatMap(traverse);
		}
		return (makeLazy as MakeLazyI)(node as Iterable<AnyNode>).map(traverse);
	};
const { rTraverse: rExpand } = traverseWith({
	rTraverseIterableBy: traverseAndExpandWith(Lazy.array),
	rTraverseMapBy: traverseAndExpandWith(Lazy.object),
});

export const expanded = <TSubject extends Subject>(subject: TSubject) => rExpand(subject) as ILazyArray<TSubject>;
