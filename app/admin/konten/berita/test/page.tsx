"use client";

import { useState } from "react";

export default function TestBeritaPage() {
  const [result, setResult] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const testSubmit = async () => {
    setIsLoading(true);
    setResult("Testing...");

    try {
      const testData = {
        title: "Test Berita " + Date.now(),
        content: "Ini adalah konten test berita untuk testing API.",
        excerpt: "Test excerpt",
        category: "Umum",
        status: "draft",
      };

      setResult("Sending: " + JSON.stringify(testData, null, 2));

      const response = await fetch("/api/berita", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(testData),
      });

      const responseData = await response.json();
      
      setResult(
        `Status: ${response.status}\n` +
        `OK: ${response.ok}\n` +
        `Response: ${JSON.stringify(responseData, null, 2)}`
      );
    } catch (error) {
      setResult(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Test Berita API</h1>
      
      <button
        onClick={testSubmit}
        disabled={isLoading}
        className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
      >
        {isLoading ? "Testing..." : "Test Create Berita"}
      </button>

      <div className="bg-gray-100 p-4 rounded-lg">
        <pre className="whitespace-pre-wrap text-sm">{result || "Klik tombol untuk test"}</pre>
      </div>
    </div>
  );
}
