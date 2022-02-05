type MapFn<T, U> = (t: T) => U;
type FilterFn<T> = (t: T) => boolean;

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
export class Lazy<T> implements ILazy {
	readonly #items: T[];
	readonly #fns: IteratorFunctionTuple<T, unknown>[] = [];

	static from<T>(array: T[]) {
		return new Lazy(array);
	}

	private constructor(array: T[]) {
		this.#items = array;
	}

	map<U>(fn: MapFn<T, U>): Lazy<U> {
		this.#fns.push([IteratorFunctionName.Map, fn]);
		return this.#cast();
	}

	filter(fn: FilterFn<T>): Lazy<T> {
		this.#fns.push([IteratorFunctionName.Filter, fn]);
		return this.#cast();
	}

	*[Symbol.iterator]() {
		item: for (let value of this.#items) {
			for (const [name, fn] of this.#fns) {
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
