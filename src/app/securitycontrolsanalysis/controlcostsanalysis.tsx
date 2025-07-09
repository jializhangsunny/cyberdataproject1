"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import controlCostAnalysisService from '@/services/controlCostAnalysis';

export type CostKey = "purchase" | "operational" | "training" | "manpower";

export type CostItem = {
  id?: string;
  control: string;
  purchaseCost: number;
  operationalCost: number;
  trainingCost: number;
  manpowerCost: number;
  totalCost?: number;
};

interface Props {
  controls: string[];
  userId: string;
  organizationId: string;
  loading?: boolean;
}

const ControlCostsAnalysis: React.FC<Props> = ({ 
  controls, 
  userId, 
  organizationId, 
  loading = false 
}) => {
  const [costData, setCostData] = useState<CostItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const loadCostData = async () => {
      // Only run if we have the required data
      if (!userId || !organizationId || controls.length === 0) {
        console.log('⏸️ Skipping cost data load - missing required data:', {
          userId: !!userId,
          organizationId: !!organizationId,
          controlsCount: controls.length
        });
        setDataLoading(false);
        return;
      }

      setDataLoading(true);
      console.log('🔍 Loading cost data...');

      try {
        // Get existing cost analyses for this organization
        const existingData = await controlCostAnalysisService.getByOrganization(organizationId);
        console.log('📦 Existing cost analyses:', existingData);

        // Create initial data structure for all controls
        const initialData: CostItem[] = [];

        controls.forEach(control => {
          // Check if we already have cost analysis for this control
          const existing = existingData.analyses?.find(
            (analysis: any) => 
              analysis.controlName === control &&
              analysis.user?.id === userId
          );

          if (existing) {
            console.log(`✅ Found existing cost analysis: ${control}`);
            // Use existing data
            const totalCost = existing.purchaseCost + existing.operationalCost + 
                             existing.trainingCost + existing.manpowerCost;
            initialData.push({
              id: existing.id,
              control: control,
              purchaseCost: existing.purchaseCost,
              operationalCost: existing.operationalCost,
              trainingCost: existing.trainingCost,
              manpowerCost: existing.manpowerCost,
              totalCost: totalCost
            });
          } else {
            console.log(`➕ Creating empty entry: ${control}`);
            // Create empty entry for new controls
            initialData.push({
              control: control,
              purchaseCost: 0,
              operationalCost: 0,
              trainingCost: 0,
              manpowerCost: 0,
              totalCost: 0
            });
          }
        });

        console.log('📊 Final cost data loaded:', initialData);
        setCostData(initialData);

      } catch (error) {
        console.error('❌ Error loading cost data:', error);
        
        // Create empty structure on error
        const emptyData: CostItem[] = controls.map(control => ({
          control: control,
          purchaseCost: 0,
          operationalCost: 0,
          trainingCost: 0,
          manpowerCost: 0,
          totalCost: 0
        }));
        setCostData(emptyData);
      } finally {
        setDataLoading(false);
      }
    };

    loadCostData();
  }, [controls, userId, organizationId]);

  // Handle input changes
  const handleInputChange = (control: string, field: CostKey, value: number) => {
    setCostData(prev => prev.map(item => {
      if (item.control === control) {
        const updated = { ...item };
        
        // Map the field names
        switch (field) {
          case 'purchase':
            updated.purchaseCost = value;
            break;
          case 'operational':
            updated.operationalCost = value;
            break;
          case 'training':
            updated.trainingCost = value;
            break;
          case 'manpower':
            updated.manpowerCost = value;
            break;
        }
        
        // Recalculate total cost
        updated.totalCost = updated.purchaseCost + updated.operationalCost + 
                           updated.trainingCost + updated.manpowerCost;
        return updated;
      }
      return item;
    }));
  };

  // Get cost data for specific control
  const getCostDataForControl = (control: string) => {
    return costData.find(item => item.control === control);
  };

  // Save all changes
  const handleSaveAll = async () => {
    setSaving(true);
    try {
      for (const item of costData) {
        // Only save if any cost is greater than 0
        if (item.purchaseCost > 0 || item.operationalCost > 0 || 
            item.trainingCost > 0 || item.manpowerCost > 0) {
          
          if (item.id) {
            // Update existing
            await controlCostAnalysisService.update(item.id, {
              controlName: item.control,
              purchaseCost: item.purchaseCost,
              operationalCost: item.operationalCost,
              trainingCost: item.trainingCost,
              manpowerCost: item.manpowerCost
            });
          } else {
            // Create new
            const response = await controlCostAnalysisService.create({
              userId: userId,
              organizationId: organizationId,
              controlName: item.control,
              purchaseCost: item.purchaseCost,
              operationalCost: item.operationalCost,
              trainingCost: item.trainingCost,
              manpowerCost: item.manpowerCost
            });
            
            // Update local state with the new ID
            setCostData(prev => prev.map(prevItem => 
              prevItem.control === item.control
                ? { ...prevItem, id: response.id }
                : prevItem
            ));
          }
        }
      }
      console.log('✅ All cost analyses saved successfully');
    } catch (error) {
      console.error('❌ Error saving cost analyses:', error);
    } finally {
      setSaving(false);
    }
  };

  if (dataLoading) {
    return (
      <Card className="bg-gray-300 text-black p-6">
        <h2 className="text-xl font-semibold mb-4">Control Costs Analysis</h2>
        <div className="text-center py-4">Loading cost analysis data...</div>
      </Card>
    );
  }

  if (controls.length === 0) {
    return (
      <Card className="bg-gray-300 text-black p-6">
        <h2 className="text-xl font-semibold mb-4">Control Costs Analysis</h2>
        <div className="text-center py-4 text-gray-600">
          No controls found. Please add controls first.
        </div>
      </Card>
    );
  }

  const grandTotal = costData.reduce((sum, item) => sum + (item.totalCost || 0), 0);

  return (
    <Card className="bg-gray-300 text-black p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Control Costs Analysis</h2>
        <button
          onClick={handleSaveAll}
          disabled={saving}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400"
        >
          {saving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>

      <p className="mb-4">
        <strong>Total Controls:</strong> {controls.length}
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-400">
          <thead className="bg-gray-200 text-black">
            <tr>
              <th className="p-2 border">Control Name</th>
              <th className="p-2 border">Purchase Cost ($M)</th>
              <th className="p-2 border">Operational Cost ($M)</th>
              <th className="p-2 border">Training Cost ($M)</th>
              <th className="p-2 border">Manpower Cost ($M)</th>
              <th className="p-2 border">Total Cost ($M)</th>
            </tr>
          </thead>
          <tbody>
            {controls.map((control) => {
              const costItem = getCostDataForControl(control);
              
              return (
                <tr key={control}>
                  <td className="p-2 border font-medium">{control}</td>
                  
                  {/* Purchase Cost */}
                  <td className="p-2 border">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={costItem?.purchaseCost || 0}
                      onChange={(e) => handleInputChange(
                        control,
                        'purchase',
                        parseFloat(e.target.value) || 0
                      )}
                      className="w-full px-2 py-1 border rounded text-center"
                    />
                  </td>
                  
                  {/* Operational Cost */}
                  <td className="p-2 border">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={costItem?.operationalCost || 0}
                      onChange={(e) => handleInputChange(
                        control,
                        'operational',
                        parseFloat(e.target.value) || 0
                      )}
                      className="w-full px-2 py-1 border rounded text-center"
                    />
                  </td>
                  
                  {/* Training Cost */}
                  <td className="p-2 border">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={costItem?.trainingCost || 0}
                      onChange={(e) => handleInputChange(
                        control,
                        'training',
                        parseFloat(e.target.value) || 0
                      )}
                      className="w-full px-2 py-1 border rounded text-center"
                    />
                  </td>
                  
                  {/* Manpower Cost */}
                  <td className="p-2 border">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={costItem?.manpowerCost || 0}
                      onChange={(e) => handleInputChange(
                        control,
                        'manpower',
                        parseFloat(e.target.value) || 0
                      )}
                      className="w-full px-2 py-1 border rounded text-center"
                    />
                  </td>
                  
                  {/* Total Cost (calculated) */}
                  <td className="p-2 border font-bold bg-green-50">
                    {costItem?.totalCost?.toFixed(2) || '0.00'}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-gray-100">
            <tr>
              <td className="p-2 border font-bold">GRAND TOTAL</td>
              <td className="p-2 border"></td>
              <td className="p-2 border"></td>
              <td className="p-2 border"></td>
              <td className="p-2 border"></td>
              <td className="p-2 border font-bold bg-green-100">
                ${grandTotal.toFixed(2)}M
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="mt-4 text-sm text-gray-700">
        <p><strong>Note:</strong> All costs are in millions of dollars ($M)</p>
        <p>Total Cost = Purchase Cost + Operational Cost + Training Cost + Manpower Cost</p>
        <p>Values are automatically saved when you click "Save All Changes"</p>
      </div>
    </Card>
  );
};

export default ControlCostsAnalysis;