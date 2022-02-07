import { ISet, SeedIterable, MapFn, FilterFn, FlatMapFn, EachFn } from "./abstract";
import { getAsValues } from "./iterable";

export class LazySet<T> implements ISet<T> {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	constructor(private readonly seed: SeedIterable<T, any | never>) {}
	collect(): Set<T> {
		return new Set([...this]);
	}
	private get iterable(): Iterable<T> {
		return getAsValues(this.seed);
	}
	iterators: { values(): IterableIterator<T> } = (() => {
		const set = new Set<T>();
		const getIterable = () => this.iterable;
		return {
			*values() {
				for (const value of getIterable()) {
					if (set.has(value)) continue;
					set.add(value);
					yield value;
				}
			},
		};
	})();
	map<U>(f: MapFn<T, never, U>): ISet<U> {
		return new MapIterator(this, f);
	}
	*each(f: EachFn<T, never>): Generator {
		for (const value of this.iterators.values()) {
			yield f(value, undefined as never);
		}
	}
	filter(f: FilterFn<T, never>): ISet<T> {
		return new FilterIterator(this, f);
	}
	flatten(): T extends (infer U)[] ? ISet<U> : ISet<T> {
		return new FlattenIterator(this) as unknown as T extends (infer U)[] ? ISet<U> : ISet<T>;
	}
	flatMap<U>(f: FlatMapFn<T, never, U>): ISet<U> {
		return this.map(f).flatten() as ISet<U>;
	}
	concat(iterable: SeedIterable<T, never>): ISet<T> {
		return new ConcatIterator(this, iterable);
	}
	append(item: T): ISet<T> {
		return this.concat([item]);
	}
	*[Symbol.iterator]() {
		yield* this.iterators.values();
	}
}

class MapIterator<T, U> extends LazySet<U> {
	constructor(parent: ISet<T>, private readonly fn: MapFn<T, never, U>) {
		super(parent as unknown as ISet<U>);
	}

	*[Symbol.iterator]() {
		for (const value of this.iterators.values()) {
			yield this.fn(value as unknown as T, undefined as never);
		}
	}
}

class FilterIterator<T> extends LazySet<T> {
	constructor(parent: ISet<T>, private readonly fn: FilterFn<T, never>) {
		super(parent);
	}

	*[Symbol.iterator]() {
		for (const value of this.iterators.values()) {
			const mayYield = this.fn(value, undefined as never);
			if (mayYield) yield value;
		}
	}
}

class FlattenIterator<T> extends LazySet<T> {
	constructor(parent: ISet<T>) {
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

class ConcatIterator<T> extends LazySet<T> {
	constructor(private readonly parent: ISet<T>, concatValue: SeedIterable<T, never>) {
		super(concatValue);
	}

	*[Symbol.iterator]() {
		yield* this.parent;
		yield* this.iterators.values();
	}
}
