/* eslint-disable @typescript-eslint/no-unused-vars */
export type SelectArray<T, TLazy extends 1 | 0> = TLazy extends 1 ? ILazyArray<T> : ILazyArray<T>;

export type MapFn<T, TIndex, U> = (t: T, index: TIndex) => U;
export type FilterFn<T, TIndex> = (t: T, index: TIndex) => boolean;
export type FlatMapFnRT<T, TLazy extends 1 | 0> = T | T[] | ILazySet<T> | SelectArray<T, TLazy> | Set<T>;
export type FlatMapFn<T, TIndex, U, TLazy extends 1 | 0 = 0> = (t: T, index: TIndex) => FlatMapFnRT<U, TLazy>;
export type EachFn<T, TIndex> = (t: T, index: TIndex) => unknown | void | Promise<unknown> | Promise<void>;

export type ObjectKey = string | symbol | number;

export type ObjectKeyedIterable<T, TKey extends ObjectKey> = ILazyObject<T, TKey> | Map<TKey, T> | Record<TKey, T>;
export type SimpleKeyedIterable<T> = ILazySet<T> | ILazyArray<T> | T[] | Set<T> | Iterable<T>;
export type SeedIterable<T, TKey extends ObjectKey> = SimpleKeyedIterable<T> | ObjectKeyedIterable<T, TKey>;

export type IKeyedLazy<T, TKey extends ObjectKey> = ILazyObject<T, TKey> | ILazyArray<T>;
export type IAnyLazy<T, TKey extends ObjectKey = never> = IKeyedLazy<T, TKey> | ILazySet<T> | ILazyValue<T>;

export type SelectCollected<T, TType extends Type, TKey extends ObjectKey = never> = TType extends Type.Set
	? Set<T>
	: TType extends Type.Array
	? // ? ICollectedArray<T>
	  T[]
	: TType extends Type.Object
	? Record<TKey, T>
	: TType extends Type.Value
	? T
	: never;
export type DeepCollected<T, TType extends Type, TKey extends ObjectKey = never> = T extends ILazySet<infer U>
	? SelectCollected<DeepCollected<U, Type.Set>, Type.Set>
	: T extends ILazyArray<infer U>
	? SelectCollected<DeepCollected<U, Type.Array>, Type.Array>
	: T extends ILazyObject<infer U, infer UKey>
	? SelectCollected<DeepCollected<U, Type.Object, UKey>, Type.Object, UKey>
	: SelectCollected<T, TType, TKey>;

export enum Type {
	Set = "Set",
	Object = "Object",
	Array = "Array",
	Value = "Value",
}
export type FlattenedSet<T> = T extends (infer U)[]
	? ILazySet<U>
	: T extends Set<infer U>
	? ILazySet<U>
	: T extends ILazyArray<infer U>
	? ILazySet<U>
	: T extends ILazySet<infer U>
	? ILazySet<U>
	: ILazySet<T>;

export interface HasValuesIterator<T> {
	iterators: {
		values(): IterableIterator<T>;
	};
}
export interface IterableWithType<TIterable, TType extends Type> extends Iterable<TIterable> {
	__type: TType;
}
export interface HasValues<TValue> {
	values(): ILazyArray<TValue>;
}
export interface ILazySet<T> extends HasValuesIterator<T>, IterableWithType<T, Type.Set>, HasValues<T> {
	collect(): DeepCollected<T, Type.Set>;

	map<U>(f: MapFn<T, never, U>): ILazySet<U>;
	each(f: EachFn<T, never>): Generator;
	filter(f: FilterFn<T, never>): ILazySet<T>;
	flatten(): FlattenedSet<T>;
	flatMap<U>(f: FlatMapFn<T, never, U>): ILazySet<U>;
	concat(iterable: SeedIterable<T, never>): ILazySet<T>;
	append(item: T): ILazySet<T>;
}

export interface ILazyObject<T, TKey extends ObjectKey>
	extends Iterable<[TKey, T]>,
		HasValuesIterator<T>,
		IterableWithType<[TKey, T], Type.Object>,
		HasValues<T> {
	collect(): DeepCollected<T, Type.Object, TKey>;

	iterators: {
		values(): IterableIterator<T>;
		keys(): IterableIterator<TKey>;
		entries(): IterableIterator<[TKey, T]>;
	};

	map<U>(f: MapFn<T, TKey, U>): ILazyObject<U, TKey>;
	each(f: EachFn<T, TKey>): Generator;

	filter(f: FilterFn<T, TKey>): ILazyObject<T, TKey>;
	omitBy(f: FilterFn<T, TKey>): ILazyObject<T, TKey>;

	merge<U, UKey extends ObjectKey>(keyedCollection: ObjectKeyedIterable<U, UKey> | U[] | ILazyArray<U>): ILazyObject<U | T, UKey | TKey>;

	keys(): ILazyArray<TKey>;
	entries(): ILazyArray<[TKey, T]>;
}

export type FlattenedArray<T, TLazy extends 1 | 0 = 1> = T extends (infer U)[]
	? SelectArray<U, TLazy>
	: T extends Set<infer U>
	? SelectArray<U, TLazy>
	: T extends SelectArray<infer U, TLazy>
	? SelectArray<U, TLazy>
	: T extends ILazySet<infer U>
	? SelectArray<U, TLazy>
	: SelectArray<T, TLazy>;

export interface ILazyValue<T> extends IterableWithType<T, Type.Value> {
	collect(): T;
	collectDeep(): T;
}

export type ReduceFn<T, UAccumulator> = (accumulator: UAccumulator, current: T, index: number) => UAccumulator;
export type ReduceFnRT<UAccumulator, TLazy extends 1 | 0 = 1> = UAccumulator extends Record<infer UKey, infer U>
	? ILazyObject<U, UKey>
	: UAccumulator extends ILazyObject<infer U, infer UKey>
	? ILazyObject<U, UKey>
	: UAccumulator extends Set<infer U>
	? ILazySet<U>
	: UAccumulator extends ILazySet<infer U>
	? ILazySet<U>
	: UAccumulator extends (infer U)[]
	? SelectArray<U, TLazy>
	: UAccumulator extends ILazyArray<infer U>
	? SelectArray<U, TLazy>
	: ILazyValue<UAccumulator>;
export interface ILazyArray<T> extends HasValuesIterator<T>, IterableWithType<T, Type.Array>, HasValues<T> {
	collect(): DeepCollected<T, Type.Array>;

	iterators: {
		values(): IterableIterator<T>;
		indices(): IterableIterator<number>;
		entries(): IterableIterator<[number, T]>;
	};

	map<U>(f: MapFn<T, number, U>): ILazyArray<U>;
	each(f: EachFn<T, number>): Generator;
	filter(f: FilterFn<T, number>): ILazyArray<T>;
	flatten(): FlattenedArray<T>;
	flatMap<U>(f: FlatMapFn<T, number, U>): ILazyArray<U>;
	concat(iterable: SeedIterable<T, number>): ILazyArray<T>;
	append(item: T): ILazyArray<T>;
	reduce<UAccumulator>(f: ReduceFn<T, UAccumulator>, startingValue: UAccumulator): ReduceFnRT<UAccumulator>;
}
// type ZippedArray<T> =
// export interface ICollectedArray<T> extends HasValuesIterator<T>, IterableWithType<T, Type.Array> {
// 	collect(): ICollectedArray<T>;
// 	collectDeep(): DeepCollected<T, Type.Array>;

// 	iterators: {
// 		values(): IterableIterator<T>;
// 		indices(): IterableIterator<number>;
// 		entries(): IterableIterator<[number, T]>;
// 	};

// 	map<U>(f: MapFn<T, number, U>): ICollectedArray<U>;
// 	each(f: EachFn<T, number>): void;
// 	filter(f: FilterFn<T, number>): ICollectedArray<T>;
// 	flatten(): FlattenedArray<T, 0>;
// 	flatMap<U>(f: FlatMapFn<T, number, U, 0>): ICollectedArray<U>;
// 	concat(iterable: SeedIterable<T, number>): ICollectedArray<T>;
// 	append(item: T): ICollectedArray<T>;
// 	reduce<UAccumulator>(f: ReduceFn<T, UAccumulator>, startingValue: UAccumulator): ReduceFnRT<UAccumulator, 0>;
// 	values(): T[];
// }
