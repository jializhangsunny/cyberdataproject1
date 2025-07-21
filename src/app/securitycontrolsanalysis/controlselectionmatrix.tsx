"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import controlSelectionMatrixService from '@/services/controlSelectionMatrix';
import controlInteractionEffectsService from '@/services/controlInteractionEffects';
import { 
  ControlSelectionData, 
  ControlSelectionMatrix,
  ControlSelectionMatrixProps 
} from '@/types/controlSelectionMatrix';

const ControlSelectionMatrixComponent: React.FC<ControlSelectionMatrixProps> = ({
  controls,
  userId,
  organizationId,
  riskData,
  costData,
  loading = false,
  onSelectionChange
}) => {
  const [selectionData, setSelectionData] = useState<ControlSelectionData[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [combinedSynergyEffect, setCombinedSynergyEffect] = useState(0);

  useEffect(() => {
    loadSelectionData();
    if (onSelectionChange) {
      onSelectionChange();
    }
  }, [controls, userId, organizationId, riskData, costData]);

  const loadSelectionData = async () => {
    if (!userId || !organizationId || !controls || controls.length === 0) {
      setDataLoading(false);
      return;
    }

    setDataLoading(true);
    try {
      // Get existing selections
      const existingSelections = await controlSelectionMatrixService.getByOrganization(organizationId);

      // Calculate data for each control
      const calculatedData: ControlSelectionData[] = await Promise.all(
        controls.map(async (controlName) => {
          // Get individual NRR for this control
          const individualNRR = riskData
            .filter(item => item.control === controlName)
            .reduce((sum, item) => sum + (item.nrr || 0), 0);

          // Get total cost for this control
          const controlCost = costData.find(item => item.control === controlName);
          const totalCost = controlCost ? 
            (controlCost.purchaseCost + controlCost.operationalCost + 
             controlCost.trainingCost + controlCost.manpowerCost) : 0;

          // Get individual interaction effect (sum of all interactions for this control)
          let individualInteractionEffect = 0;
          try {
            individualInteractionEffect = await controlInteractionEffectsService.getControlTotalInteractionEffect(
              organizationId,
              controlName,
              controls
            );
          } catch (error) {
            console.warn(`Failed to get interaction effect for ${controlName}:`, error);
          }

          // Calculate individual ROSI
          const individualROSI = totalCost > 0 ? 
            ((individualNRR * (1 + individualInteractionEffect)) - totalCost) / totalCost : 0;

          // Check if this control is selected
          const existingSelection = existingSelections.selections?.find(
            (selection: ControlSelectionMatrix) => 
              selection.controlName === controlName && selection.user?.id === userId
          );

          return {
            id: existingSelection?.id,
            controlName,
            includeInSet: existingSelection?.includeInSet || false,
            individualNRR,
            totalCost,
            individualInteractionEffect,
            individualROSI
          };
        })
      );

      setSelectionData(calculatedData);
    } catch (error) {
      console.error('Error loading selection data:', error);
      // Create empty data structure on error
      const emptyData: ControlSelectionData[] = controls.map(controlName => ({
        id: "",
        controlName,
        includeInSet: false,
        individualNRR: 0,
        totalCost: 0,
        individualInteractionEffect: 0,
        individualROSI: 0
      }));
      setSelectionData(emptyData);
    } finally {
      setDataLoading(false);
    }
  };

  const handleSelectionChange = async (controlName: string, includeInSet: boolean) => {
  
  // Update local state immediately
  setSelectionData(prev => prev.map(item => 
    item.controlName === controlName 
      ? { ...item, includeInSet }
      : item
  ));

  setSaving(true);
  try {
    const controlData = selectionData.find(item => item.controlName === controlName);
    if (controlData?.id) {
      // Update existing selection
      await controlSelectionMatrixService.update(controlData.id, {
        includeInSet
      });
    } else {
      // Create new selection
      const response = await controlSelectionMatrixService.create({
        userId,
        organizationId,
        controlName,
        includeInSet
      });
      
      // Update local state with new ID
      setSelectionData(prev => prev.map(item => 
        item.controlName === controlName 
          ? { ...item, id: response.id }
          : item
      ));
    }
    if (onSelectionChange) {
      onSelectionChange();
    }
  } catch (error: any) {
    console.error('❌ Error updating selection for:', controlName, error);
    console.error('Error details:', error.response?.data);
    // Revert local state on error
    setSelectionData(prev => prev.map(item => 
      item.controlName === controlName 
        ? { ...item, includeInSet: !includeInSet }
        : item
    ));
  } finally {
    setSaving(false);
  }
};


  // Calculate summary for selected controls
  const selectedControls = selectionData.filter(item => item.includeInSet);
  const totalSelectedCost = selectedControls.reduce((sum, item) => sum + item.totalCost, 0);
  const totalSelectedNRR = selectedControls.reduce((sum, item) => sum + item.individualNRR, 0);
  const totalSynergyEffect = selectedControls.reduce((sum, item) => sum + item.individualInteractionEffect, 0);
  const combinedROSI = totalSelectedCost > 0 ? 
  ((totalSelectedNRR * (1 + combinedSynergyEffect)) - totalSelectedCost) / totalSelectedCost : 0;

  useEffect(() => {
    const calculateCombinedSynergy = async () => {
      const selectedControlNames = selectedControls.map(item => item.controlName);
      
      if (selectedControlNames.length < 2) {
        setCombinedSynergyEffect(0);
        return;
      }
      
      try {
        const synergy = await controlInteractionEffectsService.calculateSynergyEffect(
          organizationId,
          selectedControlNames
        );
        setCombinedSynergyEffect(synergy);
      } catch (error) {
        console.error('Error calculating synergy effect:', error);
        setCombinedSynergyEffect(0);
      }
    };
  calculateCombinedSynergy();
  }, [selectedControls, organizationId]);

  if (loading || dataLoading) {
    return (
      <Card className="bg-gray-300 text-black p-6">
        <h2 className="text-xl font-semibold mb-4">Control Selection Matrix</h2>
        <div className="text-center py-4">Loading control selection data...</div>
      </Card>
    );
  }

  if (!controls || controls.length === 0) {
    return (
      <Card className="bg-gray-300 text-black p-6">
        <h2 className="text-xl font-semibold mb-4">Control Selection Matrix</h2>
        <div className="text-center py-4 text-gray-600">
          No controls found. Please add controls first.
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-300 text-black p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Control Selection Matrix</h2>
        {saving && <span className="text-blue-600 text-sm">Saving...</span>}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-400">
          <thead>
            <tr>
              <th className="p-2 border bg-gray-200">Metric</th>
              {controls.map(control => (
                <th key={control} className="p-2 border bg-gray-200 text-center min-w-32">
                  <div className="text-xs font-medium">
                    {/* {control.length > 20 ? `${control.substring(0, 20)}...` : control} */}
                    {control}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Include in Set Row */}
            <tr>
              <td className="p-2 border font-medium bg-gray-100">Include in Set</td>
              {controls.map(control => {
                const controlData = selectionData.find(item => item.controlName === control);
                return (
                  <td key={control} className="p-2 border text-center">
                    <select
                      value={controlData?.includeInSet ? "Yes" : "No"}
                      onChange={(e) => handleSelectionChange(control, e.target.value === "Yes")}
                      className="px-2 py-1 border rounded text-center text-xs"
                    >
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </td>
                );
              })}
            </tr>

            {/* Individual NRR Row */}
            <tr>
              <td className="p-2 border font-medium bg-gray-100">Individual NRR</td>
              {controls.map(control => {
                const controlData = selectionData.find(item => item.controlName === control);
                return (
                  <td key={control} className="p-2 border text-center">
                    {controlData?.individualNRR?.toFixed(2) || '0.00'}
                  </td>
                );
              })}
            </tr>

            {/* Total Cost Row */}
            <tr>
              <td className="p-2 border font-medium bg-gray-100">Total Cost ($M)</td>
              {controls.map(control => {
                const controlData = selectionData.find(item => item.controlName === control);
                return (
                  <td key={control} className="p-2 border text-center">
                    {controlData?.totalCost?.toFixed(2) || '0.00'}
                  </td>
                );
              })}
            </tr>

            {/* Individual Interaction Effect Row */}
            <tr>
              <td className="p-2 border font-medium bg-gray-100">Individual Interaction Effect</td>
              {controls.map(control => {
                const controlData = selectionData.find(item => item.controlName === control);
                return (
                  <td key={control} className="p-2 border text-center">
                    {controlData?.individualInteractionEffect?.toFixed(2) || '0.00'}
                  </td>
                );
              })}
            </tr>

            {/* Individual ROSI Row */}
            <tr>
              <td className="p-2 border font-medium bg-gray-100">Individual ROSI ($M)</td>
              {controls.map(control => {
                const controlData = selectionData.find(item => item.controlName === control);
                const rosi = controlData?.individualROSI || 0;
                return (
                  <td key={control} className={`p-2 border text-center font-bold ${
                    rosi >= 0 ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {rosi.toFixed(2)}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Selected Controls Summary */}
      {selectedControls.length > 0 && (
        <Card className="bg-blue-50 p-4 mt-4">
          <h3 className="font-semibold mb-2">Selected Controls Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium">Controls Selected:</span>
              <div className="text-blue-700">{selectedControls.length}</div>
            </div>
            <div>
              <span className="font-medium">Total Cost:</span>
              <div className="text-red-700">${totalSelectedCost.toFixed(2)}M</div>
            </div>
            <div>
              <span className="font-medium">Total NRR:</span>
              <div className="text-green-700">${totalSelectedNRR.toFixed(2)}M</div>
            </div>
            <div>
              <span className="font-medium">Interaction Effect:</span>
              <div className="text-purple-700">{combinedSynergyEffect.toFixed(2)}</div>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t">
            <span className="font-medium">ROCSI: </span>
            <span className={`font-bold text-lg ${combinedROSI >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              {combinedROSI.toFixed(2)} ($M)
            </span>
          </div>
        </Card>
      )}

      <div className="mt-4 text-sm text-gray-700">
        <p><strong>Formula:</strong> Individual ROSI = ((NRR × (1 + Individual Interaction Effect)) - Cost) / Cost</p>
        <p><strong>Note:</strong> Values are automatically saved when you change selections</p>
      </div>
    </Card>
  );
};

export default ControlSelectionMatrixComponent;