"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { grammarApi } from "@/services/learning.api";
import { GrammarBook } from "@/types";
import UnitListClient from "./UnitListClient";


export default function BookPage() {
  const params = useParams();
  const topicSlug = params.topicSlug as string;
  const [book, setBook] = useState<GrammarBook | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBook = async () => {
        try {
            const data = await grammarApi.getBook(topicSlug);
            setBook(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }
    if (topicSlug) fetchBook();
  }, [topicSlug]);


  if (loading) {
     return (
      <div className="container mx-auto max-w-screen-xl px-4 py-8 flex justify-center items-center min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-[#FFC600] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!book) {
    return notFound();
  }

  return (
    <div className="container mx-auto max-w-screen-xl px-4 py-8">

      <Link href="/grammar" className="inline-flex items-center text-gray-500 hover:text-black mb-6 transition-colors font-medium">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Grammar
      </Link>

      {/* Header */}
      <h2 className="text-3xl font-bold mb-8 text-gray-800">{book.name}</h2>

      {/* Unit List */}
      <UnitListClient
        units={book.units || []}
        topicSlug={topicSlug}
        bookColor={book.color}
        bookLevel={book.level}
      />
    </div>
  );
}
