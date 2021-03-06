import _ from "lodash";
import { OneOf, KOf } from "../src/combinatoric";
import { combinatoricStructurePaths, expanded, size, Subject } from "../src/graph";

describe("combinatoricStructurePaths", () => {
	it("should get paths where OneOf statements are used", () => {
		// arrange
		const object = {
			foo: OneOf(["bar", "baz"]),
			foo2: OneOf(["bar2", "baz2"]),
		};

		const expected = new Set(["foo", "foo2"]);

		// act
		const actual = combinatoricStructurePaths(object);

		// assert
		expect(actual).toStrictEqual(expected);
	});

	it("should get paths where KOf statements are used", () => {
		// arrange
		const object = {
			foo: KOf(1, ["bar", "baz"]),
			foo2: KOf(1, ["bar2", "baz2"]),
		};

		const expected = new Set(["foo", "foo2"]);

		// act
		const actual = combinatoricStructurePaths(object);

		// assert
		expect(actual).toStrictEqual(expected);
	});

	it("should get paths where deep statements are used", () => {
		// arrange
		const object = {
			foo: OneOf([KOf(1, ["foo", "bar"]), ["baz"]]),
			foo2: KOf(1, ["bar2", "baz2"]),
		};

		const expected = new Set(["foo", "foo2", "foo.array.0"]);

		// act
		const actual = combinatoricStructurePaths(object);

		// assert
		expect(actual).toStrictEqual(expected);
	});
});

describe("expanded", () => {
	const combinationArray = (arr: unknown[]) =>
		arr.map((v) => ({
			foo: v,
		}));
	it("should not expand an object without combinatoric structures", () => {
		// arrange
		const expected = {
			foo: {
				bar: {
					baz: 1,
				},
			},
		};

		// act
		const actual = expanded(expected).collect();

		// assert
		expect(actual).toStrictEqual(expected);
	});

	it("should expand a OneOf combinatoric structure", () => {
		// arrange
		const object = {
			foo: OneOf([{ bar: "baz" }, "foo2"]),
		};

		const expected = combinationArray([
			{
				bar: "baz",
			},
			"foo2",
		]);

		// act
		const actual = expanded(object).collect();

		// assert
		expect(actual).toStrictEqual(expected);
	});

	it("should expand a KOf combinatoric structure", () => {
		// arrange
		const object = {
			foo: KOf(2, [{ bar: "baz" }, "foo2", { baz: "foo2" }]),
		};

		const expected = combinationArray([
			[{ bar: "baz" }, "foo2"],
			[{ bar: "baz" }, { baz: "foo2" }],
			["foo2", { baz: "foo2" }],
		]);

		// act
		const actual = expanded(object).collect();

		// assert
		expect(actual).toStrictEqual(expected);
	});

	it("should expand a nested OneOf structure", () => {
		// arrange
		const object = {
			foo: OneOf([OneOf(["bar", "baz"]), "foo2"]),
		};

		const expected = combinationArray(["bar", "baz", "foo2"]);

		// act
		const actual = expanded(object).collect();

		// assert
		expect(actual).toStrictEqual(expected);
	});

	it("should expand a deep nested OneOf structure", () => {
		// arrange
		const object = {
			foo: OneOf([{ foo: OneOf([{ bar: "bar" }, "baz"]) }, "foo2"]),
		};

		const expected = combinationArray([{ foo: { bar: "bar" } }, { foo: "baz" }, "foo2"]);

		// act
		const actual = expanded(object).collect();

		// assert
		expect(actual).toStrictEqual(expected);
	});

	it("should expand a nested KOf structure", () => {
		// arrange
		const object = {
			foo: KOf(2, [KOf(2, ["foo3", "bar", "baz"]), "foo2", "bar2"]),
		};

		const expected = combinationArray([
			[["foo3", "bar"], "foo2"],
			[["foo3", "baz"], "foo2"],
			[["bar", "baz"], "foo2"],
			[["foo3", "bar"], "bar2"],
			[["foo3", "baz"], "bar2"],
			[["bar", "baz"], "bar2"],
			["foo2", "bar2"],
		]);

		// act
		const actual = expanded(object).collect();

		// assert
		expect(actual).toStrictEqual(expected);
	});

	it("should expand a deep nested KOf structure", () => {
		// arrange
		const object = {
			foo: KOf(2, [{ foo: KOf(2, ["foo", { bar: "bar" }, "baz"]) }, "foo2", "baz3"]),
		};

		const expected = combinationArray([
			[{ foo: ["foo", { bar: "bar" }] }, "foo2"],
			[{ foo: ["foo", "baz"] }, "foo2"],
			[{ foo: [{ bar: "bar" }, "baz"] }, "foo2"],
			[{ foo: ["foo", { bar: "bar" }] }, "baz3"],
			[{ foo: ["foo", "baz"] }, "baz3"],
			[{ foo: [{ bar: "bar" }, "baz"] }, "baz3"],
			["foo2", "baz3"],
		]);

		// act
		const actual = expanded(object).collect();

		// assert
		expect(actual).toStrictEqual(expected);
	});

	it("should expand a OneOf nested inside a KOf structure", () => {
		// arrange
		const object = {
			foo: KOf(2, [OneOf(["foo3", "bar"]), "foo2", "bar2"]),
		};

		const expected = combinationArray([
			["foo3", "foo2"],
			["bar", "foo2"],
			["foo3", "bar2"],
			["bar", "bar2"],
			["foo2", "bar2"],
		]);

		// act
		const actual = expanded(object).collect();

		// assert
		expect(actual).toStrictEqual(expected);
	});

	it("should expand a KOf nested inside a OneOf structure", () => {
		// arrange
		const object = {
			foo: OneOf([KOf(2, ["foo3", "bar", "baz"]), "foo2", "bar2"]),
		};

		const expected = combinationArray([["foo3", "bar"], ["foo3", "baz"], ["bar", "baz"], "foo2", "bar2"]);

		// act
		const actual = expanded(object).collect();

		// assert
		expect(actual).toStrictEqual(expected);
	});
});

describe("size", () => {
	const basicObject = {
		foo: ["foo", "bar"],
		bar: ["bar", "baz"],
		baz: ["bar", "baz"],
		baz2: ["bar", "baz"],
	};
	const makeKOf = (arr: unknown[]) => KOf(2, arr.concat(arr[1]));
	const makeOneOf = (arr: unknown[]) => OneOf(arr);
	const [kOfObj, oneOfObj] = [makeKOf, makeOneOf].map((fn) => _.mapValues(basicObject, fn));
	it.each([
		{ type: "oneOf", object: kOfObj, expected: 81 },
		{ type: "kOf", object: oneOfObj, expected: 16 },
	])("nested $type: should get the number of elements in an expansion", ({ expected, object }) => {
		// act
		const actual = size(object as Subject);

		// assert
		expect(actual).toBe(expected);
	});
});
