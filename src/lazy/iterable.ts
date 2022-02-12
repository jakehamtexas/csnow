import _ from "lodash";
import { traverseWith, AnyNode, TerminalNode } from "../traverse";
import { ObjectKey, SeedIterable } from "./abstract";
import hasType from "./hasType";

const isMap = <T>(maybe: unknown): maybe is Map<never, T> => maybe instanceof Map;
const isIterable = <T>(maybe: unknown): maybe is Iterable<T> => typeof (maybe as Iterable<T>)[Symbol.iterator] === "function";

const getValues = <T>(seed: SeedIterable<T, never>): Iterable<T> => {
	if (hasType.anyArray<T>(seed) || hasType.anySet<T>(seed)) return seed;
	if (hasType.lazyObject<T>(seed)) return seed.iterators.values();
	if (isMap<T>(seed)) return seed.values();
	if (isIterable<T>(seed)) return seed;

	const record = seed as Record<ObjectKey, T>;
	return (function* () {
		for (const key in record) {
			const value = record[key];
			yield value as T;
		}
	})();
};
export const getEntries = <T, TKey extends ObjectKey>(seed: SeedIterable<T, TKey>): Iterable<[TKey, T]> => {
	if (hasType.lazyObject<T>(seed)) return seed.iterators.entries();
	if (isMap<T>(seed)) return seed.entries();

	if (hasType.anySet(seed))
		return (function* () {
			for (const value of getValues(seed)) {
				yield [undefined as unknown as TKey, value as T];
			}
		})();
	if (hasType.anyArray(seed) || isIterable<T>(seed))
		return (function* () {
			let index = 0;
			for (const value of getValues(seed)) {
				yield [index as unknown as TKey, value as T];
				index += 1;
			}
		})();

	const record = seed as Record<TKey, T>;
	return (function* () {
		for (const key in record) {
			const value = record[key];
			yield [key, value] as [TKey, T];
		}
	})();
};

export const getKeys = function* <TKey extends ObjectKey>(seed: SeedIterable<never, TKey>): Iterable<TKey> {
	for (const [key] of getEntries(seed)) {
		yield key;
	}
};

export const { rTraverse: rCollectDeep } = traverseWith({
	terminalHook: (node) => (hasType.lazyValue<TerminalNode>(node) ? node.collect() : node),
	rTraverseIterableBy: (traverse) => (node) =>
		[...(hasType.lazyArray(node) || hasType.lazySet(node) ? node.collect() : node)].map((n) => traverse(n as AnyNode)),
	rTraverseMapBy: (traverse) => (node) => _.mapValues(hasType.lazyObject<AnyNode>(node) ? node.collect() : node, traverse),
});
