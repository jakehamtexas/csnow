type MapFn<T, U> = (t: T) => U;

enum IteratorFunctionName {
	Map = "map",
}
type _IteratorFunction<TKey extends IteratorFunctionName, T, U> = TKey extends IteratorFunctionName.Map ? MapFn<T, U> : never;
type IteratorFunction<T, U = never> = {
	[K in IteratorFunctionName]: _IteratorFunction<K, T, U>;
};
type _IteratorFunctionTuple<T, U = never, TKey extends keyof IteratorFunction<T, U> = keyof IteratorFunction<T, U>> = [
	TKey,
	IteratorFunction<T, U>[TKey]
];
type IteratorFunctionTuple<T, U = never> = _IteratorFunctionTuple<T, U>;
export class Lazy<T> {
	private readonly items: T[];

	static from<T>(array: T[]) {
		return new Lazy(array);
	}
	private constructor(array: T[], private readonly fns: IteratorFunctionTuple<T, unknown>[] = []) {
		this.items = array;
	}
	map<U>(fn: MapFn<T, U>): Lazy<U> {
		this.fns.push([IteratorFunctionName.Map, fn]);
		return new Lazy<U>(this.items as never, this.fns as never);
	}

	*[Symbol.iterator]() {
		for (let value of this.items) {
			for (const [name, fn] of this.fns) {
				switch (name) {
					case IteratorFunctionName.Map:
						value = fn(value) as T;
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
}

const lazy = Lazy.from(["foo"]);
