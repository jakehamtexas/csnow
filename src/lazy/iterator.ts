import { HasValuesIterator } from "./abstract";
import hasType from "./hasType";

const flatten = function* <T>(instance: HasValuesIterator<T>) {
	for (const value of instance.iterators.values()) {
		if (hasType.array<T>(value) || hasType.set<T>(value)) {
			yield* value;
		} else if (hasType.lazyArray<T>(value) || hasType.lazySet<T>(value)) {
			yield* value.collect() as T[];
		} else {
			yield value;
		}
	}
};

export default {
	flatten,
};
