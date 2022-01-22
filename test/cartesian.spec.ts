import { Cartesian } from "../src";

describe("Cartesian.calculate", () => {
	describe("object", () => {
		describe("oneOf", () => {
			it("should calculate cartesian product with an object of two properties, each of Cartesian.oneOf", () => {
				// arrange
				const object = {
					foo: Cartesian.oneOf(["bar", "baz"]),
					foo2: Cartesian.oneOf(["bar2", "baz2"]),
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
				const actual = Cartesian.calculate(object);

				// assert
				expect(actual).toStrictEqual(expect.arrayContaining(expected));
			});

			it("should calculate cartesian product with an object of two properties, one of Cartesian.oneOf, and one of a string", () => {
				// arrange
				const object = {
					foo: Cartesian.oneOf(["bar", "baz"]),
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
				const actual = Cartesian.calculate(object);

				// assert
				expect(actual).toStrictEqual(expect.arrayContaining(expected));
			});

			it("should calculate cartesian product with an object of two properties, one of Cartesian.oneOf, and one of an array of string", () => {
				// arrange
				const object = {
					foo: Cartesian.oneOf(["bar", "baz"]),
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
				const actual = Cartesian.calculate(object);

				// assert
				expect(actual).toStrictEqual(expect.arrayContaining(expected));
			});
		});

		describe("kOf", () => {
			it("should calculate cartesian product with an object of two properties, each of Cartesian.kOf [n: 2, k: 2]", () => {
				// arrange
				const object = {
					foo: Cartesian.kOf(2, ["bar", "baz"]),
					foo2: Cartesian.kOf(2, ["bar2", "baz2"]),
				};

				const expected = [
					{
						foo: ["bar", "baz"],
						foo2: ["bar2", "baz2"],
					},
				];

				// act
				const actual = Cartesian.calculate(object);

				// assert
				expect(actual).toStrictEqual(expect.arrayContaining(expected));
			});

			it("should calculate cartesian product with an object of two properties, one of Cartesian.kOf [n: 3, k: 2], and one of a string", () => {
				// arrange
				const object = {
					foo: Cartesian.kOf(2, ["foo", "bar", "baz"]),
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
				const actual = Cartesian.calculate(object);

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
			const actual = Cartesian.calculate(array);

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
			const actual = Cartesian.calculate(array);

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
			const actual = Cartesian.calculate(array);

			// assert
			expect(actual).toStrictEqual(expect.arrayContaining(expected));
		});
	});
});
