"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { grammarApi } from "@/services/learning.api";

// Helper Interface for Form State
interface ExerciseForm {
  section: string;
  question: string;
  answer: string;
  type: string;
  order: number;
  options: string; // JSON string for editing
}

export default function AdminUnitEditorPage() {
  const params = useParams();
  const unitId = params.unitId as string;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Unit Fields
  const [title, setTitle] = useState("");
  const [order, setOrder] = useState(0);
  const [theoryContent, setTheoryContent] = useState("");
  
  // Exercises
  const [exercises, setExercises] = useState<ExerciseForm[]>([]);

  useEffect(() => {
    fetchUnit();
  }, [unitId]);

  const fetchUnit = async () => {
    try {
      setLoading(true);
      const data = await grammarApi.getAdminUnit(unitId);
      setTitle(data.title);
      setOrder(data.order);
      setTheoryContent(data.theoryContent || "");
      
      // Transform raw exercises to form state
      if (data.exercises && Array.isArray(data.exercises)) {
          const formExercises = data.exercises.map(ex => ({
              section: ex.section,
              question: ex.question,
              answer: ex.answer,
              type: ex.type,
              order: ex.order,
              options: JSON.stringify(ex.options || {}, null, 2)
          }));
           // Sort by order
          formExercises.sort((a, b) => a.order - b.order);
          setExercises(formExercises);
      }
    } catch (error) {
      console.error("Failed to fetch unit", error);
      alert("Failed to load unit");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Parse options JSON
      const parsedExercises = exercises.map(ex => {
          let options = {};
          try {
              options = JSON.parse(ex.options);
          } catch (e) {
              console.error("Invalid JSON in options", e);
              // Fallback or error?
          }
          return {
              ...ex,
              options
          };
      });

      await grammarApi.updateUnit(unitId, {
        title,
        order,
        theoryContent,
        exercises: parsedExercises
      });
      alert("Unit saved successfully!");
    } catch (error) {
      console.error("Failed to save unit", error);
      alert("Failed to save unit");
    } finally {
      setSaving(false);
    }
  };

  const addExercise = () => {
      setExercises([
          ...exercises,
          {
              section: "general",
              question: "",
              answer: "",
              type: "fill_blank",
              order: exercises.length + 1,
              options: "{}"
          }
      ]);
  };

  const removeExercise = (index: number) => {
      const newEx = [...exercises];
      newEx.splice(index, 1);
      setExercises(newEx);
  };

  const updateExercise = (index: number, field: keyof ExerciseForm, value: any) => {
      const newEx = [...exercises];
      newEx[index] = { ...newEx[index], [field]: value };
      setExercises(newEx);
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="flex items-center gap-4 mb-6 sticky top-0 bg-gray-50 py-4 z-10 border-b border-gray-200">
        <button onClick={() => router.back()} className="text-gray-500 hover:text-black">
          ← Back
        </button>
        <h2 className="text-2xl font-bold flex-1">
            Edit Unit
        </h2>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="space-y-8">
        {/* Basic Info */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-lg mb-4">Basic Info</h3>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                    <input
                        type="number"
                        value={order}
                        onChange={(e) => setOrder(parseInt(e.target.value))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                </div>
            </div>
        </div>

        {/* Theory Content */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-lg mb-4">Theory Content (HTML)</h3>
            <textarea
                value={theoryContent}
                onChange={(e) => setTheoryContent(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono text-sm h-64"
                placeholder="<h1>Title</h1><p>Content...</p>"
            />
        </div>

        {/* Exercises */}
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-xl">Exercises ({exercises.length})</h3>
                <button
                    onClick={addExercise}
                    className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900"
                >
                    + Add Exercise
                </button>
            </div>

            {exercises.map((ex, index) => (
                <div key={index} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative">
                    <button
                        onClick={() => removeExercise(index)}
                        className="absolute top-4 right-4 text-red-500 hover:text-red-700"
                    >
                        Remove
                    </button>
                    <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-1">
                            <label className="block text-xs font-bold text-gray-500 mb-1">Order</label>
                            <input
                                type="number"
                                value={ex.order}
                                onChange={(e) => updateExercise(index, 'order', parseInt(e.target.value))}
                                className="w-full border border-gray-300 rounded px-2 py-1"
                            />
                        </div>
                        <div className="col-span-2">
                             <label className="block text-xs font-bold text-gray-500 mb-1">Type</label>
                            <select
                                value={ex.type}
                                onChange={(e) => updateExercise(index, 'type', e.target.value)}
                                className="w-full border border-gray-300 rounded px-2 py-1 bg-white"
                            >
                                <option value="fill_blank">Fill Blank</option>
                                <option value="match">Match</option>
                                <option value="rewrite">Rewrite</option>
                            </select>
                        </div>
                        <div className="col-span-3">
                            <label className="block text-xs font-bold text-gray-500 mb-1">Section Header (ID)</label>
                            <input
                                type="text"
                                value={ex.section}
                                onChange={(e) => updateExercise(index, 'section', e.target.value)}
                                className="w-full border border-gray-300 rounded px-2 py-1"
                                placeholder="e.g. section-A"
                            />
                        </div>
                        <div className="col-span-6">
                            <label className="block text-xs font-bold text-gray-500 mb-1">
                                Question {ex.type === 'fill_blank' && '(Use ________ for blanks)'}
                            </label>
                            <input
                                type="text"
                                value={ex.question}
                                onChange={(e) => updateExercise(index, 'question', e.target.value)}
                                className="w-full border border-gray-300 rounded px-2 py-1 font-mono"
                            />
                        </div>
                        
                         <div className="col-span-6">
                            <label className="block text-xs font-bold text-gray-500 mb-1">Answer</label>
                            <input
                                type="text"
                                value={ex.answer}
                                onChange={(e) => updateExercise(index, 'answer', e.target.value)}
                                className="w-full border border-gray-300 rounded px-2 py-1 font-mono text-green-700"
                            />
                        </div>
                         <div className="col-span-6">
                            <label className="block text-xs font-bold text-gray-500 mb-1">Options (JSON)</label>
                            <textarea
                                value={ex.options}
                                onChange={(e) => updateExercise(index, 'options', e.target.value)}
                                className="w-full border border-gray-300 rounded px-2 py-1 font-mono text-xs h-20"
                                placeholder='{"instruction": "...", "verbs": []}'
                            />
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}
