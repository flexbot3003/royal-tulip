import { describe, expect, it } from "vitest";
import { ratingMessages, storyConfig } from "./storyConfig";

describe("Royal Tulip story configuration", () => {
  it("contains four chapters matching the four sealed questions", () => {
    expect(storyConfig.chapters).toHaveLength(4);
    expect(storyConfig.chapters.map((chapter) => chapter.question)).toEqual([
      "Who arranged the marriage?",
      "Why was she selected?",
      "Who is the mysterious nobleman?",
      "Why did the clerk always know more than he should?",
    ]);
  });

  it("gives every chapter at least one answer and three hints", () => {
    for (const chapter of storyConfig.chapters) {
      expect(chapter.acceptedAnswers.length).toBeGreaterThan(0);
      expect(chapter.hints).toHaveLength(3);
    }
  });

  it("keeps the intended final answer", () => {
    expect(storyConfig.finalAnswer).toBe("I love you to the moon and back");
  });

  it("has a quirky response for every boyfriend rating", () => {
    expect(Object.keys(ratingMessages)).toHaveLength(10);
    for (let rating = 1; rating <= 10; rating += 1) {
      expect(ratingMessages[rating].length).toBeGreaterThan(20);
    }
  });
});
