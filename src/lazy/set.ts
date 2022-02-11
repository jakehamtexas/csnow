import { AnyNode } from "../traverse";
import { ILazySet, SeedIterable, MapFn, FilterFn, FlatMapFn, EachFn, Type, DeepCollected, FlattenedSet, ILazyArray } from "./abstract";
import { LazyArray } from "./array";
import { getEntries, rCollectDeep } from "./iterable";
import iterator from "./iterator";

export class LazySet<T> implements ILazySet<T> {
	__type: Type.Set = Type.Set;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	constructor(private readonly seed: SeedIterable<T, any | never>) {}

	collect(): DeepCollected<T, Type.Set> {
		return new Set([...this].map((item) => rCollectDeep(item as unknown as AnyNode))) as DeepCollected<T, Type.Set>;
	}

	iterators: { values(): IterableIterator<T> } = (() => {
		const getIterable = () => getEntries(this.seed);
		return {
			*values() {
				const set = new Set<T>();
				for (const [, value] of getIterable()) {
					if (set.has(value)) continue;
					set.add(value);
					yield value;
				}
			},
		};
	})();

	map<U>(f: MapFn<T, never, U>): ILazySet<U> {
		return new MapIterator(this, f);
	}

	*each(f: EachFn<T, never>): Generator {
		for (const value of this.iterators.values()) {
			yield f(value, undefined as never);
		}
	}

	filter(f: FilterFn<T, never>): ILazySet<T> {
		return new FilterIterator(this, f);
	}

	flatten(): FlattenedSet<T> {
		return new FlattenIterator(this) as unknown as FlattenedSet<T>;
	}

	flatMap<U>(f: FlatMapFn<T, never, U>): ILazySet<U> {
		return this.map(f).flatten() as ILazySet<U>;
	}

	concat(iterable: SeedIterable<T, never>): ILazySet<T> {
		return new ConcatIterator(this, iterable);
	}

	append(item: T): ILazySet<T> {
		return this.concat([item]);
	}

	*[Symbol.iterator]() {
		yield* this.iterators.values();
	}

	values(): ILazyArray<T> {
		return new LazyArray(this.iterators.values());
	}
}

class MapIterator<T, U> extends LazySet<U> {
	constructor(parent: ILazySet<T>, private readonly fn: MapFn<T, never, U>) {
		super(parent as unknown as ILazySet<U>);
	}

	*[Symbol.iterator]() {
		for (const value of this.iterators.values()) {
			yield this.fn(value as unknown as T, undefined as never);
		}
	}
}

class FilterIterator<T> extends LazySet<T> {
	constructor(parent: ILazySet<T>, private readonly fn: FilterFn<T, never>) {
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
	constructor(parent: ILazySet<T>) {
		super(parent);
	}

	[Symbol.iterator](): Generator<T> {
		return iterator.flatten<T>(this);
	}
}

class ConcatIterator<T> extends LazySet<T> {
	constructor(private readonly parent: ILazySet<T>, concatValue: SeedIterable<T, never>) {
		super(concatValue);
	}

	*[Symbol.iterator]() {
		yield* this.parent;
		yield* this.iterators.values();
	}
}
