import { IAnyLazy } from ".";
import { Type, ObjectKey, ILazySet, ILazyArray, ILazyObject, ILazyValue } from "./abstract";

type SelectLazy<TType extends Type, T, TKey extends ObjectKey = never> = TType extends Type.Array
	? ILazyArray<T>
	: TType extends Type.Object
	? ILazyObject<T, TKey>
	: TType extends Type.Set
	? ILazySet<T>
	: TType extends Type.Value
	? ILazyValue<T>
	: never;

type SelectBuiltIn<TType extends Type, T, TKey extends ObjectKey = never> = TType extends Type.Array
	? T[]
	: TType extends Type.Object
	? Record<TKey, T>
	: TType extends Type.Set
	? Set<T>
	: TType extends Type.Value
	? T
	: never;

type HasTypeFn<K extends Type, TLazy extends 1 | 0 = 1> = TLazy extends 1
	? <T = never, TKey extends ObjectKey = never>(maybe: unknown) => maybe is SelectLazy<K, T, TKey>
	: <T = never, TKey extends ObjectKey = never>(maybe: unknown) => maybe is SelectBuiltIn<K, T, TKey>;
type HasType = {
	[K in Type as `lazy${K}`]: HasTypeFn<K>;
} & {
	lazy: HasTypeFn<Type>;
} & {
	[K in Type as `${Lowercase<K>}`]: HasTypeFn<K, 0>;
};

const hasLazyTypeBy =
	<TType extends Type>(type: TType) =>
	<T = never, TKey extends ObjectKey = never>(maybe: unknown): maybe is SelectLazy<TType, T, TKey> =>
		typeof maybe === "object" && maybe !== null && "__type" in maybe && (maybe as ILazySet<never>).__type === type;

const isLazy = <T = never, TKey extends ObjectKey = never>(maybe: unknown): maybe is IAnyLazy<T, TKey> =>
	Object.values(Type).some((type) => hasLazyTypeBy(type)(maybe));

function hasBuiltInTypeBy<TType extends Type>(type: TType) {
	return <T = never, TKey extends ObjectKey = never>(maybe: unknown): maybe is SelectBuiltIn<TType, T, TKey> => {
		switch (type) {
			case Type.Array:
				return maybe instanceof Array;
			case Type.Set:
				return maybe instanceof Set;
			case Type.Object:
				return typeof maybe === "object" && maybe !== null;
			case Type.Value:
				return ![hasBuiltInTypeBy(Type.Array), hasBuiltInTypeBy(Type.Object), hasBuiltInTypeBy(Type.Set)].some((fn) => fn(maybe));
			default:
				throw new Error("Unreachable!");
		}
	};
}

const hasType: HasType = {
	lazyArray: hasLazyTypeBy(Type.Array),
	lazySet: hasLazyTypeBy(Type.Set),
	lazyObject: hasLazyTypeBy(Type.Object),
	lazyValue: hasLazyTypeBy(Type.Value),
	lazy: isLazy,
	array: hasBuiltInTypeBy(Type.Array),
	set: hasBuiltInTypeBy(Type.Set),
	object: hasBuiltInTypeBy(Type.Object),
	value: hasBuiltInTypeBy(Type.Value),
};

export default hasType;
