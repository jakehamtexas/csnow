import _ from "lodash";
import { makeCase, matchBy } from "../match";
import { traverseWith, AnyNode, TerminalNode } from "../traverse";
import { ObjectKey, SeedIterable } from "./abstract";
import hasType from "./hasType";

const isMap = <T>(maybe: unknown): maybe is Map<never, T> => maybe instanceof Map;
const isIterable = <T>(maybe: unknown): maybe is Iterable<T> => typeof (maybe as Iterable<T>)[Symbol.iterator] === "function";

const getValues = <T>(seed: SeedIterable<T, never>): Iterable<T> =>
	matchBy(seed)({
		cases: [
			makeCase(hasType.anyArray, _.identity),
			makeCase(hasType.anySet, _.identity),
			makeCase(isMap, (seed) => seed.values()),
			makeCase(isIterable, _.identity),
		],
		wildcard: function* (v) {
			const record = v as Record<string, T>;
			for (const key in record) {
				const value = record[key];
				yield value as T;
			}
		},
	}) as Iterable<T>;

export const getEntries = <T, TKey extends ObjectKey>(seed: SeedIterable<T, TKey>): Iterable<[TKey, T]> =>
	matchBy(seed)({
		cases: [
			makeCase(hasType.lazyObject, (v) => v.iterators.entries() as unknown as Iterable<[TKey, T]>),
			makeCase(isMap, (v) => v.entries() as unknown as Iterable<[TKey, T]>),
			makeCase(hasType.anySet, function* (v) {
				for (const value of getValues(v)) {
					yield [undefined as unknown, value] as [TKey, T];
				}
			}),
			makeCase(
				(v) => hasType.anyArray(v) || isIterable<T>(v),
				function* (v) {
					let index = 0;
					for (const value of getValues(v as SeedIterable<T, TKey>)) {
						yield [index as unknown, value] as [TKey, T];
						index += 1;
					}
				}
			),
		],
		wildcard: function* (v) {
			const record = v as Record<TKey, T>;
			for (const key in record) {
				const value = record[key];
				yield [key, value] as [TKey, T];
			}
		},
	});

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
