type MapFn<T, U> = (t: T) => U;
type FilterFn<T> = (t: T) => boolean;
type FlatMapFn<T, U> = (t: T) => U | U[];

enum IteratorFunctionName {
	Map = "map",
	Filter = "filter",
}
const Iterators = {
	[IteratorFunctionName.Map]: <T, U>(v: T, fn: MapFn<T, U>) => ({ result: fn(v), action: IteratorAction.YieldResult }),
	[IteratorFunctionName.Filter]: <T>(v: T, fn: FilterFn<T>) => ({
		result: v,
		action: fn(v) ? IteratorAction.YieldResult : IteratorAction.SkipResult,
	}),
} as const;

type IteratorFn<TKey extends IteratorFunctionName> = Parameters<typeof Iterators[TKey]>[1];

type _IteratorFunction<TKey extends IteratorFunctionName, T, U> = TKey extends IteratorFunctionName.Map
	? MapFn<T, U>
	: TKey extends IteratorFunctionName.Filter
	? FilterFn<T>
	: never;
type IteratorFunction<T, U = never> = {
	[K in IteratorFunctionName]: _IteratorFunction<K, T, U>;
};
type _IteratorFunctionTuple<T, U = never, TKey extends IteratorFunctionName = IteratorFunctionName> = [TKey, IteratorFunction<T, U>[TKey]];
type IteratorFunctionTuple<T, U = never> = _IteratorFunctionTuple<T, U>;

enum IteratorAction {
	YieldResult = "yield-result",
	SkipResult = "skip-result",
	ShortCircuitStopIteration = "short-circuit-stop-iteration",
}
type IteratorHandler = {
	[K in IteratorFunctionName]: <T>(value: T, fn: typeof Iterators[K]) => { result: unknown; action: IteratorAction };
};

type ILazy = {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	[K in IteratorFunctionName]: (fn: IteratorFn<K>) => Lazy<any>;
};

function* iterate<T>(items: Iterable<T>, fns: IteratorFunctionTuple<T, unknown>[]) {
	item: for (let value of items) {
		for (const [name, fn] of fns) {
			const strategy = Iterators[name] as IteratorHandler[typeof name];
			const { result, action } = strategy(value, fn as never);
			value = result as never;
			switch (action) {
				case IteratorAction.YieldResult:
					break;
				case IteratorAction.SkipResult:
					continue item;
				case IteratorAction.ShortCircuitStopIteration:
					return;
			}
		}
		yield value;
	}
}

export abstract class Lazy<T> implements ILazy {
	readonly #iterable: Iterable<T>;
	protected readonly fns: IteratorFunctionTuple<T, unknown>[] = [];

	protected abstract readonly filterIterable: (iterable: Iterable<T>) => Iterable<T>;

	get items(): Iterable<T> {
		return this.filterIterable(this.#iterable);
	}

	static from<T>(iterable: Iterable<T>) {
		return new LazyArray(iterable);
	}

	static set<T>(iterable: Iterable<T>) {
		return new LazySet(iterable);
	}

	protected constructor(iterator: Iterable<T>) {
		this.#iterable = iterator;
	}

	map<U>(fn: MapFn<T, U>): Lazy<U> {
		this.fns.push([IteratorFunctionName.Map, fn]);
		return this.#cast();
	}

	filter(fn: FilterFn<T>): Lazy<T> {
		this.fns.push([IteratorFunctionName.Filter, fn]);
		return this.#cast();
	}

	concat(iterable: Iterable<T>): Lazy<T> {
		return new ConcatLazy(this, iterable, this.filterIterable);
	}

	flatten(): T extends (infer U)[] ? Lazy<U> : Lazy<T> {
		return new FlattenLazy(this, this.filterIterable) as unknown as T extends (infer U)[] ? Lazy<U> : Lazy<T>;
	}

	flatMap<U>(fn: FlatMapFn<T, U>): Lazy<U> {
		return this.map(fn as never)
			.flatten()
			.#cast();
	}

	push(item: T): this {
		return this.concat([item]) as unknown as this;
	}

	*[Symbol.iterator]() {
		yield* iterate(this.items, this.fns);
	}

	*each(fn: (t: T) => unknown | void | Promise<unknown> | Promise<void>) {
		for (const item of this[Symbol.iterator]()) {
			yield fn(item);
		}
	}

	collect() {
		return [...this];
	}

	#cast<U>(): Lazy<U> {
		return this as unknown as Lazy<U>;
	}
}

export class LazyArray<T> extends Lazy<T> {
	protected readonly filterIterable: (iterable: Iterable<T>) => Iterable<T> = (iterable) => iterable;
}

export class ConcatLazy<T> extends Lazy<T> {
	readonly #parent: Lazy<T>;
	constructor(parent: Lazy<T>, iterable: Iterable<T>, protected readonly filterIterable: (iterable: Iterable<T>) => Iterable<T>) {
		super(iterable);
		this.#parent = parent;
		this.filterIterable = filterIterable;
	}

	*[Symbol.iterator]() {
		for (const item of this.#parent) {
			yield* iterate([item], this.fns);
		}
		yield* iterate(this.items, this.fns);
	}
}

export class FlattenLazy<T> extends Lazy<T> {
	readonly #parent: Lazy<T>;
	constructor(parent: Lazy<T>, protected readonly filterIterable: (iterable: Iterable<T>) => Iterable<T>) {
		super([]);
		this.#parent = parent;
	}

	*[Symbol.iterator]() {
		for (const value of this.#parent) {
			if (Array.isArray(value)) {
				yield* iterate(value, this.fns);
			} else {
				yield* iterate([value], this.fns);
			}
		}
	}
}

export class LazySet<T> extends Lazy<T> {
	protected readonly filterIterable: (iterable: Iterable<T>) => Iterable<T> = (() => {
		const set = new Set<T>();
		return function* (iterable: Iterable<T>) {
			for (const item of iterable) {
				if (set.has(item)) continue;
				set.add(item);
				yield item;
			}
		};
	})();
}
