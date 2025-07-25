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
import BudgetInfo from './BudgetInfo';

// types
import type { CostItem } from "./controlcostsanalysis";
import { OverlappingVulnerability } from '../../types/vulnerabilities';
import { OrganizationControls, OrganizationControlsResponse } from "@/types/organizationControls";
import { NetRiskReductionData } from "@/types/netRiskReduction";

// services
import organizationsService from "@/services/organizations";
import organizationControlsService from "@/services/organizationControls"


import OnboardingTour from "@/components/OnboardingTour";
const SecurityControlsAnalysis = ({ setShowModal }: { setShowModal: (val: boolean) => void }) => {
  const scSteps = [
    { selector: "#controls", content: "Add and remove controls" },
    { selector: "#vuln-mapping", content: "Set values for overlapping vulnerabilities and controls to calculate NRR" },
    { selector: "#interaction-effect", content: "Set how connected the controls are to each other" },
    { selector: "#costs", content: "Set costs for implementing the controls" },
    { selector: "#tour-control-matrix",     content: "Review control matrix and Return on Cyber Security Investment (ROCSI) analysis" },
    { selector: "#budget", content: "Review and edit budget information" }
  ];


  const { totalRisk } = useAppContext();
  const { user, logout } = useAuth();
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

  const [budgetRefreshTrigger, setBudgetRefreshTrigger] = useState(0);


  useEffect(() => {
    const fetchOverlappingVulnerabilities = async () => {
      try {
        
        if (user?.organization?.id) {
          const data = await organizationsService.getOverlappingVulnerabilities(user?.organization?.id, null);
          setOverlappingVulnerabilities(data.overlappingVulnerabilities);
        }
      } catch (error) {
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

  // const initialCosts: CostItem[] = [
  //   { control: "Network Segmentation", purchaseCost: 5, operationalCost: 5, trainingCost: 3, manpowerCost: 2 },
  //   { control: "MS17-010 Patch", purchaseCost: 12, operationalCost: 4, trainingCost: 4, manpowerCost: 7 },
  //   { control: "Patch Apache Struts", purchaseCost: 30, operationalCost: 20, trainingCost: 10, manpowerCost: 22.8 },
  // ];
  // const [costs, setCosts] = useState<CostItem[]>(initialCosts);

  // if (!overlappingVulnerabilities || overlappingVulnerabilities.length === 0) {
  //   return <div>nothing to see here</div>;
  // }
  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar Navigation */}
      <div className="w-1/4 bg-gray-800 p-6 z-60">
        <h2 className="text-2xl font-bold mb-4">Navigation</h2>
        <nav className="flex flex-col space-y-4">
          <Link href="/" className="p-3 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600">Threat Actor Analysis</Link>
          <Link href="/vulnerabilityanalysis" className="p-3 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600">Vulnerability Analysis</Link>
          <Link href="/riskanalysis" className="p-3 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600">Risk Analysis</Link>
          <Link href="/securitycontrolsanalysis" className="p-3 bg-blue-500 text-white rounded-md hover:bg-blue-600">Security Controls Analysis and ROSI Calculation</Link>
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
      <div className="w-3/4 p-6 overflow-y-auto space-y-8">
        <h1 className="text-3xl font-bold mb-6">Security Controls Analysis & ROSI Calculation</h1>

        {/* Organisation Controls */}
        <div id="controls">
          <OrganizationControlsCard
            controls={organizationControls?.controls || []}
            onAddControl={(controlName) => handleAddControl(user?.organization?.id!, controlName)}
            onRemoveControl={(controlName) => handleRemoveControl(user?.organization?.id!, controlName)}
            loading={false}
            organizationName={user?.organization?.name}
          />
        </div>

        {/* Vulnerability-Control Mapping */}
        {vulnsLoaded && controlsLoaded ? (
          <div id="vuln-mapping">
            <VulnerabilityControlMappingCard
              overlappingVulnerabilities={overlappingVulnerabilities}
              controls={organizationControls?.controls || []}
              userId={user?.id || ""}
              organizationId={user?.organization?.id || ""}
              totalRisk={totalRisk}
              loading={false}
              onDataChange={(newRiskData) =>{
                setRiskData(newRiskData);
                // setBudgetRefreshTrigger(prev => prev + 1)
              }}
            />
          </div>
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
        <div id="interaction-effect">
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
        </div>

        {/* Control Costs Analysis */}
        <div id="costs">
          <ControlCostsAnalysis 
            controls={organizationControls?.controls || []}
            userId={user?.id || ""}
            organizationId={user?.organization?.id || ""}
            loading={false}
            onDataChange={(newCostData) => {
              setCostData(newCostData);
              // setBudgetRefreshTrigger(prev => prev + 1);
            }}
          />
        </div>

        {/* Control Selection Matrix */}
        <div id="tour-control-matrix">
          <ControlSelectionMatrix 
            controls={organizationControls?.controls || []}
            userId={user?.id || ""}
            organizationId={user?.organization?.id || ""}
            riskData={riskData} // Pass the risk data from VulnerabilityControlMappingCard
            costData={costData} // Pass the cost data from ControlCostsAnalysis
            loading={!controlsLoaded}
            onSelectionChange={() => setBudgetRefreshTrigger(prev => prev + 1)}
          />
        </div>

        { /* Budget Info */}
        <div id="budget">
          <BudgetInfo 
            userId={user?.id}
            organizationId={user?.organization?.id}
            onBudgetUpdate={() => {
              // Optional: Refresh other components when budget changes
              console.log('Budget updated');
            }}
            refreshTrigger={budgetRefreshTrigger}
          />
        </div>



        <button onClick={() => setShowModal(true)}
                className="fixed bottom-6 right-6 z-40
                bg-red-500 text-white px-4 py-2 rounded-md
                shadow-lg transition-colors hover:bg-red-600">
          Show Evaluation Suggestion
        </button>
      </div>
      <OnboardingTour steps={scSteps} storageKey="tour_done_sc" />
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
