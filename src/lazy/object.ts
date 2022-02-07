import { EachFn, FilterFn, IArray, IObject, MapFn, ObjectKey, ObjectKeyedIterable } from "./abstract";
import { LazyArray } from "./array";

export type KeyedCollection<T, TKey extends ObjectKey> = ObjectKeyedIterable<T, TKey> | T[] | IArray<T>;

export const getAsEntries = <T, TKey extends ObjectKey>(seed: KeyedCollection<T, TKey>) => {
	if (seed instanceof LazyArray) return seed.iterators.entries();
	if (seed instanceof LazyObject) return seed.iterators.entries();
	if (seed instanceof Array) return seed.entries();
	if (seed instanceof Map) return seed.entries();

	const record = seed as Record<string, T>;
	return (function* () {
		for (const index in record) {
			const value = record[index];
			yield [index, value] as [TKey, T];
		}
	})();
};

export class LazyObject<T, TKey extends ObjectKey> implements IObject<T, TKey> {
	constructor(private readonly seed: KeyedCollection<T, TKey>) {}
	collect(): Record<TKey, T> {
		return Object.fromEntries([...this]) as Record<TKey, T>;
	}
	private get iterable(): Iterable<[TKey, T]> {
		return getAsEntries(this.seed);
	}
	iterators: { values(): IterableIterator<T>; keys(): IterableIterator<TKey>; entries(): IterableIterator<[TKey, T]> } = (() => {
		const keys = new Set<TKey>();
		const getIterable = () => this.iterable;
		return {
			*entries() {
				for (const [key, value] of getIterable()) {
					if (!keys.has(key)) {
						yield [key, value];
						keys.add(key);
					}
				}
			},
			*values() {
				for (const [, value] of this.entries()) {
					yield value;
				}
			},
			*keys() {
				for (const [key] of this.entries()) {
					yield key;
				}
			},
		};
	})();
	map<U>(f: MapFn<T, TKey, U>): IObject<U, TKey> {
		return new MapIterator(this, f);
	}
	*each(f: EachFn<T, TKey>): Generator {
		for (const [key, value] of this.iterators.entries()) {
			yield f(value, key);
		}
	}
	filter(f: FilterFn<T, TKey>): IObject<T, TKey> {
		return new FilterIterator(this, f);
	}
	omitBy(f: FilterFn<T, TKey>): IObject<T, TKey> {
		return this.filter(f);
	}
	merge<U, UKey extends ObjectKey>(keyedCollection: KeyedCollection<U, UKey>): IObject<T | U, TKey | UKey> {
		return new MergeIterator(this, keyedCollection) as IObject<T | U, TKey | UKey>;
	}
	*[Symbol.iterator](): Iterator<[TKey, T]> {
		yield* this.iterators.entries();
	}
}

class MapIterator<T, U, TKey extends ObjectKey> extends LazyObject<U, TKey> {
	constructor(parent: IObject<T, TKey>, private readonly fn: MapFn<T, TKey, U>) {
		super(parent as unknown as IObject<U, TKey>);
	}

	*[Symbol.iterator](): Iterator<[TKey, U]> {
		for (const [key, value] of this.iterators.entries()) {
			yield [key, this.fn(value as unknown as T, key)];
		}
	}
}

class FilterIterator<T, TKey extends ObjectKey> extends LazyObject<T, TKey> {
	constructor(parent: IObject<T, TKey>, private readonly fn: FilterFn<T, TKey>) {
		super(parent);
	}

	*[Symbol.iterator](): Iterator<[TKey, T]> {
		for (const [key, value] of this.iterators.entries()) {
			const mayYield = this.fn(value, key);
			if (mayYield) yield [key, value];
		}
	}
}

class MergeIterator<T, TKey extends ObjectKey, U, UKey extends ObjectKey> extends LazyObject<T | U, TKey | UKey> {
	constructor(private readonly parent: IObject<T, TKey>, keyedCollection: KeyedCollection<U, UKey>) {
		super(keyedCollection as unknown as IObject<T | U, TKey | UKey>);
	}

	*[Symbol.iterator](): Iterator<[TKey | UKey, T | U]> {
		yield* this.parent;
		yield* this.iterators.entries();
	}
}
