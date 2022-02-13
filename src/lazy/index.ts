import { ObjectKey, SeedIterable } from "./abstract";
import { LazyArray } from "./array";
import { LazySet } from "./set";
import { LazyObject } from "./object";
import { KeyedCollection } from "./object";
import hasType from "./hasType";

export type { IAnyLazy, IKeyedLazy, ILazyArray, ILazyObject, ILazySet } from "./abstract";

export const Lazy = {
	array: <T>(seed: SeedIterable<T, number>) => new LazyArray(seed),
	object: <T, TKey extends ObjectKey>(seed: KeyedCollection<T, TKey>) => new LazyObject(seed),
	set: <T>(seed: SeedIterable<T, never>) => new LazySet(seed),
	isArray: hasType.lazyArray,
	isSet: hasType.lazySet,
	isObject: hasType.lazyObject,
};
