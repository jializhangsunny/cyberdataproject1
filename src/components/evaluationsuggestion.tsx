// components/EvaluationSuggestionModal.tsx
"use client";

import React, { useState } from "react";

const levelOptions = ["Very Low", "Low", "Moderate", "High", "Very High"] as const;
type Level = (typeof levelOptions)[number];

const levelValue: Record<Level, number> = {
  "Very Low": 0.1,
  "Low": 0.3,
  "Moderate": 0.5,
  "High": 0.7,
  "Very High": 0.9,
};

const EvaluationSuggestion = ({
  setShowModal,
}: {
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [weight, setWeight] = useState<number>(0.6);
  const [overlap, setOverlap] = useState<Level>("Moderate");
  const [synergy, setSynergy] = useState<Level>("Moderate");
  const [conflict, setConflict] = useState<Level>("Low");

  const interactionEffect = (
    weight *
    (levelValue[overlap] + levelValue[synergy] + levelValue[conflict])
  ).toFixed(2);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-gray-100 text-black p-6 rounded-lg max-w-3xl w-full">
        <h2 className="text-xl font-bold mb-4">Evaluation Suggestion</h2>
        <table className="w-full mb-4 text-sm border border-gray-300">
          <thead>
            <tr>
              <th className="p-2 border">Effect</th>
              <th className="p-2 border">Extent of the Effect</th>
              <th className="p-2 border">Weight</th>
              <th className="p-2 border">Overlap</th>
              <th className="p-2 border">Synergistic Effect</th>
              <th className="p-2 border">Conflict Impact</th>
              <th className="p-2 border">Interaction Effect</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2 border">Interaction Between Selected Controls</td>
              <td className="p-2 border">Qualitative</td>
              <td className="p-2 border">
                <input
                  type="number"
                  min={0}
                  max={1}
                  step={0.1}
                  value={weight}
                  onChange={(e) => setWeight(parseFloat(e.target.value))}
                  className="w-20 border p-1 rounded"
                />
              </td>
              {[overlap, synergy, conflict].map((val, idx) => (
                <td key={idx} className="p-2 border">
                  <select
                    value={val}
                    onChange={(e) => {
                      const value = e.target.value as Level;
                      if (idx === 0) setOverlap(value);
                      if (idx === 1) setSynergy(value);
                      if (idx === 2) setConflict(value);
                    }}
                    className="w-full border p-1 rounded"
                  >
                    {levelOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </td>
              ))}
              <td className="p-2 border">{interactionEffect}</td>
            </tr>
          </tbody>
        </table>

        <p className="text-sm mb-1">
          <strong>Interaction Effect</strong> = Weight × Overlap + Weight × Synergistic Effect + Weight × Conflict Impact
        </p>
        <p className="text-md font-bold">
          Total Interaction Effect: {interactionEffect}
        </p>

        <button
          onClick={() => setShowModal(false)}
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default EvaluationSuggestion;

