"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useAppContext } from "@/context/appcontext";
import { useAuth } from "@/context/authContext";
import OnboardingTour from "@/components/OnboardingTour";
import type { StepType } from "@reactour/tour";
import assetService from '../../services/assets'
import lossTypeService from '../../services/lossType';
import organizationService from '@/services/organizations'
import { OverlappingVulnerability } from "@/types/vulnerabilities";

const riskSteps : StepType[] = [
  { selector: "#tour-risk-filters", content: "Select existing asset of your organisation", position: "top" },
  { selector: "#primary-risk", content: "Review Primary Loss and edit assets", position: "top" },
  { selector: "#secondary-risk", content: "Review Secondary Loss", position: "top" },
  { selector: "#tour-risk-summary", content: "Total Risk summary" , position: "top"},
];

export default function RiskAnalysis() {
  const [assets, setAssets] = useState<any[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [editedName, setEditedName] = useState<string>("");
  const [editedValue, setEditedValue] = useState<number>(0);
  const [saving, setSaving] = useState<boolean>(false);
  const [totalPLM, setTotalPLM] = useState<number>(0);

  // Loss Types state
  const [lossTypes, setLossTypes] = useState<any[]>([]);
  const [lossTypesLoading, setLossTypesLoading] = useState<boolean>(true);
  const [editingLossType, setEditingLossType] = useState<string | null>(null);
  const [editedLossTypeValue, setEditedLossTypeValue] = useState<number>(0);
  const [newLossTypeName, setNewLossTypeName] = useState<string>("");
  const [newLossTypeValue, setNewLossTypeValue] = useState<number>(0);
  const [showAddNew, setShowAddNew] = useState<boolean>(false);
  const [overlappingVulnerabilities, setOverlappingVulnerabilities] = useState<OverlappingVulnerability>();

  const { totalLef, setTotalRisk } = useAppContext();
  const { user, logout } = useAuth();

  // Function to compute totalPLM for all assets in the organization
  const computeTotalPLM = (allAssets: any[]) => {
    return allAssets.reduce((sum: number, asset: any) => {
      const vulnerabilities = asset.vulnerabilities || [];
      const avgCVSS =
        vulnerabilities.length > 0
          ? vulnerabilities.reduce((acc: number, v: any) => acc + v.cvss, 0) / vulnerabilities.length
          : 0;
      const plm = asset.value * (avgCVSS / 10);
      return sum + plm;
    }, 0);
  };

  // Load assets from backend
  useEffect(() => {
    const loadAssets = async () => {
      try {
        if (user?.organization?.id && user?.id) {
          const response = await assetService.getForUser(user.organization.id, user.id);
          const assetsData = response.assets || [];
          setAssets(assetsData);
          
          // Calculate total PLM for all assets
          const total = computeTotalPLM(assetsData);
          setTotalPLM(total);
          
          if (assetsData.length > 0) {
            setSelectedAsset(assetsData[0]);
            setEditedName(assetsData[0].name);
            setEditedValue(assetsData[0].value);
          }
        }
        setLoading(false);
      } catch (err) {
        console.error('Failed to load assets:', err);
        setError('Failed to load assets');
        setLoading(false);
      }
    };

    loadAssets();
  }, [user]);

  // Load loss types from backend
  useEffect(() => {
    const loadLossTypes = async () => {
      try {
        if (user?.id) {
          const response = await lossTypeService.getForUser(user.id);
          setLossTypes(response.data || []);
        }
        setLossTypesLoading(false);
      } catch (err) {
        console.error('Failed to load loss types:', err);
        setLossTypesLoading(false);
      }
    };

    loadLossTypes();
  }, [user]);

  useEffect(() => {
    const loadOverlappingVulnerabilities = async () => {
      console.log(user, 'USER HE')
      try {
        if (user?.organization?.id) {
          const response = await organizationService.getOverlappingVulnerabilities(user.organization.id);
          setOverlappingVulnerabilities(response.overlappingVulnerabilities)
          
        }
      } catch (err) {
        console.error('Failed to fetch overlapping vulns:', err);
      }
    }
    loadOverlappingVulnerabilities();
  }, [user]);

  // Add a separate useEffect to log when overlappingVulnerabilities changes
useEffect(() => {
  console.log(overlappingVulnerabilities, 'OVERLAPPING VULNS UPDATED');
}, [overlappingVulnerabilities]);

  const handleAssetSelect = (assetId: string) => {
    const asset = assets.find(a => (a.id || a._id) === assetId);
    if (asset) {
      setSelectedAsset(asset);
      setEditedName(asset.name);
      setEditedValue(asset.value);
      setEditMode(false);
    }
  };

  const handleSaveAsset = async () => {
    if (!selectedAsset || !user?.id) return;

    // Validate inputs before saving
    if (!editedName || editedName.trim() === '') {
      setError('Asset name cannot be empty');
      return;
    }

    if (isNaN(editedValue) || editedValue < 0) {
      setError('Asset value must be a valid positive number');
      return;
    }

    setSaving(true);
    setError(null); // Clear any previous errors
    
    try {
      const updatedAsset = await assetService.update(selectedAsset.id || selectedAsset._id, {
        name: editedName.trim(),
        value: parseFloat(editedValue.toString()),
      });

      // Update the asset in the local state
      const updatedAssets = assets.map(asset => 
        (asset.id || asset._id) === (selectedAsset.id || selectedAsset._id) ? updatedAsset : asset
      );
      setAssets(updatedAssets);
      
      // Recalculate total PLM with updated assets
      const total = computeTotalPLM(updatedAssets);
      setTotalPLM(total);

      setSelectedAsset(updatedAsset);
      setEditMode(false);
    } catch (err: any) {
      console.error('Failed to save asset:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to save asset changes';
      setError(errorMessage);
      // Reset to original values on error
      setEditedName(selectedAsset.name);
      setEditedValue(selectedAsset.value);
    } finally {
      setSaving(false);
    }
  };

  // Loss Type handlers
  const handleEditLossType = (lossType: any) => {
    setEditingLossType(lossType.id);
    setEditedLossTypeValue(lossType.value);
  };

  const handleSaveLossType = async (lossTypeId: string) => {
    try {
      if (editedLossTypeValue < 0) {
        setError('Loss type value must be non-negative');
        return;
      }

      const response = await lossTypeService.update(lossTypeId, { value: editedLossTypeValue });
      
      // Update local state
      setLossTypes(prev => prev.map(lt => 
        lt.id === lossTypeId ? { ...lt, value: editedLossTypeValue } : lt
      ));
      
      setEditingLossType(null);
      setError(null);
    } catch (err: any) {
      console.error('Failed to update loss type:', err);
      setError('Failed to update loss type');
    }
  };

  const handleCancelEditLossType = () => {
    setEditingLossType(null);
    setEditedLossTypeValue(0);
  };

  const handleDeleteLossType = async (lossTypeId: string) => {
    if (window.confirm('Are you sure you want to delete this loss type?')) {
      try {
        await lossTypeService.remove(lossTypeId);
        setLossTypes(prev => prev.filter(lt => lt.id !== lossTypeId));
      } catch (err: any) {
        console.error('Failed to delete loss type:', err);
        setError('Failed to delete loss type');
      }
    }
  };

  const handleAddNewLossType = async () => {
    try {
      if (!newLossTypeName.trim()) {
        setError('Loss type name cannot be empty');
        return;
      }

      if (newLossTypeValue < 0) {
        setError('Loss type value must be non-negative');
        return;
      }

      const response = await lossTypeService.create({
        name: newLossTypeName.trim(),
        userId: user?.id,
        value: newLossTypeValue
      });

      setLossTypes(prev => [...prev, response.data]);
      setNewLossTypeName("");
      setNewLossTypeValue(0);
      setShowAddNew(false);
      setError(null);
    } catch (err: any) {
      console.error('Failed to create loss type:', err);
      const errorMessage = err.response?.data?.message || 'Failed to create loss type';
      setError(errorMessage);
    }
  };

  // Calculate total SLM from all loss types
  const totalSLM = lossTypes.reduce((sum, lossType) => sum + (lossType.value || 0), 0);

  // Calculate CVSS average score and PLM for selected asset
  const selectedAssetVulnerabilities = selectedAsset?.vulnerabilities || [];
  console.log(selectedAssetVulnerabilities, "SELECTED ASSET VULNS COMMING THROUGH")
  const criticality = selectedAssetVulnerabilities.length > 0
    ? selectedAssetVulnerabilities.reduce((sum: number, vuln: any) => sum + vuln.cvss, 0) / selectedAssetVulnerabilities.length
    : 0;

  // Calculate PLM for selected asset - use edited value if in edit mode
  const currentValue = editMode ? editedValue : (selectedAsset?.value || 0);
  const selectedAssetPLM = currentValue * (criticality / 10);

  // Calculate Total Risk
  const totalRisk = totalPLM * totalLef + totalSLM;

  // Update Total Risk in context
  useEffect(() => {
    setTotalRisk(totalRisk);
  }, [totalRisk, setTotalRisk]);

  if (loading || lossTypesLoading) {
    return (
      <div className="flex h-screen bg-gray-900 text-white items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error && !assets.length) {
    return (
      <div className="flex h-screen bg-gray-900 text-white items-center justify-center">
        <div className="text-xl text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar Navigation */}
      <div className="w-1/4 bg-gray-800 p-6 z-60">
        <h2 className="text-2xl font-bold mb-4">Navigation</h2>
        <nav className="flex flex-col space-y-4">
          <Link
            href="/"
            className="p-3 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600">
            Threat Actor Analysis
          </Link>
          <Link
            href="/vulnerabilityanalysis"
            className="p-3 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600">
            Vulnerability Analysis
          </Link>
          <Link
            href="/riskanalysis"
            className="p-3 bg-blue-500 text-white rounded-md hover:bg-blue-600">
            Risk Analysis
          </Link>
          <Link
            href="/securitycontrolsanalysis"
            className="p-3 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600">
            Security Controls Analysis and ROSI Calculation
          </Link>


                    <div className="mb-6 p-4 bg-gray-700 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">{user?.name}</h3>
              <p className="text-sm text-gray-300">{user?.email}</p>
              <span className={`inline-block px-2 py-1 text-xs rounded mt-1 ${
                user?.type === 'admin' ? 'bg-red-600 text-white' :
                user?.type === 'analyst' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
              }`}>
                {user?.type?.toUpperCase()}
              </span>
            </div>
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to logout?')) {
                  logout();
                }
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
              title="Logout"
            >
              Logout
            </button>
          </div>
        </div>

        </nav>
      </div>

      {/* Main Content */}
      <div className="w-3/4 p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-6">Risk Analysis</h1>

        {/* Error Display */}
        {error && (
          <Card className="p-4 mb-4 bg-red-50 border border-red-200">
            <p className="text-red-600">{error}</p>
          </Card>
        )}

        {/* Asset Selection */}
        {assets.length > 0 && (
          <Card className="p-6 mb-8 bg-white" id="tour-risk-filters">
            <h2 className="text-xl font-semibold mb-4 text-black">Select Asset</h2>
            <Select
              onValueChange={handleAssetSelect}
              value={selectedAsset?.id || selectedAsset?._id}
            >
              <SelectTrigger className="w-full bg-white text-black z-[60]">
                <SelectValue placeholder="Select an asset" />
              </SelectTrigger>
              <SelectContent className="z-[70]">
                {assets.map((asset) => (
                  <SelectItem key={asset.id || asset._id} value={asset.id || asset._id}>
                    {asset.name} (${asset.value} million)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Card>
        )}

        {/* Primary Loss Magnitude (PLM) Analysis Table */}
        {selectedAsset && (
          <Card className="p-6 mb-8 bg-white" id="primary-risk">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-black">Primary Loss Magnitude (PLM) Analysis</h2>
              <div className="space-x-2">
                {!editMode ? (
                  <button
                    onClick={() => setEditMode(true)}
                    className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
                  >
                    Edit Asset
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleSaveAsset}
                      disabled={saving}
                      className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm"
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => {
                        setEditMode(false);
                        setEditedName(selectedAsset.name);
                        setEditedValue(selectedAsset.value);
                      }}
                      disabled={saving}
                      className="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>

            <table className="w-full text-sm text-black border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 border text-left">Attribute</th>
                  <th className="p-3 border text-left">Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-3 border font-semibold">Asset Name</td>
                  <td className="p-3 border">
                    {editMode ? (
                      <input
                        type="text"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className="w-full px-2 py-1 border rounded"
                      />
                    ) : (
                      selectedAsset.name
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="p-3 border font-semibold">Vulnerabilities</td>
                  <td className="p-3 border">
                    {selectedAssetVulnerabilities.length > 0 ? (
                      <div className="space-y-1">
                        {selectedAssetVulnerabilities.map((vuln: any, index: number) => (
                          <div key={index} className="text-sm">
                            {vuln.name} (CVSS: {vuln.cvss})
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-500">No vulnerabilities</span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="p-3 border font-semibold">Criticality (Avg CVSS)</td>
                  <td className="p-3 border">{criticality.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="p-3 border font-semibold">Asset Value ($million)</td>
                  <td className="p-3 border">
                    {editMode ? (
                      <input
                        type="number"
                        value={editedValue}
                        onChange={(e) => setEditedValue(parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1 border rounded"
                        step="0.01"
                        min="0"
                      />
                    ) : (
                      `${selectedAsset.value}`
                    )}
                  </td>
                </tr>
                <tr className="bg-green-50">
                  <td className="p-3 border font-bold">PLM for this asset ($million)</td>
                  <td className="p-3 border font-bold text-green-600">
                    ${currentValue} × {(criticality/10).toFixed(2)} = ${selectedAssetPLM.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
            
            <div className="mt-4 p-3 bg-blue-50 rounded">
              <h3 className="text-lg font-semibold text-black">
                Total PLM (All Organization Assets): ${totalPLM.toFixed(2)} million
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                This is the sum of PLM values for all {assets.length} assets in your organization
              </p>
            </div>
          </Card>
        )}

        {/* Secondary Loss Magnitude (SLM) Analysis */}
        <Card className="p-6 mb-8 bg-white" id="secondary-risk">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-black">Secondary Loss Magnitude (SLM) Analysis</h2>
          </div>
          
          <table className="w-full text-sm text-black border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 border text-left">Loss Type</th>
                <th className="p-3 border text-left">Amount ($million)</th>
                <th className="p-3 border text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {lossTypes.map((lossType) => (
                <tr key={lossType.id} className="border-t">
                  <td className="p-3 border font-medium">{lossType.name}</td>
                  <td className="p-3 border">
                    {editingLossType === lossType.id ? (
                      <input
                        type="number"
                        value={editedLossTypeValue}
                        onChange={(e) => setEditedLossTypeValue(parseFloat(e.target.value) || 0)}
                        className="w-24 px-2 py-1 border rounded"
                        step="0.01"
                        min="0"
                      />
                    ) : (
                      `$${lossType.value.toFixed(2)}`
                    )}
                  </td>
                  <td className="p-3 border">
                    {editingLossType === lossType.id ? (
                      <div className="space-x-2">
                        <button
                          onClick={() => handleSaveLossType(lossType.id)}
                          className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEditLossType}
                          className="px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="space-x-2">
                        <button
                          onClick={() => handleEditLossType(lossType)}
                          className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteLossType(lossType.id)}
                          className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              
              {/* Add new loss type row */}
              {showAddNew ? (
                <tr className="border-t bg-gray-50">
                  <td className="p-3 border">
                    <input
                      type="text"
                      value={newLossTypeName}
                      onChange={(e) => setNewLossTypeName(e.target.value)}
                      placeholder="Enter loss type name"
                      className="w-full px-2 py-1 border rounded"
                    />
                  </td>
                  <td className="p-3 border">
                    <input
                      type="number"
                      value={newLossTypeValue}
                      onChange={(e) => setNewLossTypeValue(parseFloat(e.target.value) || 0)}
                      className="w-24 px-2 py-1 border rounded"
                      step="0.01"
                      min="0"
                    />
                  </td>
                  <td className="p-3 border">
                    <div className="space-x-2">
                      <button
                        onClick={handleAddNewLossType}
                        className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => {
                          setShowAddNew(false);
                          setNewLossTypeName("");
                          setNewLossTypeValue(0);
                        }}
                        className="px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr className="border-t">
                  <td colSpan={3} className="p-3 border text-center">
                    <button
                      onClick={() => setShowAddNew(true)}
                      className="px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                    >
                      + Add New Loss Type
                    </button>
                  </td>
                </tr>
              )}
              
              {/* Total SLM row */}
              <tr className="border-t font-semibold bg-blue-50">
                <td className="p-3 border text-right">Total SLM ($million):</td>
                <td className="p-3 border text-blue-700">${totalSLM.toFixed(2)}</td>
                <td className="p-3 border"></td>
              </tr>
            </tbody>
          </table>
        </Card>

        {/* Total Risk Calculation */}
        <Card id="tour-risk-summary" className="p-6 mb-8 text-center bg-red-700">
          <h2 className="text-xl font-semibold">Total Risk ($million)</h2>

          <div className="space-y-2 text-white">
            <p>
              <strong>Total LEF:</strong> {totalLef.toFixed(4)}
            </p>
            <p>
              <strong>Total PLM (All Assets):</strong> ${totalPLM.toFixed(2)}
            </p>
            <p>
              <strong>Total SLM:</strong> ${totalSLM.toFixed(2)}
            </p>
            <p className="text-white font-bold text-2xl mt-4">
              Total Risk = Total LEF × Total PLM + Total SLM ={" "}
              ${totalRisk.toFixed(4)} million
            </p>
          </div>
        </Card>
        
        <OnboardingTour steps={riskSteps} storageKey="tour_done_risk" />
      </div>
    </div>
  );
}