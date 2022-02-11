import { AnyNode } from "../traverse";
import {
	ILazyArray,
	MapFn,
	FilterFn,
	FlatMapFn,
	SeedIterable,
	EachFn,
	Type,
	DeepCollected,
	FlattenedArray,
	ReduceFn,
	ReduceFnRT,
	ObjectKey,
} from "./abstract";
import hasType from "./hasType";
import { getEntries, rCollectDeep } from "./iterable";
import iterator from "./iterator";
import { LazyObject } from "./object";
import { LazySet } from "./set";
import { LazyValue } from "./value";

export class LazyArray<T> implements ILazyArray<T> {
	__type: Type.Array = Type.Array;
	constructor(private readonly seed: SeedIterable<T, number>) {}
	collect(): DeepCollected<T, Type.Array> {
		const iterated = [...this];
		const collected = iterated.map((item) => {
			return rCollectDeep(item as unknown as AnyNode);
		}) as DeepCollected<T, Type.Array>;
		return collected;
	}
	iterators: { values(): IterableIterator<T>; indices(): IterableIterator<number>; entries(): IterableIterator<[number, T]> } = (() => {
		const getIterable = () => getEntries(this.seed);
		return {
			*values() {
				for (const [, value] of this.entries()) {
					yield value;
				}
			},
			*indices() {
				for (const [index] of this.entries()) {
					yield index;
				}
			},
			*entries() {
				yield* getIterable();
			},
		};
	})();
	map<U>(f: MapFn<T, number, U>): ILazyArray<U> {
		return new MapIterator(this, f);
	}
	*each(f: EachFn<T, number>): Generator {
		for (const [index, value] of this.iterators.entries()) {
			yield f(value, index);
		}
	}
	filter(f: FilterFn<T, number>): ILazyArray<T> {
		return new FilterIterator(this, f);
	}
	flatten(): FlattenedArray<T> {
		return new FlattenIterator(this) as unknown as FlattenedArray<T>;
	}
	flatMap<U>(f: FlatMapFn<T, number, U>): ILazyArray<U> {
		return this.map(f).flatten() as ILazyArray<U>;
	}
	concat(iterable: SeedIterable<T, number>): ILazyArray<T> {
		return new ConcatIterator(this, iterable);
	}
	append(item: T): ILazyArray<T> {
		return this.concat([item]);
	}
	static cast<T>(item: T | ILazyArray<T> | T[]): ILazyArray<T> {
		if (hasType.lazyArray<T>(item)) return item;
		return new LazyArray(Array.isArray(item) ? item : [item as T]);
	}
	*[Symbol.iterator](): Iterator<T> {
		yield* this.iterators.values();
	}
	values(): ILazyArray<T> {
		return this;
	}
	reduce<UAccumulator>(f: ReduceFn<T, UAccumulator>, startingValue: UAccumulator): ReduceFnRT<UAccumulator> {
		const iterator = (() => {
			if (hasType.lazyArray(startingValue) || Array.isArray(startingValue)) return new ArrayReduceIterator(this, f, startingValue);
			if (hasType.lazySet(startingValue) || startingValue instanceof Set) return new SetReduceIterator(this, f, startingValue);
			if (hasType.lazyObject(startingValue) || (typeof startingValue === "object" && startingValue !== null))
				return new ObjectReduceIterator(this, f, startingValue);
			return new ValueReduceIterator(this, f, startingValue);
		})();
		return iterator as never as ReduceFnRT<UAccumulator>;
	}
}

class MapIterator<T, U> extends LazyArray<U> {
	constructor(parent: ILazyArray<T>, private readonly fn: MapFn<T, number, U>) {
		super(parent as unknown as ILazyArray<U>);
	}

	*[Symbol.iterator]() {
		for (const [index, value] of this.iterators.entries()) {
			yield this.fn(value as unknown as T, index);
		}
	}
}

class FilterIterator<T> extends LazyArray<T> {
	constructor(parent: ILazyArray<T>, private readonly fn: FilterFn<T, number>) {
		super(parent);
	}

	*[Symbol.iterator]() {
		for (const [index, value] of this.iterators.entries()) {
			const mayYield = this.fn(value, index);
			if (mayYield) yield value;
		}
	}
}

class FlattenIterator<T> extends LazyArray<T> {
	constructor(parent: ILazyArray<T>) {
		super(parent);
	}

	[Symbol.iterator](): Generator<T> {
		return iterator.flatten<T>(this);
	}
}

class ConcatIterator<T> extends LazyArray<T> {
	constructor(private readonly parent: ILazyArray<T>, concatValue: SeedIterable<T, number>) {
		super(concatValue);
	}

	*[Symbol.iterator]() {
		yield* this.parent;
		yield* this.iterators.values();
	}
}

const reduce = <T, UAccumulator>(parent: ILazyArray<T>, fn: ReduceFn<T, UAccumulator>, startingValue: UAccumulator) => {
	let accumulator = startingValue;
	for (const [index, value] of parent.iterators.entries()) {
		accumulator = fn(accumulator, value, index);
	}
	return accumulator;
};

class ArrayReduceIterator<T, UAccumulator> extends LazyArray<T> {
	constructor(
		private readonly parent: ILazyArray<T>,
		private readonly fn: ReduceFn<T, UAccumulator>,
		private readonly startingValue: UAccumulator
	) {
		super(undefined as never);
	}

	*[Symbol.iterator]() {
		yield* new LazyArray(reduce(this.parent, this.fn, this.startingValue) as never) as never as LazyArray<T>;
	}
}

class SetReduceIterator<T, UAccumulator> extends LazySet<T> {
	constructor(
		private readonly parent: ILazyArray<T>,
		private readonly fn: ReduceFn<T, UAccumulator>,
		private readonly startingValue: UAccumulator
	) {
		super(undefined as never);
	}

	*[Symbol.iterator]() {
		yield* new LazySet(reduce(this.parent, this.fn, this.startingValue) as never) as LazySet<T>;
	}
}

class ObjectReduceIterator<T, UAccumulator, TKey extends ObjectKey = never> extends LazyObject<T, TKey> {
	constructor(
		private readonly parent: ILazyArray<T>,
		private readonly fn: ReduceFn<T, UAccumulator>,
		private readonly startingValue: UAccumulator
	) {
		super(undefined as never);
	}

	*[Symbol.iterator]() {
		yield* new LazyObject(reduce(this.parent, this.fn, this.startingValue) as never) as never as LazyObject<T, TKey>;
	}
}

class ValueReduceIterator<T, UAccumulator> extends LazyValue<T> {
	constructor(
		private readonly parent: ILazyArray<T>,
		private readonly fn: ReduceFn<T, UAccumulator>,
		private readonly startingValue: UAccumulator
	) {
		super(undefined as never);
	}

	*[Symbol.iterator]() {
		yield* new LazyValue(reduce(this.parent, this.fn, this.startingValue)) as never as LazyValue<T>;
	}
}
