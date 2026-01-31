"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { grammarApi } from "@/services/learning.api";
import { GrammarUnitWithContent } from "@/types";
import GrammarLessonClient from "./GrammarLessonClient";

export default function UnitPage() {
  const params = useParams();
  const topicSlug = params.topicSlug as string;
  const lessonSlug = params.lessonSlug as string; // This is the unit ID
  
  const [unit, setUnit] = useState<GrammarUnitWithContent | null>(null);
  const [loading, setLoading] = useState(true);

  // In the migrated version, lessonSlug IS the unit ID (UUID)
  const unitId = lessonSlug;

  useEffect(() => {
    const fetchUnit = async () => {
        try {
            const data = await grammarApi.getUnit(unitId);
            setUnit(data);
        } catch (error) {
            console.error("Failed to fetch unit", error);
        } finally {
            setLoading(false);
        }
    }
    if (unitId) fetchUnit();
  }, [unitId]);
  
  if (loading) {
     return (
      <div className="container mx-auto max-w-screen-xl px-4 py-8 flex justify-center items-center min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-[#FFC600] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!unit) {
    return notFound();
  }

  const backLink = `/grammar/${topicSlug}`;

  return (
    <div className="container mx-auto max-w-screen-xl px-4 py-8">
      <Link href={backLink} className="inline-flex items-center text-gray-500 hover:text-black mb-6 transition-colors font-medium">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Units
      </Link>

      <GrammarLessonClient
        topicName={unit.book?.name || "Grammar Book"}
        topicSlug={topicSlug}
        unitId={unit.id}
        unitTitle={unit.title}
        initialData={{
            theory: unit.theoryContent || '<p>No content available.</p>',
            exercises: unit.exercises || []
        }}
      />
    </div>
  );
}
