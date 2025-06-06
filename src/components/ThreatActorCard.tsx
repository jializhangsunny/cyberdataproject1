'use client';

import React, {useCallback, useState, useEffect} from 'react';
import { Card } from '@/components/ui/card';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';

import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

import {
  SOPHISTICATION_LEVELS,
  RESOURCE_LEVELS,
  RELEVANCE_LEVELS,
  COLORS,
  LOCATIONS,
  SECTORS,
} from '@/utils/threatActorConsts';

/* ─── Types ─ */


export interface Motivation {
  id: string;
  name: string;
  relevanceLevel: string;
  weight: number;
}

export interface Goal {
  id: string;
  name: string;
  relevanceLevel: string;
  weight: number;
}

export interface DetailedThreatActor {
  id: string;
  name: string;
  sophisticationLevel: string;
  resourceLevel: string;
  location: string;
  sector: string;
  motivations?: Motivation[];
  goals?: Goal[];
}

interface Props {
  ta: DetailedThreatActor;
  orgLoc: string;
  orgSec: string;
  w1: number;
  w2: number;
 onOrgLocChange: (loc: string) => void;
  onOrgSecChange: (sec: string) => void;
}

/* Component  */
export default function ThreatActorCard({ta, orgLoc, orgSec, w1, w2, onOrgLocChange, onOrgSecChange}: Props) {
// card state
  const [motWeights, setMotWeights] = useState<Record<string, number>>({});
  const [goalWeights, setGoalWeights] = useState<Record<string, number>>({});
  const [motRel, setMotRel] = useState<Record<string, string>>({});
  const [goalRel, setGoalRel] = useState<Record<string, string>>({});

// pull ta value into card state
  useEffect(() => {
    const mw: Record<string, number> = {};
    const gw: Record<string, number> = {};
    const mr: Record<string, string> = {};
    const gr: Record<string, string> = {};
    ta.motivations?.forEach(m => {
      mw[m.id] = m.weight;
      mr[m.id] = m.relevanceLevel;
    });
    ta.goals?.forEach(g => {
      gw[g.id] = g.weight;
      gr[g.id] = g.relevanceLevel;
    });
    setMotWeights(mw);
    setGoalWeights(gw);
    setMotRel(mr);
    setGoalRel(gr);
  }, [ta.id]);

  /* Calculation */
  const sophVal = SOPHISTICATION_LEVELS[ta.sophisticationLevel] ?? 0;
  const resVal = RESOURCE_LEVELS[ta.resourceLevel] ?? 0;

  const motivationScore = (ta.motivations ?? []).reduce((sum, m) => {
    const w = motWeights[m.id] ?? m.weight;
    const r = RELEVANCE_LEVELS[motRel[m.id] ?? m.relevanceLevel] ?? 0;
    return sum + w * r;
  }, 0);

  const goalScore = (ta.goals ?? []).reduce((sum, g) => {
    const w = goalWeights[g.id] ?? g.weight;
    const r = RELEVANCE_LEVELS[goalRel[g.id] ?? g.relevanceLevel] ?? 0;
    return sum + w * r;
  }, 0);

  const locMatch = ta.location === orgLoc ? 1 : 0;
  const sectMatch = ta.sector === orgSec ? 1 : 0;

  const TA = w1 * sophVal + w2 * resVal;
  const TEF = TA * motivationScore * goalScore * locMatch * sectMatch;

  return (
      <Card className="p-6 space-y-6 bg-gray-400 min-w-[320px]">
        <h2 className="text-2xl font-bold text-center">{ta.name}</h2>

        {/* Sophistication and Resource Level */}
        <div className="flex gap-6">
          {[
            {
              label: 'Sophistication Level',
              value: sophVal,
              raw: ta.sophisticationLevel,
              color: COLORS[0],
            },
            {
              label: 'Resource Level',
              value: resVal,
              raw: ta.resourceLevel,
              color: COLORS[1],
            },
          ].map((item) => (
              <Card key={item.label} className="p-4 flex-1 bg-gray-800">
                <h3 className="text-lg font-semibold text-white mb-2">{item.label}</h3>
                <div className="p-2 mb-3 rounded bg-gray-600 text-center text-sm text-white">
                  {item.raw}
                </div>
                <PieChart width={200} height={180}>
                  <Pie
                      data={[
                        {name: 'Score', value: item.value},
                        {name: 'Remain', value: 1 - item.value},
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      dataKey="value"
                      isAnimationActive={false}
                  >
                    <Cell fill={item.color}/>
                    <Cell fill="#3b3b3b"/>
                  </Pie>
                  <Tooltip/>
                </PieChart>
              </Card>
          ))}
        </div>

        {/* Threat Ability Calculation */}
        <Card className="p-4 mb-8 text-center bg-red-700">
          <h2 className="text-xl font-semibold">Threat Ability (TA)</h2>
          <p className="text-white text-lg mb-2">
            {sophVal.toFixed(2)} × {w1.toFixed(2)} + {resVal.toFixed(2)} × {w2.toFixed(2)}
          </p>
          <p className="text-white text-2xl font-bold mt-2">{TA.toFixed(2)}</p>
        </Card>

        {/* Motivation Analysis and Goals Analysis */}
        <div className="flex justify-between space-x-8 mb-8">
          {/* Motivation Analysis */}
          <Card className="p-4 flex-1 bg-gray-800">
            <h2 className="text-xl font-semibold mb-4 text-white">Motivation Analysis</h2>

            {ta?.motivations && ta.motivations.length > 0 ? (
                <div className="space-y-4">
                  {ta.motivations.map((motivation, index) => {
                    const currentWeight = motWeights[motivation.id] ?? motivation.weight;
                    const currentRelevance = motRel[motivation.id] ?? motivation.relevanceLevel;
                    const score = (RELEVANCE_LEVELS[currentRelevance] || 0) * currentWeight;

                    return (
                        <div key={motivation.id} className="p-4 bg-gray-700 rounded-md">
                          <div className="flex justify-between items-center mb-3">
                            <span className="font-medium text-white">{motivation.name}</span>
                            <span className="text-sm text-gray-300">Score: {score.toFixed(3)}</span>
                          </div>

                          {/* Relevance Level Selector */}
                          <div className="mb-3">
                            <label className="block text-sm text-gray-300 mb-1">Relevance Level</label>
                            <Select
                                onValueChange={(value) => setMotRel(prev => ({...prev, [motivation.id]: value}))}
                                value={currentRelevance}
                            >
                              <SelectTrigger className="w-full p-2 border rounded-md bg-white text-black">
                                <SelectValue/>
                              </SelectTrigger>
                              <SelectContent>
                                {Object.keys(RELEVANCE_LEVELS).map((level) => (
                                    <SelectItem key={level} value={level}>
                                      {level} ({RELEVANCE_LEVELS[level]})
                                    </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Weight Slider */}
                          <div>
                            <label className="block text-sm text-gray-300 mb-1">
                              Weight: {currentWeight.toFixed(3)}
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={currentWeight * 100}
                                onChange={(e) => setMotWeights(prev => ({
                                  ...prev,
                                  [motivation.id]: Number(e.target.value) / 100
                                }))}
                                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                            />
                          </div>
                        </div>
                    );
                  })}
                </div>
            ) : (
                <div className="text-gray-400">No motivations available</div>
            )}

            {/* Total Motivation Score */}
            <Card className="p-4 text-center bg-gray-900 mt-4">
              <h3 className="text-lg text-white font-semibold">Total Motivation Score</h3>
              <p className="text-white text-2xl font-bold mt-2">{motivationScore.toFixed(3)}</p>
              <p className="text-xs text-gray-400 mt-1">
                Sum of weights: {ta ?
                  Object.values(motWeights).reduce((sum, weight) => sum + weight, 0).toFixed(3) :
                  '0.000'
              }
              </p>
            </Card>
          </Card>


          {/* Goals Analysis */}
          <Card className="p-4 flex-1 bg-gray-800">
            <h2 className="text-xl font-semibold mb-4 text-white">Goals Analysis</h2>

            {ta?.goals && ta.goals.length > 0 ? (
                <div className="space-y-4">
                  {ta.goals.map((goal, index) => {
                    const currentWeight = goalWeights[goal.id] !== undefined ? goalWeights[goal.id] : goal.weight;
                    const currentRelevance = goalRel[goal.id] || goal.relevanceLevel;
                    const score = (RELEVANCE_LEVELS[currentRelevance] || 0) * currentWeight;

                    return (
                        <div key={goal.id} className="p-4 bg-gray-700 rounded-md">
                          <div className="flex justify-between items-center mb-3">
                            <span className="font-medium text-white">{goal.name}</span>
                            <span className="text-sm text-gray-300">Score: {score.toFixed(3)}</span>
                          </div>

                          {/* Relevance Level Selector */}
                          <div className="mb-3">
                            <label className="block text-sm text-gray-300 mb-1">Relevance Level</label>
                            <Select
                                onValueChange={(value) => setGoalRel(prev => ({...prev, [goal.id]: value}))}
                                value={currentRelevance}
                            >
                              <SelectTrigger className="w-full p-2 border rounded-md bg-white text-black">
                                <SelectValue/>
                              </SelectTrigger>
                              <SelectContent>
                                {Object.keys(RELEVANCE_LEVELS).map((level) => (
                                    <SelectItem key={level} value={level}>
                                      {level} ({RELEVANCE_LEVELS[level]})
                                    </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Weight Slider */}
                          <div>
                            <label className="block text-sm text-gray-300 mb-1">
                              Weight: {currentWeight.toFixed(3)}
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={currentWeight * 100}
                                onChange={(e) =>

                                    setGoalWeights(prev => ({...prev, [goal.id]: Number(e.target.value) / 100}))
                                }
                                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                            />
                          </div>
                        </div>
                    );
                  })}
                </div>
            ) : (
                <div className="text-gray-400">No goals available</div>
            )}

            {/* Total Goal Score */}
            <Card className="p-4 text-center bg-gray-900 mt-4">
              <h3 className="text-lg text-white font-semibold">Total Goal Score</h3>
              <p className="text-white text-2xl font-bold mt-2">{goalScore.toFixed(3)}</p>
              <p className="text-xs text-gray-400 mt-1">
                Sum of weights: {ta ?
                  Object.values(goalWeights).reduce((sum, weight) => sum + weight, 0).toFixed(3) :
                  '0.000'
              }
              </p>
            </Card>
          </Card>
        </div>


        {/* Location and Sector Match Row */}
        <div className="flex justify-between space-x-8 mb-8">

          {/* Location Match */}
          <div className="flex-1 space-y-4">
            <Card className="p-4">
              <h2 className="text-xl font-semibold mb-2">Location Match</h2>

              {/* Organization Location */}
              <div className="mb-4">
                <h3 className="text-lg">Organization Location</h3>
                <Select onValueChange={onOrgLocChange} value={orgLoc}>
                  <SelectTrigger className="w-full p-2 border rounded-md bg-white text-black">
                    <SelectValue placeholder="Select Location"/>
                  </SelectTrigger>
                  <SelectContent>
                    {LOCATIONS.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Threat Actor Location */}
              <div className="mb-4">
                <h3 className="text-lg">Threat Actor Location</h3>
                <div className="w-full p-3 border rounded-md bg-gray-700 text-white">
                  <span className="font-medium">{ta?.location || "Not Available"}</span>
                </div>
              </div>
            </Card>

            <MatchBlock
                title="Location Match Score"
                match={locMatch as 0 | 1}
            />
          </div>

          {/* Sector Match */}
          <div className="flex-1 space-y-4">
            <Card className="p-4">
              <h2 className="text-xl font-semibold mb-2">Sector Match</h2>

              {/* Organization Sector */}
              <div className="mb-4">
                <h3 className="text-lg">Organization Sector</h3>
                <Select onValueChange={onOrgSecChange} value={orgSec}>
                  <SelectTrigger className="w-full p-2 border rounded-md bg-white text-black">
                    <SelectValue placeholder="Select Sector"/>
                  </SelectTrigger>
                  <SelectContent>
                    {SECTORS.map((sector) => (
                        <SelectItem key={sector} value={sector}>
                          {sector}
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Threat Actor Sector */}
              <div className="mb-4">
                <h3 className="text-lg">Threat Actor Sector</h3>
                <div className="w-full p-3 border rounded-md bg-gray-700 text-white">
                  <span className="font-medium">{ta?.sector || "Not Available"}</span>
                </div>
              </div>
            </Card>

            <MatchBlock
                title="Sector Match Score"
                match={sectMatch as 0 | 1}
            />
          </div>
        </div>

        {/* TEF Calculation Card */}
        <Card className="p-4 mb-8 text-center bg-red-700">
          <h2 className="text-xl font-semibold">Final TEF Calculation</h2>
          <p className="text-white text-lg mb-2">
            TA ({TA.toFixed(3)}) × Motivation ({motivationScore.toFixed(3)}) × Goals ({goalScore.toFixed(3)}) × Location
            ({locMatch}) × Sector ({sectMatch})
          </p>
          <p className="text-white text-3xl font-bold">{TEF.toFixed(6)}</p>
        </Card>
      </Card>
  );
}

/* ScoreBox  */


/* MatchBlock  */
function MatchBlock({title, match, }: {
  title: string;
  match: 0 | 1;
}) {
  return (
    <Card
      className={`p-3 text-center font-bold text-white ${
        match ? 'bg-red-600' : 'bg-green-600'
      }`}
    >
      <p className="text-sm">{title}</p>
      <p className="text-lg">{match}</p>
    </Card>
  );
}
