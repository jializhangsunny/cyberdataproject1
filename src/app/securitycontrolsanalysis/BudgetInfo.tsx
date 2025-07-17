import React, { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import budgetService from '@/services/userBudget';

interface BudgetInfoProps {
  userId: string | undefined;
  organizationId: string | undefined;
  onBudgetUpdate?: () => void;
  refreshTrigger?: number; 
}

const BudgetInfo: React.FC<BudgetInfoProps> = ({ 
  userId, 
  organizationId,
  onBudgetUpdate,
  refreshTrigger
}) => {
  const [budgetData, setBudgetData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [newBudget, setNewBudget] = useState<string>('');
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch budget analysis
  const fetchBudgetAnalysis = async () => {
    if (!userId || !organizationId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const analysis = await budgetService.getBudgetAnalysis(userId, organizationId);
      setBudgetData(analysis);
      setNewBudget(analysis.totalBudget.toString());
    } catch (err: any) {
      console.error('Error fetching budget analysis:', err);
      
      // If no budget found, try to get just the budget
      if (err.response?.status === 404) {
        try {
          const budget = await budgetService.getUserBudget(userId, organizationId);
          setBudgetData({
            totalBudget: budget.totalBudget,
            totalSelectedCost: 0,
            remainingBudget: budget.totalBudget,
            budgetUtilization: 0,
            isOverBudget: false,
            budgetStatus: 'Within Budget',
            selectedControlsCount: 0
          });
          setNewBudget(budget.totalBudget.toString());
        } catch (innerErr) {
          // No budget exists at all
          setBudgetData(null);
          setError('No budget set. Please set a budget.');
        }
      } else {
        setError('Failed to load budget information');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgetAnalysis();
  }, [userId, organizationId, refreshTrigger]);

  // Handle budget update
  const handleUpdateBudget = async () => {
    if (!userId || !organizationId) return;
    
    const budgetValue = parseFloat(newBudget);
    if (isNaN(budgetValue) || budgetValue < 0) {
      setError('Please enter a valid budget amount');
      return;
    }

    try {
      setUpdating(true);
      setError(null);
      await budgetService.setBudget(userId, organizationId, budgetValue);
      
      // Refresh the data
      await fetchBudgetAnalysis();
      setEditMode(false);
      
      // Call parent callback if provided
      if (onBudgetUpdate) {
        onBudgetUpdate();
      }
    } catch (err) {
      console.error('Error updating budget:', err);
      setError('Failed to update budget');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-gray-300 text-black p-6">
        <h2 className="text-xl font-semibold mb-4">Budget Information</h2>
        <div className="text-center py-4">Loading budget information...</div>
      </Card>
    );
  }

  if (!userId || !organizationId) {
    return (
      <Card className="bg-gray-300 text-black p-6">
        <h2 className="text-xl font-semibold mb-4">Budget Information</h2>
        <div className="text-center py-4 text-gray-600">
          User and organization information required
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-300 text-black p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Budget Information</h2>
        {!editMode && budgetData && (
          <button
            onClick={() => setEditMode(true)}
            className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
          >
            Edit Budget
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {!budgetData && !editMode && (
        <div className="space-y-4">
          <p className="text-gray-600">No budget has been set for this organization.</p>
          <button
            onClick={() => {
              setEditMode(true);
              setNewBudget('0');
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Set Budget
          </button>
        </div>
      )}

      {editMode && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Total Budget ($M)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min="0"
                step="0.01"
                value={newBudget}
                onChange={(e) => setNewBudget(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-md"
                placeholder="Enter budget in millions"
              />
              <button
                onClick={handleUpdateBudget}
                disabled={updating}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-400"
              >
                {updating ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => {
                  setEditMode(false);
                  setNewBudget(budgetData?.totalBudget?.toString() || '0');
                  setError(null);
                }}
                disabled={updating}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {budgetData && !editMode && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Budget</p>
              <p className="text-lg font-semibold">${budgetData.totalBudget.toFixed(2)}M</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Selected Controls Cost</p>
              <p className="text-lg font-semibold">${budgetData.totalSelectedCost.toFixed(2)}M</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Remaining Budget</p>
              <p className={`text-lg font-semibold ${
                budgetData.remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                ${budgetData.remainingBudget.toFixed(2)}M
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Budget Utilization</p>
              <p className="text-lg font-semibold">{budgetData.budgetUtilization.toFixed(1)}%</p>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-400">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Budget Status</p>
                <p className={`text-lg font-semibold ${
                  budgetData.budgetStatus === 'Within Budget' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {budgetData.budgetStatus}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Selected Controls</p>
                <p className="text-lg font-semibold">{budgetData.selectedControlsCount}</p>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all ${
                  budgetData.budgetUtilization <= 100 ? 'bg-green-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(budgetData.budgetUtilization, 100)}%` }}
              />
            </div>
            {budgetData.budgetUtilization > 100 && (
              <p className="text-xs text-red-600 mt-1">
                {(budgetData.budgetUtilization - 100).toFixed(1)}% over budget
              </p>
            )}
          </div>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-600">
        <p>All values are in millions of dollars ($M)</p>
      </div>
    </Card>
  );
};

export default BudgetInfo;