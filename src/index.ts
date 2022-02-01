import { calculate, makeSnapshot } from "./csnow";
import { OneOf, KOf } from "./combinatoric";
export { makeSnapshot };

export type CSNOW = typeof calculate & {
	makeSnapshot: typeof makeSnapshot;
	OneOf: typeof OneOf;
	KOf: typeof KOf;
};

const csnow = calculate as CSNOW;

csnow.KOf = KOf;
csnow.OneOf = OneOf;
csnow.makeSnapshot = makeSnapshot;

export default csnow;
