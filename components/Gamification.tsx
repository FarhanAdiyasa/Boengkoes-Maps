import React from 'react';
import { UserStats, Badge } from '../types';

interface Props {
  stats: UserStats;
}

const Gamification: React.FC<Props> = ({ stats }) => {
  const nextLevel = (Math.floor(stats.checkIns.length / 5) + 1) * 5;
  const progress = (stats.checkIns.length % 5) / 5 * 100;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Boengkoes Warrior</h2>
          <p className="text-sm text-gray-500">Level {stats.level} Explorer</p>
        </div>
        <div className="w-16 h-16 bg-brand-yellow rounded-full flex items-center justify-center text-2xl shadow-inner border-4 border-white">
          {stats.level}
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between text-xs font-semibold text-gray-500 mb-1">
          <span>Progress to Lvl {stats.level + 1}</span>
          <span>{stats.checkIns.length} / {nextLevel} Spots</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
          <div 
            className="bg-brand-red h-2.5 rounded-full transition-all duration-500 ease-out" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide">Badges</h3>
        <div className="grid grid-cols-4 gap-4">
          {stats.badges.map((badge) => (
            <div key={badge.id} className="flex flex-col items-center text-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl mb-1 ${badge.unlocked ? 'bg-brand-orange text-white shadow-md' : 'bg-gray-100 text-gray-400 grayscale'}`}>
                {badge.icon}
              </div>
              <span className={`text-[10px] font-medium leading-tight ${badge.unlocked ? 'text-gray-800' : 'text-gray-400'}`}>
                {badge.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Gamification;
