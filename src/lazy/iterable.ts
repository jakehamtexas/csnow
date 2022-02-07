import _ from "lodash";
import { traverseWith, AnyNode } from "../traverse";
import { ObjectKey, SeedIterable } from "./abstract";
import hasType from "./hasType";

const isIterable = <T>(maybe: unknown): maybe is Iterable<T> => typeof (maybe as Iterable<T>)[Symbol.iterator] === "function";
const getValues = <T>(seed: SeedIterable<T, never>): Iterable<T> => {
	if (hasType.set<T>(seed)) return seed;
	if (hasType.lazySet<T>(seed)) return seed;
	if (hasType.lazyArray<T>(seed)) return seed;
	if (hasType.array(seed)) return seed;
	if (hasType.lazyObject(seed)) return seed.iterators.values();
	if (seed instanceof Map) return seed.values();
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
	if (hasType.lazyObject(seed)) return seed.iterators.entries();
	if (seed instanceof Map) return seed.entries();

	const isSet = [hasType.set, hasType.lazySet].some((fn) => fn(seed));
	const isArray = [hasType.array, hasType.lazyArray].some((fn) => fn(seed));
	if (isSet)
		return (function* () {
			for (const value of getValues(seed)) {
				yield [undefined as unknown as TKey, value as T];
			}
		})();
	if (isArray || isIterable<T>(seed))
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
	terminalHook: (node) => (hasType.lazyValue(node) ? node.collect() : node),
	rTraverseIterableBy: (traverse) => (node) =>
		[...(hasType.lazyArray(node) || hasType.lazySet(node) ? node.collect() : node)].map((n) => traverse(n as AnyNode)),
	rTraverseMapBy: (traverse) => (node) => _.mapValues(hasType.lazyObject(node) ? node.collect() : node, traverse),
});
