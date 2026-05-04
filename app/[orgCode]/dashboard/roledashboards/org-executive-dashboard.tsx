"use client";
import ExecutiveCards from "@/components/commoncomponents/executivedashboard/stats";
import { useEffect, useState } from "react";
import { getExecutiveStats } from "@/services/executivestats";

export default function ExecutiveDashboard() {
  const [stats, setStats] = useState({
    myLeads: 0,
    convertedLeads: 0,
    thisWeekLeads: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getExecutiveStats();
        const data = res.value; // Access CAP value wrapper
        setStats({
          myLeads: data.totalLeads,
          convertedLeads: data.convertedLeads,
          thisWeekLeads: data.thisWeekLeads,
        });
      } catch (err) {
        console.error("Failed to load executive stats", err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">Executive Dashboard</h1>
      <p className="text-gray-500 mb-8">Personal performance metrics overview.</p>
      <ExecutiveCards stats={stats} />
    </div>
  );
}