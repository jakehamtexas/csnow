import { LazyObject } from "./object";
import { LazySet } from "./set";
import { LazyArray } from "./array";
import { SeedIterable } from "./abstract";

export const getAsValues = <T>(seed: SeedIterable<T, never>) => {
	if (seed instanceof LazySet) return seed;
	if (seed instanceof LazyArray) return seed;
	if (seed instanceof LazyObject) return seed.iterators.values();
	if (seed instanceof Set) return seed.values();
	if (seed instanceof Array) return seed.values();
	if (seed instanceof Map) return seed.values();

	const record = seed as Record<string, T>;
	return (function* () {
		for (const index in record) {
			const value = record[index];
			yield value as T;
		}
	})();
};
