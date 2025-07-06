"use client";

import React, { useState,useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useAppContext } from "@/context/appcontext";
import { useAuth } from "@/context/authContext";
import { useUserPreferences } from "@/context/userPreferencesContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import assetService from '../../services/assets'

// Loss Types
// const LOSS_TYPES = [
//   { label: "Reputation Loss", value: 0 },
//   { label: "Regulatory Penalties", value: 0 },
//   { label: "Business Disruption", value: 0 },
//   { label: "Customer Loss", value: 0 },
// ];

const LOSS_TYPES = [
  { id: 'reputation', label: "Reputation Loss", value: 0 },
  { id: 'regulatory', label: "Regulatory Penalties", value: 0 },
  { id: 'disruption', label: "Business Disruption", value: 0 },
  { id: 'customer', label: "Customer Loss", value: 0 },
];


export default function RiskAnalysis() {
  const [assets, setAssets] = useState<any[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { totalLef, setTotalRisk } = useAppContext();
  const { user } = useAuth();

  // for loss amounts
  const [showAmountDialog, setShowAmountDialog] = useState(false);
  const [editingLossAmount, setEditingLossAmount] = useState<number>(0);
  const [currentEditingLoss, setCurrentEditingLoss] = useState<string | null>(null);

  // for custome loss amount creation
  const [showCustomDialog, setShowCustomDialog] = useState(false);
  const [customLossTypeName, setCustomLossTypeName] = useState('');
  const [customLossTypeDescription, setCustomLossTypeDescription] = useState('');
  const [customLossAmount, setCustomLossAmount] = useState(0);

  const {
    loadAllUserPreferences,
    updatePreferences,
    getPreference,
    lossTypes: customLossTypes,
    getAssetLossAmount,
    updateAssetLossAmount,
    addCustomLossType,
    loadPreferencesForThreatActor,
    getAllCustomLossTypes
  } = useUserPreferences()

  useEffect(() => {
    if (user?.id && user?.organization?.id) {
      // Use organization ID as the threat actor ID for asset-wide preferences
      // const orgAssetPreferencesId = `org-${user.organization.id}-assets`;
      
      loadPreferencesForThreatActor(user.id, user.organization.id);
    }
  }, [user, loadPreferencesForThreatActor]);

  // Load assets from backend
  useEffect(() => {
    const loadAssets = async () => {
      try {
        if (user?.organization?.id) {
          const assetsData = await assetService.getAllByOrgId(user.organization.id);
          setAssets(assetsData);
          if (assetsData.length > 0) {
            setSelectedAsset(assetsData[0]); // Select first asset by default
          }
        }
        setLoading(false);
      } catch (err) {
        setError('Failed to load assets');
        setLoading(false);
      }
    };

    loadAssets();
  }, [user]);

  const getValue = (label: string) => {
    if (!selectedAsset) return 0;

    // Check if it's a default loss type
    const defaultItem = LOSS_TYPES.find((t) => t.label === label);
    if (defaultItem) {
      return getAssetLossAmount(selectedAsset.id, defaultItem.id) || 0;
    }
    
    // Check if it's a custom loss type
    const customItem = customLossTypes?.find((t: any) => t.name === label);
    if (customItem) {
      return getAssetLossAmount(selectedAsset.id, customItem.id) || 0;
    }
    
    // If not found, return 0 (don't call getAllCustomLossTypes here!)
    return 0;
  };

  const handleSaveLossAmount = async (lossTypeLabel: string, amount: number) => {
    if (!selectedAsset) return;
    
    const defaultType = LOSS_TYPES.find(t => t.label === lossTypeLabel);
    let customType = customLossTypes?.find((t: any) => t.name === lossTypeLabel);
    console.log('find me', defaultType)
    
    try {
      if (defaultType) {
        console.log('trying to update loss amount 1')
        await updateAssetLossAmount(selectedAsset.id, defaultType.id, amount, false);
      } else if (customType) {
        await updateAssetLossAmount(selectedAsset.id, customType.id, amount, true);
      }
      
      // Force a re-render by updating a state variable
      setEditingLossAmount(0); // This will trigger component re-render
      
    } catch (error) {
      console.error('Error saving loss amount:', error);
    }
  };

// Add this to see what's actually loaded:
console.log('Loaded preferences data:', {
  customLossTypes,
  // Check if these exist in your context:
  assetLossAmounts: getPreference('assetLossAmounts'),
  allPreferences: getPreference() // or however you access the full preferences object
});

  const handleEditAmount = (lossTypeLabel: string) => {
    setCurrentEditingLoss(lossTypeLabel);
    setEditingLossAmount(getValue(lossTypeLabel));
    setShowAmountDialog(true);
  };

const handleCreateCustomLossType = async () => {
  if (!customLossTypeName.trim()) return;
  
  try {
    // First, create the custom loss type
    await addCustomLossType(customLossTypeName, customLossTypeDescription);
    
    // Wait for context to actually update by re-fetching preferences
    if (user?.id && user?.organization?.id) {
      const orgAssetPreferencesId = `org-${user.organization.id}-assets`;
      await loadPreferencesForThreatActor(user.id, orgAssetPreferencesId);
    }
    
    // Now save the amount if specified
    if (customLossAmount > 0 && selectedAsset) {
      // Get the fresh custom loss types from updated preferences
      const updatedCustomTypes = getPreference('customLossTypes', []);
      const newCustomType = updatedCustomTypes.find((t: any) => t.name === customLossTypeName);
      
      if (newCustomType) {
        await updateAssetLossAmount(
          selectedAsset.id, 
          newCustomType.id, 
          customLossAmount, 
          true
        );
      } else {
        console.error('Could not find newly created custom loss type');
      }
    }
    
    // Reset form and close dialog
    setCustomLossTypeName('');
    setCustomLossTypeDescription('');
    setCustomLossAmount(0);
    setShowCustomDialog(false);
    
  } catch (error) {
    console.error('Failed to create custom loss type:', error);
    // Show error to user
    alert('Failed to create custom loss type. Please try again.');
  }
};
  

  // Calculate CVSS average score for selected asset vulnerabilities
  const criticality = selectedAsset && selectedAsset.vulnerabilities?.length > 0
    ? selectedAsset.vulnerabilities.reduce((sum: number, vuln: any) => {
        // Handle both old format (string) and new format (object)
        const cvssScore = typeof vuln === 'object' ? vuln.cvss : 0;
        return sum + cvssScore;
      }, 0) / selectedAsset.vulnerabilities.length
    : 0;

    

  const allLossTypes = [
    ...LOSS_TYPES.map(defaultType => ({
      ...defaultType,
      isCustom: false
    })),
    ...(customLossTypes || []).map((custom: any) => ({
      id: custom.id,
      label: custom.name,
      value: 0,
      isCustom: true
    }))
  ];

  const totalAmount = allLossTypes.reduce((sum, lossType) => sum + getValue(lossType.label), 0);
  // Calculate PLM (Primary Loss Magnitude)
  const plm = selectedAsset ? selectedAsset.value * criticality : 0;
  const totalPLM = plm;

  // Calculate Total Risk
  const totalRisk = totalLef * totalPLM + totalAmount;

  useEffect(() => {
    setTotalRisk(totalRisk);
  }, [totalRisk, setTotalRisk]);

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-900 text-white items-center justify-center">
        <div className="text-xl">Loading assets...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-900 text-white items-center justify-center">
        <div className="text-xl text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar Navigation */}
      <div className="w-1/4 bg-gray-800 p-6">
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
        </nav>
      </div>

      {/* Main Content */}
      <div className="w-3/4 p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-6">Risk Analysis</h1>

        {/* Asset Selection */}
        {assets.length > 1 && (
          <Card className="p-6 mb-8 bg-white">
            <h2 className="text-xl font-semibold mb-4 text-black">Select Asset</h2>
            <Select 
              onValueChange={(value) => {
                const asset = assets.find(a => a.id === value);
                console.log('asset in main', selectedAsset)
                setSelectedAsset(asset);
              }}
              defaultValue={selectedAsset?.id}
            >
              <SelectTrigger className="w-full bg-white text-black">
                <SelectValue placeholder="Select an asset" />
              </SelectTrigger>
              <SelectContent>
                {assets.map((asset) => (
                  <SelectItem key={asset.id} value={asset.id}>
                    {asset.name} - ${asset.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Card>
        )}

        {/* Primary Loss Magnitude (PLM) Analysis */}
        {selectedAsset && (
          <Card className="p-6 mb-8 bg-white">
            <h2 className="text-xl font-semibold mb-4 text-black">Primary Loss Magnitude (PLM) Analysis</h2>
            <div className="space-y-2 text-black">
              <p>
                <strong>Asset ID:</strong> {selectedAsset.id}
              </p>
              <p>
                <strong>Asset Name:</strong> {selectedAsset.name}
              </p>
              <p>
                <strong>Asset Value ($million):</strong> {selectedAsset.value}
              </p>
              {selectedAsset.vulnerabilities && selectedAsset.vulnerabilities.length > 0 ? (
                <>
                  {selectedAsset.vulnerabilities.map((vuln: any, index: number) => {
                      console.log('Vulnerability:', vuln);
                      console.log('Index:', index);
                      
                      // Handle both old format (string) and new format (object)
                      const vulnName = typeof vuln === 'object' ? vuln.name : vuln;
                      const cvssScore = typeof vuln === 'object' ? vuln.cvss : 'N/A';
                      
                      return (
                        <p key={index}>
                          <strong>Affected by Vulnerability {vulnName} (from backend):</strong> CVSS: {cvssScore}
                        </p>
                      );
                    })}
                  <p>
                    <strong>Criticality (average CVSS score):</strong> {criticality.toFixed(2)}
                  </p>
                  <p className="text-green-500 font-bold">
                    PLM = Asset Value × Criticality = {selectedAsset.value} × {criticality.toFixed(2)} = {totalPLM.toFixed(2)} ($million)
                  </p>
                </>
              ) : (
                <p className="text-gray-500">No vulnerabilities found for this asset</p>
              )}
            </div>
          </Card>
        )}

        {/* Secondary Loss Magnitude (SLM) Analysis */}
        <Card className="p-6 mb-8 bg-white">
          <h2 className="text-xl font-semibold mb-4 text-black">Secondary Loss Magnitude (SLM) Analysis</h2>
          <table className="w-full text-sm text-black">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Loss Type</th>
                <th className="text-left py-2">Amount ($million)</th>
              </tr>
            </thead>
            <tbody>
              {/* {[0, 1, 2, 3].map((i) => (
                <tr key={i} className="border-t">
                  <td className="py-2">
                    <Select onValueChange={(val) => handleSelect(i, val)} defaultValue="">
                      <SelectTrigger className="w-60 bg-white text-black">
                        <SelectValue placeholder="Select loss type" />
                      </SelectTrigger>
                      <SelectContent>
                        {LOSS_TYPES.filter(t =>
                            !selections.includes(t.label) || selections[i] === t.label)
                            .map(t => (
                                <SelectItem key={t.label} value={t.label}>{t.label}
                                </SelectItem>
                            ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="py-2 pl-4">
                    ${getValue(selections[i]).toFixed(2)}
                  </td>
                </tr>
              ))} */}
              {allLossTypes.map((lossType, index) => (
                <tr key={lossType.id} className="border-t">
                  <td className="py-2 flex items-center space-x-2">
                    <span className="font-medium">{lossType.label}</span>
                    {lossType.isCustom && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Custom
                      </span>
                    )}
                  </td>
                  <td className="py-2 pl-4 flex items-center space-x-2">
                    <span>${getValue(lossType.label).toFixed(2)}</span>
                    <Button 
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditAmount(lossType.label)}
                      className="text-xs"
                    >
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
              {/* Add new loss type row */}
              <tr className="border-t">
                <td colSpan={2} className="py-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowCustomDialog(true)}
                    className="w-full text-black border-dashed"
                  >
                    + Add Custom Loss Type
                  </Button>
                </td>
              </tr>
              
              {/* Total SLM row */}
              <tr className="border-t font-semibold">
                <td className="py-2 text-right pr-2">Total SLM ($million):</td>
                <td className="py-2 text-blue-700 pl-4">
                  ${allLossTypes.reduce((sum, lossType) => sum + getValue(lossType.label), 0).toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </Card>

        {/* Total Risk Calculation */}
        <Card className="p-6 mb-8 bg-white">
          <h2 className="text-xl font-semibold mb-4 text-black">Total Risk ($million)</h2>
          <div className="space-y-2 text-black">
            <p>
              <strong>Total LEF:</strong> {totalLef.toFixed(4)}
            </p>
            <p>
              <strong>Total PLM:</strong> {totalPLM.toFixed(2)}
            </p>
            <p>
              <strong>Total SLM:</strong> {totalAmount.toFixed(2)}
            </p>
            <p className="text-red-500 font-bold text-2xl mt-4">
              Total Risk = Total LEF × Total PLM + Total SLM ={" "}
              {totalRisk.toFixed(2)} ($million)
            </p>
          </div>
        </Card>
        <Dialog open={showCustomDialog} onOpenChange={setShowCustomDialog}>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle className="text-black">Create Custom Loss Type</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Loss Type Name *
                </label>
                <Input
                  value={customLossTypeName}
                  onChange={(e) => setCustomLossTypeName(e.target.value)}
                  placeholder="e.g., Brand Damage, Legal Costs"
                  className="text-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Description (Optional)
                </label>
                <Input
                  value={customLossTypeDescription}
                  onChange={(e) => setCustomLossTypeDescription(e.target.value)}
                  placeholder="Brief description of this loss type"
                  className="text-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Amount for {selectedAsset?.name} ($million)
                </label>
                <Input
                  type="number"
                  step="1"
                  min="0"
                  value={customLossAmount}
                  onChange={(e) => setCustomLossAmount(parseFloat(e.target.value) || 0)}
                  placeholder='0'
                  className="text-black"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowCustomDialog(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateCustomLossType}
                  disabled={!customLossTypeName.trim()}
                >
                  Create Loss Type
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Amount Editing Dialog */}
        <Dialog open={showAmountDialog} onOpenChange={setShowAmountDialog}>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle className="text-black">
                Edit Amount for {currentEditingLoss}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Amount for {selectedAsset?.name} ($million)
                </label>
                <Input
                  type="number"
                  step="1"
                  min="0"
                  value={editingLossAmount}
                  onChange={(e) => setEditingLossAmount(parseFloat(e.target.value) || 0)}
                  className="text-black"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowAmountDialog(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={async () => {
                    await handleSaveLossAmount(currentEditingLoss!, editingLossAmount);
                    setShowAmountDialog(false);
                  }}
                >
                  Save Amount
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}