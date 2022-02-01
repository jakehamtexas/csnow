# csnow

```sh
npm i -D csnow
```

`csnow` is a **C**artesian/**SN**apshot **O**bject **W**riter that calculates the _Cartesian product_ of an object, which may be used for brute-force snapshot testing. `csnow` provides a declarative interface for controlling the production behavior by allowing properties of the object to be expressbable as Cartesian products or combinations.

The resulting construction may be expanded to an array.

```typescript
import csnow from "csnow";

const subject = {
	foo: csnow.OneOf(["bar", "baz"]),
	bar: "foo",
	baz: csnow.KOf(2, ["foo", "bar", "baz"]),
};

const snapshots = csnow(subject);

/*
 * [
 *   { foo: "bar", bar: "foo", baz: ["foo", "bar"] },
 *   { foo: "baz", bar: "foo", baz: ["foo", "bar"] },
 *   { foo: "bar", bar: "foo", baz: ["foo", "baz"] },
 *   { foo: "baz", bar: "foo", baz: ["foo", "baz"] },
 *   { foo: "bar", bar: "foo", baz: ["bar", "baz"] },
 *   { foo: "baz", bar: "foo", baz: ["bar", "baz"] }
 * ]
 */
```
