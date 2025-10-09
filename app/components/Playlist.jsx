"use client";
import React from "react";
import { GripVertical } from "lucide-react";

const glassmorphismStyle =
  "bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-lg";

export default function Playlist({
  track = [],
  currentTrackIndex = 0,
  onTrackSelect = () => {},
}) {
  return (
    <aside className={`${glassmorphismStyle} p-6 flex flex-col w-80`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white/90">Next Up</h3>
        <p className="text-sm text-white/50">{track.length} songs</p>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto pr-2">
        {track.map((song, index) => {
          const key = song._id ?? song.videoId ?? index;
          return (
            <div
              key={key}
              onClick={() => onTrackSelect(index)}
              className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors ${
                index === currentTrackIndex
                  ? "bg-white/20"
                  : "hover:bg-white/10"
              }`}
            >
              <div className="w-10 h-10 rounded bg-gradient-to-br from-pink-500 to-yellow-300 mr-4 flex-shrink-0"></div>
              <div className="flex-1">
                <p className="font-medium text-white/90 text-sm">
                  {song.title ?? "제목 없음"}
                </p>
                {song.artist && (
                  <p className="text-xs text-white/50">{song.artist}</p>
                )}
              </div>
              <button className="text-white/50 hover:text-white">
                <GripVertical size={20} />
              </button>
            </div>
          );
        })}
      </div>
      <button className="mt-4 w-full bg-white/90 text-slate-800 py-2.5 rounded-lg font-semibold hover:bg-white transition-colors shadow-md">
        Save Playlist
      </button>
    </aside>
  );
}
