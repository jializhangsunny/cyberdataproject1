import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import controlInteractionEffectsService from '@/services/controlInteractionEffects';
import { 
  InteractionMatrix, 
  InteractionMatrixResponse, 
  InteractionEffectsAnalysisProps 
} from '@/types/interactionEffects';

const InteractionEffectsAnalysis: React.FC<InteractionEffectsAnalysisProps> = ({ 
  controls, 
  organizationId, 
  userId, 
  loading = false 
}) => {
  const [interactionMatrix, setInteractionMatrix] = useState<InteractionMatrix>({});
  const [matrixData, setMatrixData] = useState<InteractionMatrixResponse | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingCell, setEditingCell] = useState<{row: string, col: string} | null>(null);
  const [editingValue, setEditingValue] = useState<string>('');

  useEffect(() => {
    loadInteractionMatrix();
  }, [controls, organizationId]);

  const loadInteractionMatrix = async () => {
    if (!organizationId || !controls || controls.length === 0) {
      setDataLoading(false);
      return;
    }

    setDataLoading(true);
    try {
      const response = await controlInteractionEffectsService.getInteractionMatrix(
        organizationId,
        controls
      );
      setMatrixData(response);
      setInteractionMatrix(response.interactionMatrix);
    } catch (error) {
      console.error('Error loading interaction matrix:', error);
      // Initialize empty matrix on error
      initializeEmptyMatrix();
    } finally {
      setDataLoading(false);
    }
  };

  const initializeEmptyMatrix = () => {
    const matrix: InteractionMatrix = {};
    controls.forEach(controlA => {
      matrix[controlA] = {};
      controls.forEach(controlB => {
        if (controlA === controlB) {
          matrix[controlA][controlB] = null;
        } else {
          matrix[controlA][controlB] = 0;
        }
      });
    });
    setInteractionMatrix(matrix);
  };

  const handleCellClick = (rowControl: string, colControl: string) => {
    if (rowControl === colControl) return; // Don't edit diagonal cells
    
    const currentValue = interactionMatrix[rowControl]?.[colControl] || 0;
    setEditingCell({ row: rowControl, col: colControl });
    setEditingValue(currentValue.toString());
  };

  const handleCellEdit = (value: string) => {
    // Allow empty string for typing
    if (value === '') {
      setEditingValue('');
      return;
    }
    
    // Parse the value and clamp it between 0 and 1
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      // Don't clamp while typing, let user type freely
      setEditingValue(value);
    }
  };

  const handleCellSave = async () => {
    if (!editingCell) return;

    // Clamp value between 0 and 1 when saving
    const numValue = parseFloat(editingValue) || 0;
    const newValue = Math.max(0, Math.min(1, numValue));
    
    // Update local state immediately for better UX
    setInteractionMatrix(prev => ({
      ...prev,
      [editingCell.row]: {
        ...prev[editingCell.row],
        [editingCell.col]: newValue
      },
      [editingCell.col]: {
        ...prev[editingCell.col],
        [editingCell.row]: newValue
      }
    }));

    setSaving(true);
    try {
      await updateInteractionEffect(editingCell.row, editingCell.col, newValue);
      setEditingCell(null);
      setEditingValue('');
    } catch (error) {
      console.error('Error saving interaction effect:', error);
      // Revert to original value on error
      const originalValue = matrixData?.interactionMatrix[editingCell.row]?.[editingCell.col] || 0;
      setInteractionMatrix(prev => ({
        ...prev,
        [editingCell.row]: {
          ...prev[editingCell.row],
          [editingCell.col]: originalValue
        },
        [editingCell.col]: {
          ...prev[editingCell.col],
          [editingCell.row]: originalValue
        }
      }));
      setEditingCell(null);
      setEditingValue('');
    } finally {
      setSaving(false);
    }
  };

  const handleCellCancel = () => {
    setEditingCell(null);
    setEditingValue('');
  };

  const updateInteractionEffect = async (controlA: string, controlB: string, value: number) => {
    try {
      // Always store with alphabetical order
      const [sortedA, sortedB] = [controlA, controlB].sort();
      
      await controlInteractionEffectsService.createOrUpdate({
        organizationId,
        controlA: sortedA,
        controlB: sortedB,
        interactionEffect: value,
        userId
      });
      
      // Update local state (symmetric)
      setInteractionMatrix(prev => ({
        ...prev,
        [controlA]: {
          ...prev[controlA],
          [controlB]: value
        },
        [controlB]: {
          ...prev[controlB],
          [controlA]: value
        }
      }));
      
    } catch (error) {
      console.error('Error updating interaction effect:', error);
      throw error;
    }
  };

  const getInteractionColor = (value: number | null) => {
    if (value === null) return 'bg-gray-200';
    if (value >= 0.8) return 'bg-green-300';
    if (value >= 0.6) return 'bg-green-200';
    if (value >= 0.4) return 'bg-green-100';
    if (value >= 0.2) return 'bg-blue-100';
    if (value > 0) return 'bg-blue-50';
    return 'bg-white';
  };

  const getInteractionDescription = (value: number | null) => {
    if (value === null) return '';
    if (value >= 0.8) return 'Very Strong';
    if (value >= 0.6) return 'Strong';
    if (value >= 0.4) return 'Moderate';
    if (value >= 0.2) return 'Weak';
    if (value > 0) return 'Minimal';
    return 'None';
  };

  const isEditingCell = (rowControl: string, colControl: string) => {
    return editingCell?.row === rowControl && editingCell?.col === colControl;
  };

  const isUpperTriangle = (rowControl: string, colControl: string) => {
    const rowIndex = controls.indexOf(rowControl);
    const colIndex = controls.indexOf(colControl);
    return rowIndex < colIndex;
  };

  if (loading || dataLoading) {
    return (
      <Card className="bg-gray-300 text-black p-6">
        <h2 className="text-xl font-semibold mb-4">Interaction Effect Analysis of Controls</h2>
        <div className="text-center py-4">Loading interaction effects...</div>
      </Card>
    );
  }

  if (!controls || controls.length < 2) {
    return (
      <Card className="bg-gray-300 text-black p-6">
        <h2 className="text-xl font-semibold mb-4">Interaction Effect Analysis of Controls</h2>
        <div className="text-center py-4 text-gray-600">
          Need at least 2 controls to analyze interactions.
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-300 text-black p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Interaction Effect Analysis of Controls</h2>
        {saving && <span className="text-blue-600 text-sm">Saving...</span>}
      </div>
      
      <p className="mb-4 text-sm">
        <strong>Note:</strong> Values range from 0 (no interaction) to 1 (perfect synergy). 
        Click on the upper triangle cells to edit values.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-400">
          <thead>
            <tr>
              <th className="p-2 border bg-gray-200">Interaction Effect</th>
              {controls.map(control => (
                <th key={control} className="p-2 border bg-gray-200 text-center min-w-24">
                  <div className="whitespace-nowrap text-xs">
                    {control}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {controls.map(rowControl => (
              <tr key={rowControl}>
                <td className="p-2 border bg-gray-200 font-medium text-left">
                  <div className="max-w-32 text-xs" title={rowControl}>
                    {rowControl}
                  </div>
                </td>
                {controls.map(colControl => {
                  const value = interactionMatrix[rowControl]?.[colControl];
                  const isSelf = rowControl === colControl;
                  const isUpperTri = isUpperTriangle(rowControl, colControl);
                  const isEditing = isEditingCell(rowControl, colControl);
                  
                  return (
                    <td
                      key={colControl}
                      className={`p-1 border text-center ${getInteractionColor(value)} ${
                        isUpperTri ? 'cursor-pointer hover:ring-2 hover:ring-blue-400' : ''
                      }`}
                      onClick={() => isUpperTri && handleCellClick(rowControl, colControl)}
                    >
                      {isSelf || !isUpperTri ? (
                        <span className="text-gray-500">-</span>
                      ) : isEditing ? (
                        <div className="flex flex-col gap-1">
                          <input
                            type="number"
                            min="0"
                            max="1"
                            step="0.1"
                            value={editingValue}
                            onChange={(e) => handleCellEdit(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleCellSave();
                              } else if (e.key === 'Escape') {
                                e.preventDefault();
                                handleCellCancel();
                              }
                            }}
                            className="w-full text-center text-xs p-1 border rounded [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            autoFocus
                          />
                          <div className="flex gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCellSave();
                              }}
                              className="px-1 py-0.5 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                            >
                              ✓
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCellCancel();
                              }}
                              className="px-1 py-0.5 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs">
                          <div className="font-semibold">{(value || 0).toFixed(1)}</div>
                          <div className="text-xs text-gray-600">
                            {getInteractionDescription(value)}
                          </div>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-300 border"></div>
          <span>Very Strong (0.8-1.0)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-200 border"></div>
          <span>Strong (0.6-0.8)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-100 border"></div>
          <span>Moderate (0.4-0.6)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-100 border"></div>
          <span>Weak (0.2-0.4)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-50 border"></div>
          <span>Minimal (0-0.2)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-white border"></div>
          <span>None (0)</span>
        </div>
      </div>
    </Card>
  );
};

export default InteractionEffectsAnalysis;