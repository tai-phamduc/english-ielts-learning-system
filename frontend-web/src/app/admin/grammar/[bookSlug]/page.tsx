"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { grammarApi } from "@/services/learning.api";
import { GrammarBookWithUnits } from "@/types";

export default function AdminBookUnitsPage() {
  const params = useParams();
  const bookSlug = params.bookSlug as string;
  const router = useRouter();
  const [book, setBook] = useState<GrammarBookWithUnits | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBook();
  }, [bookSlug]);

  const fetchBook = async () => {
    try {
      setLoading(true);
      const data = await grammarApi.getBook(bookSlug);
      setBook(data);
    } catch (error) {
      console.error("Failed to fetch book", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUnit = async (id: string) => {
    if (!confirm("Are you sure you want to delete this unit?")) return;
    try {
      await grammarApi.deleteUnit(id);
      fetchBook();
    } catch (error) {
      console.error("Failed to delete unit", error);
    }
  };

  const handleCreateUnit = async () => {
    const title = prompt("Enter Unit Title:");
    if (!title) return;
    const order = parseInt(prompt("Enter Unit Order (number):") || "0");

    try {
      if (!book) return;
      await grammarApi.createUnit({
        bookId: book.id,
        title,
        order,
      });
      fetchBook();
    } catch (error) {
      console.error("Failed to create unit", error);
      alert("Failed to create unit");
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!book) return <div className="p-8">Book not found</div>;

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/grammar" className="text-gray-500 hover:text-black">
          ← Back to Books
        </Link>
        <h2 className="text-2xl font-bold">
            {book.name} <span className="text-gray-400 font-normal">/ Units</span>
        </h2>
        <div className="flex-1"></div>
        <button
          onClick={handleCreateUnit}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          + Create Unit
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-sm uppercase">
            <tr>
              <th className="px-6 py-4 font-medium w-20">Order</th>
              <th className="px-6 py-4 font-medium">Title</th>
              <th className="px-6 py-4 font-medium w-48 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {book.units?.map((unit) => (
              <tr key={unit.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-mono text-gray-500">{unit.order}</td>
                <td className="px-6 py-4 font-medium text-gray-900">
                    {unit.title}
                </td>
                <td className="px-6 py-4 text-right space-x-3">
                  <Link
                    href={`/admin/grammar/unit/${unit.id}`}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Edit Content
                  </Link>
                  <button
                    onClick={() => handleDeleteUnit(unit.id)}
                    className="text-red-500 hover:text-red-700 font-medium"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {(!book.units || book.units.length === 0) && (
                <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-gray-400">
                        No units found.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
