export type MapFn<T, TIndex, U> = (t: T, index: TIndex) => U;
export type FilterFn<T, TIndex> = (t: T, index: TIndex) => boolean;
export type FlatMapFn<T, TIndex, U> = (t: T, index: TIndex) => U | U[];
export type EachFn<T, TIndex> = (t: T, index: TIndex) => unknown | void | Promise<unknown> | Promise<void>;

export type ObjectKey = string | symbol | number;

export type ObjectKeyedIterable<T, TKey extends ObjectKey> = IObject<T, TKey> | Map<TKey, T> | Record<TKey, T>;
export type SimpleKeyedIterable<T> = ISet<T> | IArray<T> | T[] | Set<T>;
export type SeedIterable<T, TKey extends ObjectKey> = SimpleKeyedIterable<T> | ObjectKeyedIterable<T, TKey>;

export interface ISet<T> extends Iterable<T> {
	collect(): Set<T>;
	iterators: {
		values(): IterableIterator<T>;
	};

	map<U>(f: MapFn<T, never, U>): ISet<U>;
	each(f: EachFn<T, never>): Generator;
	filter(f: FilterFn<T, never>): ISet<T>;
	flatten(): T extends (infer U)[] ? ISet<U> : ISet<T>;
	flatMap<U>(f: FlatMapFn<T, never, U>): ISet<U>;
	concat(iterable: SeedIterable<T, never>): ISet<T>;
	append(item: T): ISet<T>;
}
export interface IObject<T, TKey extends ObjectKey> extends Iterable<[TKey, T]> {
	collect(): Record<TKey, T>;
	iterators: {
		values(): IterableIterator<T>;
		keys(): IterableIterator<TKey>;
		entries(): IterableIterator<[TKey, T]>;
	};

	map<U>(f: MapFn<T, TKey, U>): IObject<U, TKey>;
	each(f: EachFn<T, TKey>): Generator;

	filter(f: FilterFn<T, TKey>): IObject<T, TKey>;
	omitBy(f: FilterFn<T, TKey>): IObject<T, TKey>;

	merge<U, UKey extends ObjectKey>(keyedCollection: ObjectKeyedIterable<U, UKey> | U[] | IArray<U>): IObject<U | T, UKey | TKey>;
}
export interface IArray<T> extends Iterable<T> {
	collect(): T[];
	iterators: {
		values(): IterableIterator<T>;
		indices(): IterableIterator<number>;
		entries(): IterableIterator<[number, T]>;
	};

	map<U>(f: MapFn<T, number, U>): IArray<U>;
	each(f: EachFn<T, number>): Generator;
	filter(f: FilterFn<T, number>): IArray<T>;
	flatten(): T extends (infer U)[] ? IArray<U> : IArray<T>;
	flatMap<U>(f: FlatMapFn<T, number, U>): IArray<U>;
	concat(iterable: SeedIterable<T, number>): IArray<T>;
	append(item: T): IArray<T>;
}
