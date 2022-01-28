import fastCartesian from "fast-cartesian";
import { KOf, OneOf } from "./combinatoricStructure";
import { toExpanded } from "./graph";
import { AnyArray } from "./util";

// type Cartesian = {};
// type Snap<TInput extends Cartesian, TOutput> = (input: TInput, fn: (input: TInput) => TOutput) => SnapTest<TInput, TOutput>;

type SubjectValue = OneOf | KOf | string | number | symbol | object;

type Subject = Record<string, SubjectValue> | AnyArray[] | (AnyArray | unknown)[];
export const calculate = (subject: Subject) => {
	if (Array.isArray(subject)) return fastCartesian(subject.map((v) => (Array.isArray(v) ? v : [v])) as unknown[][]);
	return toExpanded(subject);
};
