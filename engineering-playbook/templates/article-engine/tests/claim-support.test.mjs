import test from "node:test";
import assert from "node:assert/strict";
import { inferClaimIdsFromSpecifics, unverifiedSpecifics, validateUsedClaims } from "../src/writer.js";

const research = {
  claims: [
    { id: "deadline", statement: "The filing deadline is 30 days after approval.", support: "direct", source_url: "https://authority.example/rule" },
    { id: "fee", statement: "The filing fee is $250.", support: "direct", source_url: "https://authority.example/fee" },
  ],
};

test("specifics appearing in direct claim statements pass", () => {
  assert.deepEqual(unverifiedSpecifics("You have 30 days to file, and the fee is $250.", research), []);
});

test("invented hard facts are identified even when other numbers are supported", () => {
  assert.deepEqual(unverifiedSpecifics("You have 45 days to file, and the fee is $900.", research), ["$900", "45 days"]);
});

test("unsupported percentages are treated as hard facts", () => {
  assert.deepEqual(unverifiedSpecifics("This improves the result by 27%.", research), ["27%"]);
});

test("model-returned claim ids are restricted to direct research claims", () => {
  assert.deepEqual(validateUsedClaims(["deadline", "invented", "deadline"], research), {
    surviving: ["deadline"],
    rejected: ["invented"],
  });
});

test("claims supporting explicit hard facts are attached even if the model omits their ids", () => {
  assert.deepEqual(inferClaimIdsFromSpecifics("The fee is $250 and the deadline is 30 days.", research), ["deadline", "fee"]);
});
