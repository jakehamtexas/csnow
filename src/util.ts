// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyArray = readonly any[] | any[];

export function* flattenGenerator<T extends AnyArray>(arr: T[]): Generator<T> {
	function* rFlatten(array: AnyArray, deep = false): Generator<T> {
		for (const item of array) {
			if (Array.isArray(item) && deep) {
				yield* rFlatten(item);
			} else {
				yield item;
			}
		}
	}
	yield* rFlatten(arr, true);
}
