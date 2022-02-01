import fastCartesian from "fast-cartesian";
import { CombinatoricStructuresUnion } from "./combinatoric/combinatoric";
import { toExpanded } from "./graph";
import { AnyArray } from "./util";

// type Cartesian = {};
// type Snap<TInput extends Cartesian, TOutput> = (input: TInput, fn: (input: TInput) => TOutput) => SnapTest<TInput, TOutput>;
type Irreducible = string | number | symbol | null | undefined | boolean;
type SubjectValue = CombinatoricStructuresUnion | object | Irreducible | AnyArray;

type Subject = Record<string, SubjectValue>;
export const calculate = (subject: Subject | AnyArray[] | (AnyArray | unknown)[]) => {
	if (Array.isArray(subject)) return fastCartesian(subject.map((v) => (Array.isArray(v) ? v : [v])) as unknown[][]);
	return toExpanded(subject);
};

type NormalizedFormSubjectNode<TSubject, K extends keyof TSubject> = TSubject[K] extends infer V
	? V extends Irreducible
		? V
		: V extends CombinatoricStructuresUnion
		? NormalizedFormSubjectNode<V["array"], number>
		: V extends unknown[]
		? NormalizedFormSubjectNode<V, number>[]
		: V extends object
		? NormalizedFormSubject<V>
		: never
	: never;
type NormalizedFormSubject<TSubject extends object> = TSubject extends infer X
	? {
			[K in keyof X]: X extends infer U ? (K extends keyof U ? NormalizedFormSubjectNode<U, K> : never) : never;
	  }
	: never;

export type Snapshot<TSubject extends Subject, TOutput> = {
	input: NormalizedFormSubject<TSubject>;
	output: TOutput;
}[];

export const makeSnapshot = <TSubject extends Subject, TOutput>(
	subject: TSubject,
	fn: (subject: NormalizedFormSubject<TSubject>) => TOutput
): Snapshot<TSubject, TOutput> => {
	const expansions = toExpanded(subject);
	return expansions.map((input) => ({
		input: input as NormalizedFormSubject<TSubject>,
		output: fn(input as NormalizedFormSubject<TSubject>),
	}));
};
