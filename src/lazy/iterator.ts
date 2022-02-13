import _ from "lodash";
import { makeCase, matchBy } from "../match";
import { HasValuesIterator } from "./abstract";
import hasType from "./hasType";

const flatten = function* <T>(instance: HasValuesIterator<T>) {
	for (const value of instance.iterators.values()) {
		yield* matchBy(value)({
			cases: [
				makeCase(hasType.array, _.identity),
				makeCase(hasType.set, _.identity),
				makeCase(hasType.lazyArray, (v) => v.collect()),
				makeCase(hasType.lazySet, (v) => [...v.collect()]),
			],
			wildcard: (v) => [v],
		}) as unknown as T[];
	}
};

export default {
	flatten,
};
