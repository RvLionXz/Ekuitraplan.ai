"use client";

import { useState } from "react";
import { MapPin, Clock, TreeDeciduous, Leaf, Star, Calendar } from "lucide-react";
import type { DayItinerary, Activity } from "@/types";

interface ItineraryViewProps {
  itinerary: DayItinerary[];
  ecoComparisons?: Array<{
    activity: string;
    transport: string;
    day: number;
    saved_carbon_kg: number;
    message: string;
  }>;
}

export function ItineraryView({ itinerary, ecoComparisons = [] }: ItineraryViewProps) {
  const [selectedDay, setSelectedDay] = useState(1);
  const currentDay = itinerary.find((d) => d.day === selectedDay);

  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-2 overflow-x-auto p-4 border-b border-gray-100">
        {itinerary.map((day) => (
          <button
            key={day.day}
            onClick={() => setSelectedDay(day.day)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              selectedDay === day.day
                ? "bg-primary text-white"
                : "bg-surface text-text-secondary hover:bg-primary/10"
            }`}
          >
            Hari {day.day}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {currentDay && (
          <>
            <div className="mb-4">
              <h3 className="text-lg font-bold text-text-primary">{currentDay.theme}</h3>
              <p className="text-sm text-text-secondary">
                {currentDay.activities.length} activities
              </p>
            </div>

            {currentDay.activities.map((activity, idx) => {
              const ecoComp = ecoComparisons.find(
                (e) => e.day === selectedDay && e.activity === activity.activity
              );

              return (
                <div
                  key={idx}
                  className="p-4 bg-surface rounded-xl border border-gray-100"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold flex-shrink-0">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                          {activity.time}
                        </span>
                        {activity.transport && (
                          <span className="text-xs text-text-secondary">
                            {activity.transport}
                          </span>
                        )}
                      </div>
                      <h4 className="font-medium text-text-primary">{activity.activity}</h4>
                      {activity.location && (
                        <p className="text-sm text-text-secondary flex items-center gap-1 mt-1">
                          <MapPin size={12} />
                          {activity.location}
                        </p>
                      )}
                      {activity.description && (
                        <p className="text-sm text-text-secondary mt-2">
                          {activity.description}
                        </p>
                      )}
                      {ecoComp && ecoComp.saved_carbon_kg > 0 && (
                        <div className="mt-2 text-xs text-emerald-600 flex items-center gap-1">
                          <TreeDeciduous size={12} />
                          {ecoComp.message}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}