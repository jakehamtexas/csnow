import { IArray, IObject, ISet, ObjectKey, SeedIterable } from "./abstract";
import { LazyArray } from "./array";
import { LazySet } from "./set";
import { LazyObject } from "./object";
import { KeyedCollection } from "./object";

export const Lazy = {
	array: <T>(seed: SeedIterable<T, number>) => new LazyArray(seed),
	object: <T, TKey extends ObjectKey>(seed: KeyedCollection<T, TKey>) => new LazyObject(seed),
	set: <T>(seed: SeedIterable<T, never>) => new LazySet(seed),
};

export type IKeyedLazy<T, TKey extends ObjectKey> = IObject<T, TKey> | IArray<T>;
export type IAnyLazy<T, TKey extends ObjectKey = never> = IKeyedLazy<T, TKey> | ISet<T>;
