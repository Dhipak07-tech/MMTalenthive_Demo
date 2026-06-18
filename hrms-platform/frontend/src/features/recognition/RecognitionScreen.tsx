import React, { useState } from 'react';
import { 
  Award, Sparkles, Send, Trophy, 
  Plus, MessageSquare, ThumbsUp 
} from 'lucide-react';

export function RecognitionScreen() {
  const [recognitions, setRecognitions] = useState([
    {
      id: '1',
      giver: 'Michael Chen',
      giverRole: 'Director of Engineering',
      receiver: 'Sarah Johnson',
      type: 'SPOT',
      title: 'Architectural Excellence',
      message: 'Phenomenal work on the core modular monolith foundation. The DDD structuring and TenantContext design are world-class!',
      points: 150,
      badge: 'Super Architect',
      date: '2 hours ago'
    },
    {
      id: '2',
      giver: 'John Doe',
      giverRole: 'Super Admin',
      receiver: 'Mike Chen',
      type: 'MILESTONE',
      title: 'Awesome Leadership',
      message: 'Great execution directing the platform bootstrap phase. Delivering ahead of schedule with zero blockers!',
      points: 200,
      badge: 'Visionary Leader',
      date: '1 day ago'
    }
  ]);

  const [leaderboard] = useState([
    { rank: 1, name: 'Sarah Johnson', points: 1250, role: 'Senior Staff Engineer' },
    { rank: 2, name: 'Mike Chen', points: 980, role: 'Director of Eng' },
    { rank: 3, name: 'Alex Wong', points: 840, role: 'Staff Eng' }
  ]);

  const [showRecognizeModal, setShowRecognizeModal] = useState(false);
  const [newRec, setNewRec] = useState({
    receiver: 'Sarah Johnson',
    type: 'PEER',
    title: '',
    message: '',
    points: 50,
    badge: 'Team Player'
  });

  const handleSubmittingRecognition = (e: React.FormEvent) => {
    e.preventDefault();
    const rec = {
      id: String(recognitions.length + 1),
      giver: 'John Doe',
      giverRole: 'Super Admin',
      receiver: newRec.receiver,
      type: newRec.type,
      title: newRec.title,
      message: newRec.message,
      points: Number(newRec.points),
      badge: newRec.badge,
      date: 'Just now'
    };

    setRecognitions([rec, ...recognitions]);
    setShowRecognizeModal(false);
    setNewRec({ receiver: 'Sarah Johnson', type: 'PEER', title: '', message: '', points: 50, badge: 'Team Player' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Recognition & Awards</h1>
          <p className="text-sm text-surface-500 mt-1">Celebrate team achievements, award badges, and view recognition points leaderboard.</p>
        </div>
        <button 
          onClick={() => setShowRecognizeModal(true)}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all shadow-md shadow-primary-600/15 hover:shadow-lg"
        >
          <Plus className="w-4 h-4" /> Recognize Peer
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recognition Feed */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 p-5">
            <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Recognition Feed</h2>
            
            <div className="space-y-6">
              {recognitions.map((rec) => (
                <div key={rec.id} className="border-b border-surface-100 dark:border-surface-700/50 pb-6 last:border-b-0 last:pb-0 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                      {rec.giver.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-surface-900 dark:text-white">
                        <span className="font-bold">{rec.giver}</span>
                        <span className="text-surface-400 font-medium"> recognized </span>
                        <span className="font-bold text-primary-600 dark:text-primary-400">{rec.receiver}</span>
                      </p>
                      <p className="text-[10px] text-surface-400 font-semibold mt-0.5">{rec.giverRole} • {rec.date}</p>
                    </div>
                    <span className="text-xs bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> +{rec.points} pts
                    </span>
                  </div>

                  <div className="bg-surface-50 dark:bg-surface-900/50 p-4 rounded-xl border border-surface-100 dark:border-surface-700 space-y-2">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-amber-500 shrink-0" />
                      <h4 className="font-bold text-sm text-surface-800 dark:text-white">{rec.title}</h4>
                    </div>
                    <p className="text-xs text-surface-600 dark:text-surface-300 leading-relaxed">
                      "{rec.message}"
                    </p>
                    {rec.badge && (
                      <div className="pt-2 flex items-center gap-1.5">
                        <span className="text-[9px] uppercase font-bold tracking-wider text-primary-700 bg-primary-50 dark:bg-primary-950/30 dark:text-primary-400 px-2 py-0.5 rounded-full border border-primary-100 dark:border-primary-900/30">
                          🏅 {rec.badge}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-surface-400 font-semibold">
                    <button className="flex items-center gap-1 hover:text-primary-600 transition-colors">
                      <ThumbsUp className="w-3.5 h-3.5" /> Like
                    </button>
                    <button className="flex items-center gap-1 hover:text-primary-600 transition-colors">
                      <MessageSquare className="w-3.5 h-3.5" /> Comment
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Leaderboard & Gamification Panel */}
        <div className="space-y-6">
          {/* Points Card */}
          <div className="bg-gradient-to-br from-primary-600 to-indigo-700 text-white rounded-xl p-5 border border-primary-500/10 shadow-lg shadow-primary-600/15 relative overflow-hidden">
            <div className="absolute right-0 bottom-0 opacity-10">
              <Trophy className="w-48 h-48 translate-x-12 translate-y-12" />
            </div>
            <p className="text-xs uppercase font-bold tracking-wider opacity-85">Your Available Points</p>
            <p className="text-4xl font-black mt-2">1,450</p>
            <p className="text-[10px] mt-4 opacity-80">Redeem points for tech gear, gift cards, or learning budgets.</p>
          </div>

          {/* Leaderboard Card */}
          <div className="bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 p-5">
            <h2 className="text-base font-bold text-surface-900 dark:text-white mb-4">Top Recognised Champions</h2>
            <div className="space-y-4">
              {leaderboard.map(user => (
                <div key={user.rank} className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-700/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className={`w-5 text-center font-bold text-sm ${
                      user.rank === 1 ? 'text-amber-500' : user.rank === 2 ? 'text-slate-400' : 'text-amber-700'
                    }`}>
                      {user.rank}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-surface-800 dark:text-white">{user.name}</p>
                      <p className="text-[10px] text-surface-400 font-semibold">{user.role}</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-primary-600 dark:text-primary-400">
                    {user.points} pts
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recognize Peer Modal */}
      {showRecognizeModal && (
        <div className="fixed inset-0 bg-surface-950/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 w-full max-w-md p-6 shadow-2xl animate-fade-in">
            <div className="flex justify-between items-center border-b border-surface-100 dark:border-surface-700 pb-3">
              <h3 className="text-lg font-bold text-surface-900 dark:text-white">Recognize A Colleague</h3>
              <button 
                onClick={() => setShowRecognizeModal(false)}
                className="text-surface-400 hover:text-surface-600 dark:hover:text-white text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmittingRecognition} className="space-y-4 mt-4">
              <div>
                <label className="text-xs font-semibold text-surface-500 uppercase">Select Colleague</label>
                <select 
                  value={newRec.receiver}
                  onChange={e => setNewRec({ ...newRec, receiver: e.target.value })}
                  className="w-full mt-1.5 px-3 py-2 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500/30 text-surface-800 dark:text-surface-200 font-semibold"
                >
                  <option>Sarah Johnson</option>
                  <option>Michael Chen</option>
                  <option>Alex Wong</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-surface-500 uppercase">Badge Awarded</label>
                  <select 
                    value={newRec.badge}
                    onChange={e => setNewRec({ ...newRec, badge: e.target.value })}
                    className="w-full mt-1.5 px-3 py-2 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500/30 text-surface-800 dark:text-surface-200 font-semibold"
                  >
                    <option>Team Player</option>
                    <option>Super Architect</option>
                    <option>Problem Solver</option>
                    <option>Customer Obsessed</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-surface-500 uppercase">Points To Gift</label>
                  <input 
                    type="number" 
                    required
                    min={10}
                    max={500}
                    value={newRec.points}
                    onChange={e => setNewRec({ ...newRec, points: Number(e.target.value) })}
                    className="w-full mt-1.5 px-3 py-2 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500/30 text-surface-800 dark:text-surface-200 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-surface-500 uppercase">Recognition Title</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Saved the release!"
                  value={newRec.title}
                  onChange={e => setNewRec({ ...newRec, title: e.target.value })}
                  className="w-full mt-1.5 px-3 py-2 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500/30 text-surface-800 dark:text-surface-200"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-surface-500 uppercase">Message</label>
                <textarea 
                  required
                  rows={3}
                  placeholder="Describe how they went above and beyond..."
                  value={newRec.message}
                  onChange={e => setNewRec({ ...newRec, message: e.target.value })}
                  className="w-full mt-1.5 px-3 py-2 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500/30 text-surface-800 dark:text-surface-200"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-surface-100 dark:border-surface-700/50">
                <button 
                  type="button"
                  onClick={() => setShowRecognizeModal(false)}
                  className="flex-1 py-2 border border-surface-200 dark:border-surface-700 text-sm font-semibold rounded-lg hover:bg-surface-50 dark:hover:bg-surface-700 text-surface-600 dark:text-surface-300 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg transition-all shadow-md shadow-primary-600/10 hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" /> Award Recognition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
