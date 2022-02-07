import { AnyNode } from "../traverse";
import { DeepCollected, EachFn, FilterFn, ILazyArray, ILazyObject, Type, MapFn, ObjectKey, ObjectKeyedIterable } from "./abstract";
import { LazyArray } from "./array";
import { getEntries, rCollectDeep } from "./iterable";

export type KeyedCollection<T, TKey extends ObjectKey> = ObjectKeyedIterable<T, TKey> | T[] | ILazyArray<T>;

export class LazyObject<T, TKey extends ObjectKey> implements ILazyObject<T, TKey> {
	__type: Type.Object = Type.Object;
	constructor(private readonly seed: KeyedCollection<T, TKey>) {}
	collect(): DeepCollected<T, Type.Object, TKey> {
		return Object.fromEntries([...this].map(([key, value]) => [key, rCollectDeep(value as unknown as AnyNode)])) as DeepCollected<
			T,
			Type.Object,
			TKey
		>;
	}
	iterators: { values(): IterableIterator<T>; keys(): IterableIterator<TKey>; entries(): IterableIterator<[TKey, T]> } = (() => {
		const getIterable = () => getEntries(this.seed);
		return {
			*entries() {
				const keys = new Set<TKey>();
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
	map<U>(f: MapFn<T, TKey, U>): ILazyObject<U, TKey> {
		return new MapIterator(this, f);
	}
	*each(f: EachFn<T, TKey>): Generator {
		for (const [key, value] of this.iterators.entries()) {
			yield f(value, key);
		}
	}
	filter(f: FilterFn<T, TKey>): ILazyObject<T, TKey> {
		return new FilterIterator(this, f);
	}
	omitBy(f: FilterFn<T, TKey>): ILazyObject<T, TKey> {
		return this.filter(f);
	}
	merge<U, UKey extends ObjectKey>(keyedCollection: KeyedCollection<U, UKey>): ILazyObject<T | U, TKey | UKey> {
		return new MergeIterator(this, keyedCollection) as ILazyObject<T | U, TKey | UKey>;
	}
	*[Symbol.iterator](): Iterator<[TKey, T]> {
		yield* this.iterators.entries();
	}
	values(): ILazyArray<T> {
		return new LazyArray(this.iterators.values());
	}
	keys(): ILazyArray<TKey> {
		return new LazyArray(this.iterators.keys());
	}
	entries(): ILazyArray<[TKey, T]> {
		return new LazyArray(this.iterators.entries());
	}
}

class MapIterator<T, U, TKey extends ObjectKey> extends LazyObject<U, TKey> {
	constructor(parent: ILazyObject<T, TKey>, private readonly fn: MapFn<T, TKey, U>) {
		super(parent as unknown as ILazyObject<U, TKey>);
	}

	*[Symbol.iterator](): Iterator<[TKey, U]> {
		for (const [key, value] of this.iterators.entries()) {
			yield [key, this.fn(value as unknown as T, key)];
		}
	}
}

class FilterIterator<T, TKey extends ObjectKey> extends LazyObject<T, TKey> {
	constructor(parent: ILazyObject<T, TKey>, private readonly fn: FilterFn<T, TKey>) {
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
	constructor(private readonly parent: ILazyObject<T, TKey>, keyedCollection: KeyedCollection<U, UKey>) {
		super(keyedCollection as unknown as ILazyObject<T | U, TKey | UKey>);
	}

	*[Symbol.iterator](): Iterator<[TKey | UKey, T | U]> {
		yield* this.parent;
		yield* this.iterators.entries();
	}
}
