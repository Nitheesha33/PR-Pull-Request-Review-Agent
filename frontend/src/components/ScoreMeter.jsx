import React from 'react';

const ScoreMeter = ({ score }) => {
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getScoreLabel = (score) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    if (score >= 40) return 'Needs Improvement';
    return 'Poor';
  };

  const getScoreDescription = (score) => {
    if (score >= 80) return 'Your code quality is excellent! Keep up the great work.';
    if (score >= 60) return 'Good code quality with some areas for improvement.';
    if (score >= 40) return 'There are several areas that need attention.';
    return 'Significant improvements needed in code quality.';
  };

  return (
    <div className="flex flex-col items-center space-y-4 bg-skycast-beige p-6 rounded-lg shadow-lg">
      {/* Circular Progress */}
      <div className="relative w-32 h-32">
        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
          {/* Background Circle */}
          <circle
            cx="60"
            cy="60"
            r="50"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-skycast-lightBlue"
          />
          {/* Progress Circle */}
          <circle
            cx="60"
            cy="60"
            r="50"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 50}`}
            strokeDashoffset={`${2 * Math.PI * 50 * (1 - score / 100)}`}
            className={`transition-all duration-1000 ease-out ${getScoreColor(score)}`}
          />
        </svg>
        
        {/* Score Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={`text-3xl font-bold ${getScoreColor(score)}`}>
            {score}
          </div>
          <div className="text-xs text-skycast-blue">
            / 100
          </div>
        </div>
      </div>

      {/* Score Label and Description */}
      <div className="text-center">
        <h3 className={`text-xl font-semibold ${getScoreColor(score)} mb-2`}>
          {getScoreLabel(score)}
        </h3>
        <p className="text-sm text-skycast-blue max-w-xs">
          {getScoreDescription(score)}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-64">
        <div className="flex justify-between text-xs text-skycast-blue mb-1">
          <span>0</span>
          <span>25</span>
          <span>50</span>
          <span>75</span>
          <span>100</span>
        </div>
        <div className="w-full bg-skycast-lightBlue rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-1000 ease-out ${getScoreBgColor(score)}`}
            style={{ width: `${score}%` }}
          ></div>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
        <div className="text-center p-3 bg-skycast-lightBlue rounded-lg">
          <div className="font-semibold text-skycast-blue">Quality</div>
          <div className={`text-lg font-bold ${getScoreColor(score)}`}>
            {score >= 80 ? 'A' : score >= 60 ? 'B' : score >= 40 ? 'C' : 'D'}
          </div>
        </div>
        <div className="text-center p-3 bg-skycast-lightBlue rounded-lg">
          <div className="font-semibold text-skycast-blue">Status</div>
          <div className={`text-sm font-medium ${getScoreColor(score)}`}>
            {score >= 60 ? 'Pass' : 'Review'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoreMeter;
