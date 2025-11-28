import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Navbar from "../components/navbar.jsx";
import HeroCarousel from "../components/HeroCarousel";
import ReportCard from "../components/ReportCard";

import { useReport } from "../context/ReportContext";
import api from "../utils/api";

import workflowImg from "../assets/workflow.png";
import authorityImg from "../assets/authority.jpeg";

const HomePage = () => {
  const { fetchReports } = useReport();

  const [recentReports, setRecentReports] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    inprogress: 0,
  });

  useEffect(() => {
    const loadReports = async () => {
      try {
        const data = await fetchReports({ limit: 6 });
        setRecentReports(data.reports || []);
      } catch (error) {
        console.error(error);
      }
    };

    const loadStats = async () => {
      try {
        const response = await api.get("/analytics/authority");
        const sc = response.data?.statusCounts || {};

        setStats({
          total: response.data?.totalReports || 0,
          pending: sc.pending || 0,
          completed: sc.completed || 0,
          inprogress: sc.inprogress || 0,
        });
      } catch (error) {
        console.error(error);
      }
    };

    loadReports();
    loadStats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <Navbar />

      {/* Hero Carousel */}
      <HeroCarousel />

     {/* Impact Numbers */}
<section className="py-16 bg-gradient-to-br from-blue-50 to-green-50">
  <div className="container mx-auto px-4">
    <h2 className="text-3xl font-extrabold text-center text-primary-700 mb-10">
      Impact by Numbers
    </h2>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      <StatCard
        label="Total Reports"
        value={stats.total}
        color="text-blue-600"
        bg="bg-blue-100"
      />
      <StatCard
        label="Pending"
        value={stats.pending}
        color="text-yellow-600"
        bg="bg-yellow-100"
      />
      <StatCard
        label="In Progress"
        value={stats.inprogress}
        color="text-orange-600"
        bg="bg-orange-100"
      />
      <StatCard
        label="Completed"
        value={stats.completed}
        color="text-green-600"
        bg="bg-green-100"
      />
    </div>

    {/* Arrow link to view all reports */}
    <div className="mt-8 flex justify-center">
      <Link
        to="/reports"
        className="inline-flex items-center text-primary-700 font-semibold hover:underline"
      >
        View all reports
        <span className="ml-2 text-xl">→</span>
      </Link>
    </div>
  </div>
</section>


      {/* Branding Section */}
      <section className="py-12 bg-white text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-2">
          <span className="text-black">Swachh</span>
          <span className="text-green-600 ml-2">Setu</span>
        </h1>

        <p className="mt-3 text-2xl font-bold text-green-600 max-w-2xl mx-auto">
          “Green City, Clean Future.”
        </p>

        <Link
          to="/reports/new"
          className="mt-4  inline-block bg-green-600 text-white font-bold px-10 py-3 rounded-lg text-lg shadow hover:bg-green-700 transition"
        >
          Report Garbage Now
        </Link>
      </section>

      {/* Strong Hindi Message */}
      <section className="text-center py-16 bg-gray-50">
        <h2 className="text-4xl md:text-4xl font-bold text-black mb-4">
          A Digital Bridge for a Cleaner & Clear City
        </h2>

        <p className="text-gray-700 max-w-3xl mx-auto leading-relaxed">
          इस डिजिटल सेतु की मदद से नागरिक, नगर-निगम और स्वच्छ कर्मी एक ही प्लेटफ़ॉर्म पर जुड़े रहते हैं।  
          <br/>शिकायत दर्ज करें, प्रगति देखें और स्वच्छता अभियान को मज़बूत बनाएं।
        </p>

        <p className="text-green-600 font-extrabold mt-4 text-2xl">
          “आपकी एक रिपोर्ट, पूरे शहर की स्वच्छता की जिम्मेदारी”
        </p>
      </section>

      {/* Workflow Image */}
      <section className="py-10 bg-white">
        <div className="container mx-auto px-4 flex justify-center">
          <img
            src={workflowImg}
            alt="Workflow Illustration"
            className="w-full max-w-4xl object-contain"
          />
        </div>
      </section>

      {/* Verified Authority */}
<section className="container mx-auto px-4 py-8">
  <div className="bg-white p-8 rounded-xl shadow border flex flex-col md:flex-row items-center gap-8">

    {/* Authority Image */}
    <img
      src={authorityImg}
      alt="Authority"
      className="w-28 h-28 md:w-40 md:h-40 object-cover rounded-full border-4 border-green-600 shadow"
    />

    {/* Text */}
    <div>
      <h3 className="text-3xl font-extrabold text-black mb-2">
        Municipal Corporation – Verified Authority
      </h3>

      <p className="text-gray-700">
        The Municipal Corporation is a verified authority on SwachhSetu.  
        Every complaint is reviewed, verified, and assigned to ground-level  
        sanitation workers for quick action.
      </p>
    </div>
  </div>
</section>


      {/* RTA (Ready To Take Action) — ENGLISH */}
      <section className="text-center py-16 bg-gray-50">
        <h2 className="text-3xl md:text-4xl font-bold text-primary-700 mb-4">
          Ready to Take Action?
        </h2>

        <p className="text-gray-700 max-w-3xl mx-auto leading-relaxed">
          SwachhSetu empowers every citizen to report waste issues instantly.  
          Your one report can contribute to a cleaner, healthier neighborhood  
          and help build a responsible and active community.
        </p>

        <Link
          to="/reports/new"
          className="mt-6 inline-block bg-green-600 text-white font-bold px-8 py-3 rounded-lg shadow hover:bg-green-700 transition"
        >
          Report an Issue
        </Link>
      </section>

    </div>
  );
};

/* Components */
const StatCard = ({ label, value, color, bg }) => (
  <div className="text-center bg-white shadow rounded-lg p-6">
    <div className={`${bg} w-16 h-16 rounded-full flex justify-center items-center mx-auto mb-4`}>
      <span className={`text-3xl font-bold ${color}`}>{value}</span>
    </div>
    <h3 className="text-gray-700 text-lg font-semibold">{label}</h3>
  </div>
);

export default HomePage;
