import * as Snot from "../src";
describe("Snot.eager", () => {
	describe("object", () => {
		describe("oneOf", () => {
			it("should calculate cartesian product with an object of two properties, each of Snot.oneOf", () => {
				// arrange
				const object = {
					foo: Snot.oneOf(["bar", "baz"]),
					foo2: Snot.oneOf(["bar2", "baz2"]),
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
				];

				// act
				const actual = Snot.eager(object);

				// assert
				expect(actual).toStrictEqual(expect.arrayContaining(expected));
			});

			it("should calculate cartesian product with an object of two properties, one of Snot.oneOf, and one of a string", () => {
				// arrange
				const object = {
					foo: Snot.oneOf(["bar", "baz"]),
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
				];

				// act
				const actual = Snot.eager(object);

				// assert
				expect(actual).toStrictEqual(expect.arrayContaining(expected));
			});

			it("should calculate cartesian product with an object of two properties, one of Snot.oneOf, and one of an array of string", () => {
				// arrange
				const object = {
					foo: Snot.oneOf(["bar", "baz"]),
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
				];

				// act
				const actual = Snot.eager(object);

				// assert
				expect(actual).toStrictEqual(expect.arrayContaining(expected));
			});
		});

		describe("kOf", () => {
			it("should calculate cartesian product with an object of two properties, each of Snot.kOf [n: 2, k: 2]", () => {
				// arrange
				const object = {
					foo: Snot.kOf(2, ["bar", "baz"]),
					foo2: Snot.kOf(2, ["bar2", "baz2"]),
				};

				const expected = [
					{
						foo: ["bar", "baz"],
						foo2: ["bar2", "baz2"],
					},
				];

				// act
				const actual = Snot.eager(object);

				// assert
				expect(actual).toStrictEqual(expect.arrayContaining(expected));
			});

			it("should calculate cartesian product with an object of two properties, one of Snot.kOf [n: 3, k: 2], and one of a string", () => {
				// arrange
				const object = {
					foo: Snot.kOf(2, ["foo", "bar", "baz"]),
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
				];

				// act
				const actual = Snot.eager(object);
				// assert
				expect(actual).toStrictEqual(expect.arrayContaining(expected));
			});
		});
	});
	describe("array", () => {
		it("should calculate cartesian product with 2 nested arrays of strings", () => {
			// arrange
			const array = [
				["bar", "baz"],
				["bar2", "baz2"],
			];

			const expected = [
				["bar", "bar2"],
				["bar", "baz2"],
				["baz", "bar2"],
				["baz", "baz2"],
			];

			// act
			const actual = Snot.eager(array);

			// assert
			expect(actual).toStrictEqual(expect.arrayContaining(expected));
		});

		it("should calculate cartesian product with 1 nested arrays of strings and 1 string value", () => {
			// arrange
			const array = [["bar", "baz"], "baz2"];

			const expected = [
				["bar", "baz2"],
				["baz", "baz2"],
			];

			// act
			const actual = Snot.eager(array);

			// assert
			expect(actual).toStrictEqual(expect.arrayContaining(expected));
		});

		it("should calculate cartesian product with 2 nested arrays of arrays of strings", () => {
			// arrange
			const array = [
				[["bar", "baz"], ["foo"]],
				[["bar2", "baz2"], ["foo2"]],
			];

			const expected = [
				[
					["bar", "baz"],
					["bar2", "baz2"],
				],
				[["bar", "baz"], ["foo2"]],
				[["foo"], ["bar2", "baz2"]],
				[["foo"], ["foo2"]],
			];

			// act
			const actual = Snot.eager(array);

			// assert
			expect(actual).toStrictEqual(expect.arrayContaining(expected));
		});
	});

	describe("deep", () => {
		describe("object", () => {
			it("should calculate cartesian product with an object of two properties, each of Snot.oneOf (object)), and one with nested Snot.oneOf", () => {
				// arrange
				const object = {
					foo: Snot.oneOf([{ a: "bar" }, { a: "baz" }]),
					foo2: Snot.oneOf([{ a: Snot.oneOf(["bar2", "baz2"]) }, { b: Snot.oneOf(["bar3", "baz3"]) }]),
					foo3: Snot.oneOf(["foo", "bar"]),
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
				];

				// act
				const actual = Snot.eager(object);
				// assert
				expect(actual).toStrictEqual(expect.arrayContaining(expected));
			});
		});
	});
});
