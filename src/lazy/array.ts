import { IArray, MapFn, FilterFn, FlatMapFn, SeedIterable, EachFn } from "./abstract";
import { getAsValues } from "./iterable";

export class LazyArray<T> implements IArray<T> {
	constructor(private readonly seed: SeedIterable<T, number>) {}
	collect(): T[] {
		return [...this];
	}
	private get iterable(): Iterable<T> {
		return getAsValues(this.seed);
	}
	iterators: { values(): IterableIterator<T>; indices(): IterableIterator<number>; entries(): IterableIterator<[number, T]> } = (() => {
		const getIterable = () => this.iterable;
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
				let index = 0;
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				for (const value of getIterable()) {
					yield [index, value];
					index += 1;
				}
			},
		};
	})();
	map<U>(f: MapFn<T, number, U>): IArray<U> {
		return new MapIterator(this, f);
	}
	*each(f: EachFn<T, number>): Generator {
		for (const [index, value] of this.iterators.entries()) {
			yield f(value, index);
		}
	}
	filter(f: FilterFn<T, number>): IArray<T> {
		return new FilterIterator(this, f);
	}
	flatten(): T extends (infer U)[] ? IArray<U> : IArray<T> {
		return new FlattenIterator(this) as unknown as T extends (infer U)[] ? IArray<U> : IArray<T>;
	}
	flatMap<U>(f: FlatMapFn<T, number, U>): IArray<U> {
		return this.map(f).flatten() as IArray<U>;
	}
	concat(iterable: SeedIterable<T, number>): IArray<T> {
		return new ConcatIterator(this, iterable);
	}
	append(item: T): IArray<T> {
		return this.concat([item]);
	}
	*[Symbol.iterator](): Iterator<T> {
		yield* this.iterators.values();
	}
}

class MapIterator<T, U> extends LazyArray<U> {
	constructor(parent: IArray<T>, private readonly fn: MapFn<T, number, U>) {
		super(parent as unknown as IArray<U>);
	}

	*[Symbol.iterator]() {
		for (const [index, value] of this.iterators.entries()) {
			yield this.fn(value as unknown as T, index);
		}
	}
}

class FilterIterator<T> extends LazyArray<T> {
	constructor(parent: IArray<T>, private readonly fn: FilterFn<T, number>) {
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
	constructor(parent: IArray<T>) {
		super(parent);
	}

	*[Symbol.iterator]() {
		for (const value of this.iterators.values()) {
			if (Array.isArray(value)) {
				yield* value;
			} else {
				yield value;
			}
		}
	}
}

class ConcatIterator<T> extends LazyArray<T> {
	constructor(private readonly parent: IArray<T>, concatValue: SeedIterable<T, number>) {
		super(concatValue);
	}

	*[Symbol.iterator]() {
		yield* this.parent;
		yield* this.iterators.values();
	}
}
