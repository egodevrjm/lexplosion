import React from "react";

const ScoreTracker = ({ score }) => {
  return (
    <div className="fixed top-5 left-1/2 transform -translate-x-1/2">
      <h2 className="text-3xl font-bold text-gray-700">Score: {score}</h2>
    </div>
  );
};

export default ScoreTracker;
