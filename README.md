# snow

```sh
npm i -D snowjs
```

`snow` is a **SN**apshot **O**bject **W**riter that calculates the _Cartesian product_ of an object. `snow` provides a declarative interface for controlling the production behavior by allowing properties of the object to be expressbable as Cartesian products or combinations.

The resulting construction may be expanded to an array.

```typescript
import Snow from "snowjs";

const subject = {
	foo: Snow.OneOf.make(["bar", "baz"]),
	bar: "foo",
	baz: Snow.KOf.make(2, ["foo", "bar", "baz"]),
};

const snapshots = Snow(subject);

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
