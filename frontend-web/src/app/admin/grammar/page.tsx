"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { grammarApi } from "@/services/learning.api";
import { GrammarBook } from "@/types";

export default function AdminGrammarBooksPage() {
  const [books, setBooks] = useState<GrammarBook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const data = await grammarApi.getBooks();
      setBooks(data);
    } catch (error) {
      console.error("Failed to fetch books", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this book?")) return;
    try {
      await grammarApi.deleteBook(id);
      fetchBooks();
    } catch (error) {
      console.error("Failed to delete book", error);
      alert("Failed to delete book");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Grammar Books</h2>
        <button
          onClick={() => alert("Create Book Dialog would open here (Simple Implementation for now)")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Create Book
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-sm uppercase">
              <tr>
                <th className="px-6 py-4 font-medium">Book Name</th>
                <th className="px-6 py-4 font-medium">Level</th>
                <th className="px-6 py-4 font-medium">Units</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {books.map((book) => (
                <tr key={book.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    <Link href={`/admin/grammar/${book.slug}`} className="hover:text-blue-600 block">
                        {book.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs font-bold text-gray-600 uppercase">
                      {book.level}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {book._count?.units || book.unitCount || 0} units
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                     <Link
                      href={`/admin/grammar/${book.slug}`}
                      className="text-blue-600 hover:underline text-sm font-medium"
                    >
                      Manage Units
                    </Link>
                    <button
                      onClick={() => handleDelete(book.id)}
                      className="text-red-500 hover:text-red-700 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {books.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                    No books found. Create one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
