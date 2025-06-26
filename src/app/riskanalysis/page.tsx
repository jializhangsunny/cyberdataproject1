"use client";

import React, { useState,useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useAppContext } from "@/context/appcontext";
import { useAuth } from "@/context/authContext";
import { useUserPreferences } from "@/context/userPreferencesContext";

import assetService from '../../services/assets'

// Loss Types
const LOSS_TYPES = [
  { label: "Reputation Loss", value: 0 },
  { label: "Regulatory Penalties", value: 0 },
  { label: "Business Disruption", value: 0 },
  { label: "Customer Loss", value: 0 },
];

export default function RiskAnalysis() {
  const [assets, setAssets] = useState<any[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { totalLef, setTotalRisk } = useAppContext();
  const { user } = useAuth();

  const [selections, setSelections] = useState<string[]>([]);

  const {
    loadAllUserPreferences,
    updatePreferences,

    getPreference,

    lossTypes 
    // use these as custom loss types, 
    // where you can save new ones as label: "new loss type", value: 0, 
    // or use it as label: "existing loss type", value: saved value
    // remember to save it to the backend
    // also remember to save these per ASSET
  } = useUserPreferences()

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

 const handleSelect = (index: number, value: string) => {
  setSelections(prev => {
    const copy = prev.map(v => (v === value ? "" : v));
   copy[index] = value;
    return copy;
  });
};

  const getValue = (label: string) => {
    const item = LOSS_TYPES.find((t) => t.label === label);
    return item ? item.value : 0;
  };

  const totalAmount = selections.reduce((sum, sel) => sum + getValue(sel), 0);

  // Calculate CVSS average score for selected asset vulnerabilities
  const criticality = selectedAsset && selectedAsset.vulnerabilities?.length > 0
    ? selectedAsset.vulnerabilities.reduce((sum: number, vuln: any) => {
        // Handle both old format (string) and new format (object)
        const cvssScore = typeof vuln === 'object' ? vuln.cvss : 0;
        return sum + cvssScore;
      }, 0) / selectedAsset.vulnerabilities.length
    : 0;

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
              {[0, 1, 2, 3].map((i) => (
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
              ))}
              {/* Total SLM row */}
              <tr className="border-t font-semibold">
                <td className="py-2 text-right pr-2">Total SLM ($million):</td>
                <td className="py-2 text-blue-700 pl-4">${totalAmount.toFixed(2)}</td>
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
      </div>
    </div>
  );
}