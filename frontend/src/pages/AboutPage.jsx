import React from 'react';

const AboutPage = () => {
  return (
    <div className="container mx-auto px-4 pt-4 pb-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">About Garbage Reporting System</h1>
        
        <div className="prose prose-lg">
          <p className="text-gray-700 mb-4">
            The Garbage Reporting System is a citizen-centric platform designed to streamline 
            the process of reporting and resolving waste management issues in our city.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Our Mission</h2>
          <p className="text-gray-700 mb-4">
            To create a cleaner, healthier environment by empowering citizens to report 
            garbage-related issues and enabling municipal authorities to respond efficiently.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">How It Works</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Citizens report garbage issues with photos and location details</li>
            <li>Municipal authorities review and verify each report</li>
            <li>Verified reports are assigned to cleaning workers</li>
            <li>Workers complete the cleanup and submit proof</li>
            <li>Citizens can track the status of their reports in real-time</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Key Features</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Easy-to-use report submission with photo upload</li>
            <li>Real-time status tracking and timeline</li>
            <li>Interactive maps showing report locations</li>
            <li>Community engagement through upvotes and comments</li>
            <li>Analytics dashboard for authorities and workers</li>
            <li>Notice board for public announcements</li>
          </ul>

          <div className="bg-blue-50 p-6 rounded-lg mt-8">
            <h3 className="text-xl font-semibold mb-2">Get Involved</h3>
            <p className="text-gray-700">
              Join us in making our city cleaner. Report issues, support others' reports, 
              and stay informed about cleanup activities in your area.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;