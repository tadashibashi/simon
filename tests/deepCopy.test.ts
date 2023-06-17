import { deepCopy } from "../src/lib/Util"

test("deepCopy: nested looping ref", () => {
    const reffed: any = {str: "Hello"};
    reffed["reffed"] = reffed; // references self

    const obj = {reffed, name: "Payne", age: 25, arr: [0, 1, reffed]};

    const copy = deepCopy(obj);
    expect(copy).toEqual(obj);
});
