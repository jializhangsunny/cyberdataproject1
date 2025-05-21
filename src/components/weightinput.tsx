import React from 'react';

interface WeightInputProps {
  w1: number;
  w2: number;
  setW1: (val: number) => void;
  setW2: (val: number) => void;
}

function WeightInput({ w1, w2, setW1, setW2 }: WeightInputProps) {
  const handleW1Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = parseFloat(e.target.value);
    if (isNaN(val)) val = 0;
    if (val < 0) val = 0;
    if (val > 1) val = 1;
    setW1(val);
    setW2(1 - val);
  };

  const handleW2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = parseFloat(e.target.value);
    if (isNaN(val)) val = 0;
    if (val < 0) val = 0;
    if (val > 1) val = 1;
    setW2(val);
    setW1(1 - val);
  };

  return (
    <div className="mb-4">
      <div className="flex justify-center">
       <p className="text-xl font-semibold mt-2"> Weights (w1 + w2 = {w1 + w2} )</p>
         </div>
      <label className="block mb-2">
        Sophistication Weight (w1)
        <input
          type="number"
          step="0.1"
          min="0"
          max="1"
          value={w1}
          onChange={handleW1Change}
          className="ml-2 p-1 text-blue-400 "
        />
      </label>
      <label className="block">
        Resource Weight (w2)
        <input
          type="number"
          step="0.1"
          min="0"
          max="1"
          value={w2}
          onChange={handleW2Change}
          className="ml-2 p-1 text-blue-400"
        />
      </label>
    </div>

  );
}

export default WeightInput;
