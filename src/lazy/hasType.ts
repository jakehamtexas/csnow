import { Type, ObjectKey, ILazySet, ILazyArray, ILazyObject, ILazyValue } from "./abstract";
import tb from "ts-toolbelt";

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

enum Selection {
	Lazy = "lazy",
	BuiltIn = "builtin",
	Both = "both",
}
type Select<TType extends Type, T, TKey extends ObjectKey, TSelection extends Selection> = TSelection extends Selection.Lazy
	? SelectLazy<TType, T, TKey>
	: TSelection extends Selection.BuiltIn
	? SelectBuiltIn<TType, T, TKey>
	: TSelection extends Selection.Both
	? Select<TType, T, TKey, Selection.Lazy | Selection.BuiltIn>
	: never;
type HasTypeFn<K extends Type, TSelection extends Selection> = <T, TKey extends ObjectKey = ObjectKey>(
	maybe: unknown
) => maybe is Select<K, T, TKey, TSelection>;

type SelectKeyTransformation<K extends string, TSelection extends Selection> = TSelection extends Selection.Lazy
	? `lazy${K}`
	: TSelection extends Selection.BuiltIn
	? `${Lowercase<K>}`
	: TSelection extends Selection.Both
	? `any${K}`
	: never;
type _HasType<TSelection extends Selection> = {
	[K in Type as `${SelectKeyTransformation<K, TSelection>}`]: HasTypeFn<K, TSelection>;
};
type HasType<TSelection extends Selection = Selection> = tb.Union.IntersectOf<TSelection extends unknown ? _HasType<TSelection> : never> & {
	lazy: HasTypeFn<Type, Selection.Lazy>;
};

type HasTypeByFn<TSelection extends Selection> = <TType extends Type>(
	type: TType
) => <T, TKey extends ObjectKey>(maybe: unknown) => maybe is Select<TType, T, TKey, TSelection>;
type HasTypeKeyFn<TSelection extends Selection> = <TType extends Type, TKey extends keyof _HasType<TSelection>>(type: TType) => TKey;

const getKeyBy = <TSelection extends Selection>(selection: TSelection) => {
	const getKey: HasTypeKeyFn<TSelection> = (() => {
		switch (selection) {
			case Selection.Lazy:
				return (type) => `lazy${type}`;
			case Selection.BuiltIn:
				return (type) => type.toLowerCase();
			case Selection.Both:
				return (type) => `any${type}`;
			default:
				throw new Error("Unreachable!");
		}
	})() as HasTypeKeyFn<TSelection>;
	return getKey;
};

function getValueBy<TSelection extends Selection>(selection: TSelection) {
	const getValue: HasTypeByFn<TSelection> = (() => {
		switch (selection) {
			case Selection.Lazy:
				return (type) => (maybe) =>
					typeof maybe === "object" && maybe !== null && "__type" in maybe && (maybe as ILazySet<never>).__type === type;
			case Selection.BuiltIn:
				return (type) => (maybe) => {
					switch (type) {
						case Type.Array:
							return maybe instanceof Array;
						case Type.Set:
							return maybe instanceof Set;
						case Type.Object:
							return typeof maybe === "object" && maybe !== null;
						case Type.Value:
							return ![Type.Array, Type.Object, Type.Set].map(getValueBy(Selection.BuiltIn)).some((fn) => fn(maybe));
						default:
							throw new Error("Unreachable!");
					}
				};
			case Selection.Both:
				return (type) => (maybe) => getValueBy(Selection.BuiltIn)(type)(maybe) || getValueBy(Selection.Lazy)(type)(maybe);
			default:
				throw new Error("Unreachable!");
		}
	})() as HasTypeByFn<TSelection>;
	return getValue;
}
const hasTypeBy = <TSelection extends Selection>(selection: TSelection) => {
	const getKey = getKeyBy(selection);
	const getValue = getValueBy(selection);
	return Object.values(Type).reduce(
		<TType extends Type>(acc: _HasType<TSelection>, type: TType) => ({
			...acc,
			[getKey(type)]: getValue(type),
		}),
		{} as _HasType<TSelection>
	);
};

const hasType: HasType = {
	...Object.values(Selection)
		.map(hasTypeBy)
		.reduce((prev, selection) => ({
			...prev,
			...selection,
		})),
	lazy: ((maybe) => Object.values(Type).some((type) => getValueBy(Selection.Lazy)(type)(maybe))) as HasTypeFn<Type, Selection.Lazy>,
};
export default hasType;
