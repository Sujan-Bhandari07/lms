import { describe, expect, it } from "vitest";
import {
  isProtectedVideoUrl,
  sanitizeAssistantResponse,
  sanitizeCourseToolResult,
} from "./response-sanitizer";

describe("assistant response sanitization", () => {
  it("removes video links while preserving normal course links and image URLs", () => {
    const response = sanitizeAssistantResponse(
      [
        "[Watch lesson](https://res.cloudinary.com/demo/video/upload/course/lesson.mp4)",
        "https://cdn.example.com/recordings/lesson.m3u8",
        "[Course details](https://ujyalo.example.com/courses/abc)",
        "![Course image](https://res.cloudinary.com/demo/image/upload/course.jpg)",
      ].join("\n"),
    );

    expect(response).not.toContain("lesson.mp4");
    expect(response).not.toContain("lesson.m3u8");
    expect(response).toContain("Watch lesson");
    expect(response).toContain("[Course details](https://ujyalo.example.com/courses/abc)");
    expect(response).toContain("https://res.cloudinary.com/demo/image/upload/course.jpg");
  });

  it("recognizes encoded playback URLs and keeps non-video course links", () => {
    expect(
      isProtectedVideoUrl(
        "https://storage.example.com/course%2Fvideos%2Flesson.mp4?token=private",
      ),
    ).toBe(true);
    expect(
      isProtectedVideoUrl("https://ujyalo.example.com/courses/abc"),
    ).toBe(false);
  });

  it("removes IDs and individual parts from course tool results but keeps counts", () => {
    const result = sanitizeCourseToolResult({
      _id: "course-id",
      coursename: "NestJS",
      tutor: { tutorid: "tutor-id", tutorname: "Sujan" },
      parts: [{ partid: "part-id", videourl: "https://cdn.example.com/lesson.mp4" }],
      title: "https://res.cloudinary.com/demo/image/upload/course.jpg",
    });

    expect(result).toEqual({
      coursename: "NestJS",
      tutor: { tutorname: "Sujan" },
      partCount: 1,
      title: "https://res.cloudinary.com/demo/image/upload/course.jpg",
    });
  });
});
