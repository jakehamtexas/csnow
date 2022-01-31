import { calculate, makeSnapshot } from "./snow";
import { OneOf, KOf } from "./combinatoric";
export { makeSnapshot };

export type Snow = typeof calculate & {
	makeSnapshot: typeof makeSnapshot;
	OneOf: typeof OneOf;
	KOf: typeof KOf;
};

const Snow = calculate as Snow;

Snow.KOf = KOf;
Snow.OneOf = OneOf;
Snow.makeSnapshot = makeSnapshot;

export default Snow;
