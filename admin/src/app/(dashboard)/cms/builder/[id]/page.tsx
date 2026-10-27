"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { AirborneStudio } from "@/components/builder/airborne-studio";

export default function AirborneStudioRoute() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  if (!id) return null;

  return <AirborneStudio pageId={id} />;
}
