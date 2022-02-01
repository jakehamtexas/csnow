import { CombinatoricStructuresUnion } from "./combinatoric";
import * as _OneOf from "./oneOf";
import * as _KOf from "./kOf";

type _Namespace = typeof _KOf | typeof _OneOf;
type CombinatoricExpressionNamespace<T extends _Namespace> = T["make"] & {
	isSpecimen: T["isSpecimen"];
	rangeWith: T["rangeWith"];
	iterateBy: T["iterateBy"];
};

export type OneOf = CombinatoricExpressionNamespace<typeof _OneOf>;
export type KOf = CombinatoricExpressionNamespace<typeof _KOf>;

const makeNamespace = <T extends _Namespace>(ns: T) => {
	const fullyQualified = ns.make as CombinatoricExpressionNamespace<T>;

	fullyQualified.isSpecimen = ns.isSpecimen;
	fullyQualified.rangeWith = ns.rangeWith;
	fullyQualified.iterateBy = ns.iterateBy;

	return fullyQualified;
};

export const KOf = makeNamespace(_KOf) as KOf;
export const OneOf = makeNamespace(_OneOf) as OneOf;
export const isCombinatoricStructure = (v: unknown): v is CombinatoricStructuresUnion => [KOf, OneOf].some((space) => space.isSpecimen(v));
