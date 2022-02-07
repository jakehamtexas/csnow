import { ILazyValue, Type } from "./abstract";

export class LazyValue<T> implements ILazyValue<T> {
	constructor(private readonly value: T) {}
	collect(): T {
		throw new Error("Method not implemented.");
	}
	collectDeep(): T {
		throw new Error("Method not implemented.");
	}
	__type: Type.Value = Type.Value;
	*[Symbol.iterator]() {
		yield this.value;
	}
}
