import { describe, test as it } from "node:test";
import assert from "node:assert/strict";
import Color from "color";
import { distance } from "./distance.js";
import { sortByNearest } from "./sortByNearest.js";

describe("distance()", () => {
  it("should calculate the color distance", () => {
    assert.equal(distance(Color("#000000"), Color("#000000")), 0);
    assert.equal(distance(Color("#000000"), Color("#FF00FF")), 255 * 2);
    assert.equal(distance(Color("#000000"), Color("#FFFFFF")), 255 * 3);
  });
});

describe("nearest color", () => {
  it("should sort colors", () => {
    const sorted = sortByNearest(Color("#53dde6"), [
      Color("#A52A2A"),
      Color("#22BAD0"),
      Color("#008000"),
    ]).map((c) => c.hex());

    assert.equal(sorted[0], "#22BAD0");
    assert.equal(sorted[1], "#A52A2A");
    assert.equal(sorted[2], "#008000");
  });
});
