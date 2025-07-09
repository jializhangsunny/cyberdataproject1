"use client";

import React, { Suspense, useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import EvaluationSuggestion from "@/components/evaluationsuggestion";
import ControlSelectionMatrix from "./controlselectionmatrix";

// context
import { useAppContext } from "@/context/appcontext";
import { useAuth } from "@/context/authContext";

// components
import OrganizationControlsCard from "./OrganisationControlsCard";
import VulnerabilityControlMappingCard from "./vulnerabilityControlMappingCard";
import ControlCostsAnalysis from "./controlcostsanalysis";
import InteractionEffectsAnalysis from "./InteractionEffectsAnalysis";

// types
import type { CostItem } from "./controlcostsanalysis";
import { OverlappingVulnerability } from '../../types/vulnerabilities';
import { OrganizationControls, OrganizationControlsResponse } from "@/types/organizationControls";
import { NetRiskReductionData } from "@/types/netRiskReduction";

// services
import organizationsService from "@/services/organizations";
import organizationControlsService from "@/services/organizationControls"

const SecurityControlsAnalysis = ({ setShowModal }: { setShowModal: (val: boolean) => void }) => {
  const { totalRisk } = useAppContext();
  const { user } = useAuth();
  // on this page, fetch for all threat actors, so get all overlapping vulnerabilities from the organization service
  const [overlappingVulnerabilities, setOverlappingVulnerabilities] = useState<OverlappingVulnerability[]>([]); // if none, nothing to show
  const [organizationControls, setOrganizationControls] = useState<OrganizationControls | undefined>()
  // to re-render components once data is ready
  const [dataReady, setDataReady] = useState(false);
  const [vulnsLoaded, setVulnsLoaded] = useState(false);
  const [controlsLoaded, setControlsLoaded] = useState(false);
  // lifting state
  const [riskData, setRiskData] = useState<NetRiskReductionData[]>([]);
  const [costData, setCostData] = useState<CostItem[]>([]);


  useEffect(() => {
    const fetchOverlappingVulnerabilities = async () => {
      try {
        
        if (user?.organization?.id) {
          const data = await organizationsService.getOverlappingVulnerabilities(user?.organization?.id, null);
          // for vuln in data.overla:
          //   if vuln.status != patched:
          //    add to dat
          console.log('overlapping vulns: ', data.overlappingVulnerabilities)
          setOverlappingVulnerabilities(data.overlappingVulnerabilities);
        }
      } catch (error) {
        console.error('Error fetching overlapping vulnerabilities:', error);
        setOverlappingVulnerabilities([]);
      } finally {
        setVulnsLoaded(true);
      }
    };

    fetchOverlappingVulnerabilities();
  }, [user?.organization?.id]);

  useEffect(() => {
    const fetchOrganizationControls = async () => {
      try {
        if (user?.organization?.id) {
          const response: OrganizationControls = await organizationControlsService.getAll(user.organization.id);
          console.log('org controls', response)
          setOrganizationControls(response);
        }
      } catch (error) {
        console.error('Error fetching organization controls:', error);
        setOrganizationControls(undefined); // or set to a default value
      } finally {
        setControlsLoaded(true);
      }
    };

    fetchOrganizationControls();
  }, [user?.organization?.id]);

  const handleFetchControls = async (organizationId: string) => {
    try {
      const response: OrganizationControls = await organizationControlsService.getAll(organizationId);
      setOrganizationControls(response);
    } catch (error) {
      console.error('Error fetching controls:', error);
    }
  };

  const handleAddControl = async (organizationId: string, controlName: string) => {
    try {
      const response: OrganizationControlsResponse = await organizationControlsService.create(organizationId, controlName);
      setOrganizationControls(response.organizationControls); 
    } catch (error) {
      console.error('Error adding control:', error);
    }
  };

  const handleRemoveControl = async (organizationId: string, controlName: string) => {
    try {
      const response = await organizationControlsService.remove(organizationId, controlName);
      // After successful removal, refetch the controls to update state
      await handleFetchControls(organizationId);
    } catch (error) {
      console.error('Error removing control:', error);
    }
  };

  useEffect(() => {
    if (vulnsLoaded && controlsLoaded) {
      console.log('🎯 Both API calls completed, data ready!');
      console.log('Final vulnerabilities count:', overlappingVulnerabilities.length);
      console.log('Final controls count:', organizationControls?.controls?.length || 0);
      setDataReady(true);
    }
  }, [overlappingVulnerabilities, organizationControls, vulnsLoaded, controlsLoaded]);

  const initialCosts: CostItem[] = [
    { control: "Network Segmentation", purchaseCost: 5, operationalCost: 5, trainingCost: 3, manpowerCost: 2 },
    { control: "MS17-010 Patch", purchaseCost: 12, operationalCost: 4, trainingCost: 4, manpowerCost: 7 },
    { control: "Patch Apache Struts", purchaseCost: 30, operationalCost: 20, trainingCost: 10, manpowerCost: 22.8 },
  ];
  const [costs, setCosts] = useState<CostItem[]>(initialCosts);

  // if (!overlappingVulnerabilities || overlappingVulnerabilities.length === 0) {
  //   return <div>nothing to see here</div>;
  // }
  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      {/* Sidebar Navigation */}
      <div className="w-1/4 bg-gray-800 p-6">
        <h2 className="text-2xl font-bold mb-4">Navigation</h2>
        <nav className="flex flex-col space-y-4">
          <Link href="/" className="p-3 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600">Threat Actor Analysis</Link>
          <Link href="/vulnerabilityanalysis" className="p-3 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600">Vulnerability Analysis</Link>
          <Link href="/riskanalysis" className="p-3 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600">Risk Analysis</Link>
          <Link href="/securitycontrolsanalysis" className="p-3 bg-blue-500 text-white rounded-md hover:bg-blue-600">Security Controls Analysis and ROSI Calculation</Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="w-3/4 p-6 overflow-y-auto space-y-8">
        <h1 className="text-3xl font-bold mb-6">Security Controls Analysis & ROSI Calculation</h1>

        {/* Organisation Controls */}
        <OrganizationControlsCard
          controls={organizationControls?.controls || []}
          onAddControl={(controlName) => handleAddControl(user?.organization?.id!, controlName)}
          onRemoveControl={(controlName) => handleRemoveControl(user?.organization?.id!, controlName)}
          loading={false}
          organizationName={user?.organization?.name}
        />

        {/* Vulnerability-Control Mapping */}
        {vulnsLoaded && controlsLoaded ? (
          <VulnerabilityControlMappingCard
            overlappingVulnerabilities={overlappingVulnerabilities}
            controls={organizationControls?.controls || []}
            userId={user?.id || ""}
            organizationId={user?.organization?.id || ""}
            totalRisk={totalRisk}
            loading={false}
          />
        ) : (
          <Card className="bg-gray-300 text-black p-6">
            <h2 className="text-xl font-semibold mb-4">Vulnerability-Control Mapping</h2>
            <div className="text-center py-4">
              <div className="space-y-2">
                <p>Loading data...</p>
                <div className="text-sm text-gray-600">
                  <p>Vulnerabilities: {vulnsLoaded ? '✅ Loaded' : '⏳ Loading...'}</p>
                  <p>Controls: {controlsLoaded ? '✅ Loaded' : '⏳ Loading...'}</p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Interaction Effect Analysis */}
        {controlsLoaded ? (
          <InteractionEffectsAnalysis
            controls={organizationControls?.controls || []}
            organizationId={user?.organization?.id || ""}
            userId={user?.id || ""}
            loading={false}
          />
        ) : (
          <Card className="bg-gray-300 text-black p-6">
            <h2 className="text-xl font-semibold mb-4">Interaction Effect Analysis</h2>
            <div className="text-center py-4">
              <p>Loading controls...</p>
            </div>
          </Card>
        )}

        {/* Control Costs Analysis */}
        <ControlCostsAnalysis 
          controls={organizationControls?.controls || []}
          userId={user?.id || ""}
          organizationId={user?.organization?.id || ""}
          loading={false}
        />

        {/* Control Selection Matrix */}
        <ControlSelectionMatrix 
          controls={organizationControls?.controls || []}
          userId={user?.id || ""}
          organizationId={user?.organization?.id || ""}
          riskData={riskData} // Pass the risk data from VulnerabilityControlMappingCard
          costData={costData} // Pass the cost data from ControlCostsAnalysis
          loading={!controlsLoaded}
        />

        {/* Budget Info */}
        <Card className="bg-gray-300 text-black p-6">
          <h2 className="text-xl font-semibold mb-4">Budget Information</h2>
          {(() => {
            const totalBudget = 200;
            const totalCost = costs.reduce((sum, item) =>
              sum + item.purchaseCost + item.operationalCost + item.trainingCost + item.manpowerCost, 0);
            const budgetStatus = totalCost <= totalBudget ? "Within Budget" : "Exceeds Budget";

            return (
              <div className="space-y-2 text-sm">
                <p><strong>Total Budget:</strong> ${totalBudget}</p>
                <p><strong>Total Cost:</strong> ${totalCost}</p>
                <p><strong>Budget Status:</strong> <span className={budgetStatus === "Within Budget" ? "text-green-600" : "text-red-600"}>{budgetStatus}</span></p>
              </div>
            );
          })()}
        </Card>

        {/* ROSI */}
        <Card className="bg-gray-300 text-black p-6">
          <h2 className="text-xl font-semibold mb-4">ROCSI Analysis</h2>
          <p>Return on Control Security Investment (ROCSI) based on selected controls.</p>
          <table className="w-full text-sm border border-gray-400 mt-4">
            <thead className="bg-gray-200 text-black">
              <tr>
                <th className="p-2 border">Control Set</th>
                <th className="p-2 border">Total NRR</th>
                <th className="p-2 border">Total Interaction Effect</th>
                <th className="p-2 border">Total Cost</th>
                <th className="p-2 border">ROCSI</th>
              </tr>
            </thead>
            <tbody>
  {(() => {
    const patchApacheNRR = totalRisk * 0.9 - 0.2 * 100;
    const ms17NRR = totalRisk * 0.95 - 0.4 * 60;
    const totalNRR = patchApacheNRR + ms17NRR;
    const ms17Cost = 27;
    const patchApacheCost = 82.8 ;
    const totalCost = ms17Cost + patchApacheCost;
   const totalRosci = ((totalNRR * 1.8) - totalCost) / totalCost;



    return (
      <tr>
        <td className="p-2 border">1) Patch Apache Struts<br />2) MS17-010 Patch</td>
        <td className="p-2 border">{totalNRR.toFixed(2)}</td>
        <td className="p-2 border">0.8</td>
        <td className="p-2 border">{totalCost.toFixed(2)}</td>
        <td className="p-2 border">{totalRosci.toFixed(2)}</td>
      </tr>
    );
  })()}
</tbody>
          </table>
        </Card>

        <button onClick={() => setShowModal(true)} className="mt-4 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600">
          Show Evaluation Suggestion
        </button>
      </div>
    </div>
  );
};

export default function WrappedPage() {
  const [showModal, setShowModal] = useState(false);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div>
        <SecurityControlsAnalysis setShowModal={setShowModal} />
        {showModal && <EvaluationSuggestion setShowModal={setShowModal} />}
      </div>
    </Suspense>
  );
}
