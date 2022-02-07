import csnow from "../src";
import { Snapshot } from "../src/csnow";
import { allAisInB } from "./allAIsInB";

const doAssertion = (a: unknown[], e: unknown[]) => {
	allAisInB(a, e);
	allAisInB(e, a);
	expect(a).toHaveLength(e.length);
};
describe("csnow", () => {
	describe("object", () => {
		describe("oneOf", () => {
			it("should calculate cartesian product with an object of two properties, each of csnow.OneOf", () => {
				// arrange
				const object = {
					foo: csnow.OneOf(["bar", "baz"]),
					foo2: csnow.OneOf(["bar2", "baz2"]),
				};

				const expected = [
					{
						foo: "bar",
						foo2: "bar2",
					},
					{
						foo: "bar",
						foo2: "baz2",
					},
					{
						foo: "baz",
						foo2: "bar2",
					},
					{
						foo: "baz",
						foo2: "baz2",
					},
				].map((obj) => [obj]);

				// act
				const actual = [...csnow(object)];

				// assert
				expect(actual).toStrictEqual(expected);
				// doAssertion(actual, expected);
			});

			it("should calculate cartesian product with an object of two properties, one of csnow.OneOf, and one of a string", () => {
				// arrange
				const object = {
					foo: csnow.OneOf(["bar", "baz"]),
					foo2: "bar2",
				};

				const expected = [
					{
						foo: "bar",
						foo2: "bar2",
					},
					{
						foo: "baz",
						foo2: "bar2",
					},
				].map((obj) => [obj]);

				// act
				const actual = [...csnow(object)];

				// assert
				doAssertion(actual, expected);
			});

			it("should calculate cartesian product with an object of two properties, one of csnow.OneOf, and one of an array of string", () => {
				// arrange
				const object = {
					foo: csnow.OneOf(["bar", "baz"]),
					foo2: ["bar2", "baz2"],
				};

				const expected = [
					{
						foo: "bar",
						foo2: ["bar2", "baz2"],
					},
					{
						foo: "baz",
						foo2: ["bar2", "baz2"],
					},
				].map((obj) => [obj]);

				// act
				const actual = [...csnow(object)];

				// assert
				doAssertion(actual, expected);
			});
		});

		describe("kOf", () => {
			it("should calculate cartesian product with an object of two properties, each of KOf [n: 2, k: 2]", () => {
				// arrange
				const object = {
					foo: csnow.KOf(2, ["bar", "baz"]),
					foo2: csnow.KOf(2, ["bar2", "baz2"]),
				};

				const expected = [
					{
						foo: ["bar", "baz"],
						foo2: ["bar2", "baz2"],
					},
				].map((obj) => [obj]);

				// act
				const actual = [...csnow(object)];

				// assert
				doAssertion(actual, expected);
			});

			it("should calculate cartesian product with an object of two properties, one of KOf [n: 3, k: 2], and one of a string", () => {
				// arrange
				const object = {
					foo: csnow.KOf(2, ["foo", "bar", "baz"]),
					foo2: "bar2",
				};

				const expected = [
					{
						foo: ["foo", "bar"],
						foo2: "bar2",
					},
					{
						foo: ["foo", "baz"],
						foo2: "bar2",
					},
					{
						foo: ["bar", "baz"],
						foo2: "bar2",
					},
				].map((obj) => [obj]);

				// act
				const actual = [...csnow(object)];
				// assert
				doAssertion(actual, expected);
			});
		});
	});

	describe("deep", () => {
		describe("object", () => {
			it("should calculate cartesian product with an object of two properties, each of csnow.OneOf (object)), and one with nested csnow.OneOf", () => {
				// arrange
				const object = {
					foo: csnow.OneOf([{ a: "bar" }, { a: "baz" }]),
					foo2: csnow.OneOf([{ a: csnow.OneOf(["bar2", "baz2"]) }, { b: csnow.OneOf(["bar3", "baz3"]) }]),
					foo3: csnow.OneOf(["foo", "bar"]),
				};

				const expected = [
					{
						foo: { a: "bar" },
						foo2: { a: "bar2" },
						foo3: "foo",
					},
					{
						foo: { a: "bar" },
						foo2: { a: "baz2" },
						foo3: "foo",
					},
					{
						foo: { a: "bar" },
						foo2: { b: "bar3" },
						foo3: "foo",
					},
					{
						foo: { a: "bar" },
						foo2: { b: "baz3" },
						foo3: "foo",
					},
					{
						foo: { a: "baz" },
						foo2: { a: "bar2" },
						foo3: "foo",
					},
					{
						foo: { a: "baz" },
						foo2: { a: "baz2" },
						foo3: "foo",
					},
					{
						foo: { a: "baz" },
						foo2: { b: "bar3" },
						foo3: "foo",
					},
					{
						foo: { a: "baz" },
						foo2: { b: "baz3" },
						foo3: "foo",
					},
					{
						foo: { a: "bar" },
						foo2: { a: "bar2" },
						foo3: "bar",
					},
					{
						foo: { a: "bar" },
						foo2: { a: "baz2" },
						foo3: "bar",
					},
					{
						foo: { a: "bar" },
						foo2: { b: "bar3" },
						foo3: "bar",
					},
					{
						foo: { a: "bar" },
						foo2: { b: "baz3" },
						foo3: "bar",
					},
					{
						foo: { a: "baz" },
						foo2: { a: "bar2" },
						foo3: "bar",
					},
					{
						foo: { a: "baz" },
						foo2: { a: "baz2" },
						foo3: "bar",
					},
					{
						foo: { a: "baz" },
						foo2: { b: "bar3" },
						foo3: "bar",
					},
					{
						foo: { a: "baz" },
						foo2: { b: "baz3" },
						foo3: "bar",
					},
				].map((obj) => [obj]);

				// act
				const actual = [...csnow(object)];
				// assert
				doAssertion(actual, expected);
			});
		});
	});

	describe("multiple args", () => {
		it("should calculate cartesian product with two objects, each with a shallow combinatoric expression", () => {
			// arrange
			const object1 = {
				foo: csnow.OneOf(["o1", "o2"]),
				foo2: "o3",
			};

			const object2 = {
				foo: "o4",
				foo2: csnow.OneOf(["o5", "o6"]),
			};

			const expected = [
				[
					{
						foo: "o1",
						foo2: "o3",
					},
					{ foo: "o4", foo2: "o5" },
				],
				[
					{
						foo: "o2",
						foo2: "o3",
					},
					{ foo: "o4", foo2: "o5" },
				],
				[
					{
						foo: "o1",
						foo2: "o3",
					},
					{ foo: "o4", foo2: "o6" },
				],
				[
					{
						foo: "o2",
						foo2: "o3",
					},
					{ foo: "o4", foo2: "o6" },
				],
			];

			// act
			const actual = [...csnow(object1, object2)];

			// assert
			doAssertion(actual, expected);
		});

		it("should calculate cartesian product with two objects, each with a deep combinatoric expression", () => {
			// arrange
			const object1 = {
				foo: { bar: csnow.OneOf(["bar", "baz"]) },
				foo2: "bar",
			};

			const object2 = {
				foo: "bar",
				foo2: { bar: csnow.OneOf(["bar", "baz"]) },
			};

			const expected = [
				[
					{
						foo: { bar: "bar" },
						foo2: "bar",
					},
					{ foo: "bar", foo2: { bar: "bar" } },
				],
				[
					{
						foo: { bar: "baz" },
						foo2: "bar",
					},
					{ foo: "bar", foo2: { bar: "bar" } },
				],
				[
					{
						foo: { bar: "baz" },
						foo2: "bar",
					},
					{ foo: "bar", foo2: { bar: "baz" } },
				],
				[
					{
						foo: { bar: "bar" },
						foo2: "bar",
					},
					{ foo: "bar", foo2: { bar: "baz" } },
				],
			];

			// act
			const actual = [...csnow(object1, object2)];

			// assert
			doAssertion(actual, expected);
		});
	});
});

describe("makeSnapshot", () => {
	it("should work", () => {
		const fn = ({ foo }: { foo: string }) => foo + "!";
		const actual = csnow.makeSnapshot([{ foo: "foo" }], fn);
		const expected: Snapshot<{ foo: string }, string> = [
			{
				input: [{ foo: "foo" }],
				output: "foo!",
			},
		];

		doAssertion(actual, expected);
	});
});
