import { oneOf, kOf } from "../src";
import { combinatoricStructurePaths, toExpanded } from "../src/graph";

describe("combinatoricStructurePaths", () => {
	it("should get paths where OneOf statements are used", () => {
		// arrange
		const object = {
			foo: oneOf(["bar", "baz"]),
			foo2: oneOf(["bar2", "baz2"]),
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
			foo: kOf(1, ["bar", "baz"]),
			foo2: kOf(1, ["bar2", "baz2"]),
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
			foo: oneOf([kOf(1, ["foo", "bar"]), ["baz"]]),
			foo2: kOf(1, ["bar2", "baz2"]),
		};

		const expected = new Set(["foo", "foo2", "foo.array.0"]);

		// act
		const actual = combinatoricStructurePaths(object);

		// assert
		expect(actual).toStrictEqual(expected);
	});
});

describe("toExpanded", () => {
	const combinationArray = (arr: unknown[]) =>
		expect.arrayContaining(
			arr.map((v) => ({
				foo: v,
			}))
		);
	it("should not expand an object without combinatoric structures", () => {
		// arrange
		const object = {
			foo: {
				bar: {
					baz: 1,
				},
			},
		};

		const expected = {
			foo: {
				bar: {
					baz: 1,
				},
			},
		};

		// act
		const actual = toExpanded(object);

		// assert
		expect(actual).toStrictEqual(expected);
	});

	it("should expand a oneOf combinatoric structure", () => {
		// arrange
		const object = {
			foo: oneOf([{ bar: "baz" }, "foo2"]),
		};

		const expected = combinationArray([
			{
				bar: "baz",
			},
			"foo2",
		]);

		// act
		const actual = toExpanded(object);

		// assert
		expect(actual).toStrictEqual(expected);
	});

	it("should expand a kOf combinatoric structure", () => {
		// arrange
		const object = {
			foo: kOf(2, [{ bar: "baz" }, "foo2", { baz: "foo2" }]),
		};

		const expected = combinationArray([
			[{ bar: "baz" }, "foo2"],
			[{ bar: "baz" }, { baz: "foo2" }],
			["foo2", { baz: "foo2" }],
		]);

		// act
		const actual = toExpanded(object);

		// assert
		expect(actual).toStrictEqual(expected);
	});

	it("should expand a nested oneOf structure", () => {
		// arrange
		const object = {
			foo: oneOf([oneOf(["bar", "baz"]), "foo2"]),
		};

		const expected = combinationArray(["bar", "baz", "foo2"]);

		// act
		const actual = toExpanded(object);

		// assert
		expect(actual).toStrictEqual(expected);
	});

	it("should expand a deep nested oneOf structure", () => {
		// arrange
		const object = {
			foo: oneOf([{ foo: oneOf([{ bar: "bar" }, "baz"]) }, "foo2"]),
		};

		const expected = combinationArray([{ foo: { bar: "bar" } }, { foo: "baz" }, "foo2"]);

		// act
		const actual = toExpanded(object);

		// assert
		expect(actual).toStrictEqual(expected);
	});

	it("should expand a nested kOf structure", () => {
		// arrange
		const object = {
			foo: kOf(2, [kOf(2, ["foo3", "bar", "baz"]), "foo2", "bar2"]),
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
		const actual = toExpanded(object);

		// assert
		expect(actual).toStrictEqual(expected);
	});

	it("should expand a deep nested KOf structure", () => {
		// arrange
		const object = {
			foo: kOf(2, [{ foo: kOf(2, ["foo", { bar: "bar" }, "baz"]) }, "foo2", "baz3"]),
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
		const actual = toExpanded(object);

		// assert
		expect(actual).toStrictEqual(expected);
	});

	it("should expand a oneOf nested inside a kOf structure", () => {
		// arrange
		const object = {
			foo: kOf(2, [oneOf(["foo3", "bar"]), "foo2", "bar2"]),
		};

		const expected = combinationArray([
			["foo3", "foo2"],
			["bar", "foo2"],
			["foo3", "bar2"],
			["bar", "bar2"],
			["foo2", "bar2"],
		]);

		// act
		const actual = toExpanded(object);

		// assert
		expect(actual).toStrictEqual(expected);
	});

	it("should expand a kOf nested inside a oneOf structure", () => {
		// arrange
		const object = {
			foo: oneOf([kOf(2, ["foo3", "bar", "baz"]), "foo2", "bar2"]),
		};

		const expected = combinationArray([["foo3", "bar"], ["foo3", "baz"], ["bar", "baz"], "foo2", "bar2"]);

		// act
		const actual = toExpanded(object);

		// assert
		expect(actual).toStrictEqual(expected);
	});
});
