import React from "react";

const TutorialModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm">
        <h2 className="text-2xl font-bold mb-4">How to Play</h2>
        <p className="text-gray-700 mb-4">
          Select letters from the grid to form valid words. Submit the word to earn points! Longer words earn more points.
        </p>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          onClick={onClose}
        >
          Got it!
        </button>
      </div>
    </div>
  );
};

export default TutorialModal;
