import _ from "lodash";
import { Combination } from "ts-combinatorics";
import { PATH_DELIMITER } from "./constant";
import { AnyArray } from "./util";
import { isCombinatoricStructure, KOf } from "./combinatoric";
import { CombinatoricStructuresUnion } from "./combinatoric/combinatoric";

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
		tuples.map(([, value, nextPartPaths]) => [value, nextPartPaths, paths]);
const isTraversable = (v: unknown): v is object => typeof v === "object" && v !== null;

export const combinatoricStructurePaths = (object: object) => {
	function rTraverse(node: unknown, pathParts: string[], paths: Paths): Paths {
		const combinatoricToTraverseTuple = combinatoricToTraverseTupleBy(paths);
		const nonCombinatoricToTraverseTuple = nonCombinatoricToTraverseTupleBy(paths);
		if (!isTraversable(node)) return paths;
		const traverseTuples = _.chain(node)
			.map((value, key) => [pathParts.concat(key), value] as const)
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

const shortestCombinatoricStructurePath = (v: object) => {
	const paths = combinatoricStructurePaths(v);
	return _.chain(paths)
		.thru(Array.from)
		.sortBy((key) => (key as string).split(PATH_DELIMITER).length)
		.first()
		.value() as string;
};

const expanded = (obj: object) => {
	function rExpand(node: unknown): unknown {
		const path = isTraversable(node) && shortestCombinatoricStructurePath(node);
		if (path) {
			const combinatoric = _.get(node, path) as CombinatoricStructuresUnion;
			return _.chain(combinatoric.array)
				.map((inner) => _.chain(node).cloneDeep().set(path, inner).value())
				.flatMap(rExpand)
				.value();
		}
		if (!isTraversable(node)) return node;
		if (Array.isArray(node)) return node.map(rExpand);
		return _.mapValues(node, rExpand);
	}
	return rExpand(obj) as object[];
};

type TraversedGraphNode<T, K extends keyof T> = T[K] extends CombinatoricStructuresUnion
	? T[K]
	: T[K] extends object
	? TraversedGraph<T[K]>
	: T[K];
type TraversedGraph<T> = {
	[K in keyof T]: TraversedGraphNode<T, K>;
};

function* getCombinatoricArray(combinatoricStructure: CombinatoricStructuresUnion) {
	if (KOf.isSpecimen(combinatoricStructure)) {
		yield* new Combination(combinatoricStructure.array, combinatoricStructure.k).bitwiseIterator();
		return;
	}
	yield* combinatoricStructure.array.values();
}
type TraverseResult<T> = T extends AnyArray ? TraverseResult<unknown>[] : T extends object ? TraversedGraph<T> : T;
export const toExpanded = <T extends object>(obj: T) => {
	const rTraverseObject = <U extends object>(node: U, flatten = false): TraverseResult<U> | object[] => {
		if (!isCombinatoricStructure(node)) return _.mapValues(node, (value) => rTraverse(value)) as TraverseResult<U>;

		const combinatoricArray = [...getCombinatoricArray(node)];
		const array = _.flatMap(combinatoricArray, (v: unknown) => {
			const hasCombinatoricChildren = isTraversable(v) && !_.isEmpty(combinatoricStructurePaths(v));
			if (hasCombinatoricChildren) {
				const shortestPath = shortestCombinatoricStructurePath(v);
				const combinatoric = _.get(v, shortestPath);
				const array = [...getCombinatoricArray(combinatoric)];
				return array.map((inner) => _.chain(v).cloneDeep().set(shortestPath, inner).value()).map(rTraverse);
			}
			if (isTraversable(v) && isCombinatoricStructure(v)) {
				return rTraverseObject(v, true);
			}
			return [v];
		});
		return flatten ? (array as never) : ({ ...node, array } as TraverseResult<U>);
	};
	const rTraverseArray = <U extends AnyArray>(node: U): TraverseResult<U> => node.map(rTraverse) as TraverseResult<U>;
	const rTraverse = <U>(node: U): TraverseResult<U> => {
		if (!isTraversable(node)) return node as TraverseResult<U>;
		if (Array.isArray(node)) return rTraverseArray(node);
		return rTraverseObject(node) as TraverseResult<U>;
	};

	const traversed = rTraverse(obj) as TraversedGraph<T>;
	return _.castArray(expanded(traversed));
};
