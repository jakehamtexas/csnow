import { AnyNode } from "../traverse";
import { DeepCollected, ILazyValue, Type } from "./abstract";
import { rCollectDeep } from "./iterable";

export class LazyValue<T> implements ILazyValue<T> {
	constructor(private readonly value: T) {}
	collect(): DeepCollected<T, Type.Value> {
		return [...this].map((item) => rCollectDeep(item as unknown as AnyNode))[0] as DeepCollected<T, Type.Value>;
	}
	__type: Type.Value = Type.Value;
	*[Symbol.iterator]() {
		yield this.value;
	}
}
