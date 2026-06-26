"use client";

import { useParams } from "next/navigation";
import { CourseView } from "@/components/course-view";

export default function CoursePage() {
  const params = useParams<{ id: string }>();
  return <CourseView courseId={params.id} />;
}