"use client";

import { useParams } from "next/navigation";
import { ActivityRunner } from "@/components/activity-runner";

export default function ActivityPage() {
  const params = useParams<{ id: string; nodeId: string }>();
  return <ActivityRunner courseId={params.id} nodeId={params.nodeId} />;
}