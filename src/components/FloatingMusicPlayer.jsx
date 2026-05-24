import React, { useState, useRef, useEffect } from 'react';
import { Music, Play, Pause, Volume2, VolumeX } from 'lucide-react';

export default function FloatingMusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.4);
  const [isExpanded, setIsExpanded] = useState(false);
  const audioRef = useRef(null);

  // Soft, relaxing background ambient track
  const audioSrc = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3";

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  const handlePlayPause = (e) => {
    e.stopPropagation();
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(err => {
          console.warn("Autoplay blocked by browser. User interaction required first.");
          alert("Click Play to start the ambient music!");
        });
    }
  };

  const handleMuteToggle = (e) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (newVol > 0) {
      setIsMuted(false);
    }
  };

  return (
    <div 
      className="fixed bottom-6 right-6 z-50 flex items-center transition-all duration-300 ease-out"
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Invisible HTML5 Audio Tag */}
      <audio 
        ref={audioRef} 
        src={audioSrc} 
        loop 
        preload="auto"
      />

      <div className={`flex items-center gap-3 p-3 rounded-full bg-slate-900/90 hover:bg-slate-900 border border-brand-500/30 text-white shadow-3d-glow transition-all duration-300 ${
        isExpanded ? 'px-4 rounded-2xl w-60' : 'w-12 h-12 justify-center'
      }`}>
        {/* Play/Pause Main Button */}
        <button
          onClick={handlePlayPause}
          className={`flex items-center justify-center rounded-full bg-brand-600 hover:bg-brand-500 text-white transition-all duration-300 ${
            isPlaying ? 'animate-pulse' : ''
          } ${isExpanded ? 'w-8 h-8' : 'w-10 h-10'}`}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
        </button>

        {isExpanded && (
          <div className="flex flex-1 items-center gap-2 overflow-hidden animate-fadeIn">
            {/* Visualizer bars when playing */}
            <div className="flex items-end gap-0.5 h-6 px-1">
              <span className={`w-0.5 bg-brand-400 rounded-full transition-all ${isPlaying ? 'animate-[pulse_0.6s_infinite_alternate]' : 'h-1'}`} style={{ height: isPlaying ? '14px' : '4px' }} />
              <span className={`w-0.5 bg-brand-400 rounded-full transition-all ${isPlaying ? 'animate-[pulse_0.8s_infinite_alternate_0.2s]' : 'h-1'}`} style={{ height: isPlaying ? '20px' : '4px' }} />
              <span className={`w-0.5 bg-brand-400 rounded-full transition-all ${isPlaying ? 'animate-[pulse_0.5s_infinite_alternate_0.1s]' : 'h-1'}`} style={{ height: isPlaying ? '10px' : '4px' }} />
              <span className={`w-0.5 bg-brand-400 rounded-full transition-all ${isPlaying ? 'animate-[pulse_0.7s_infinite_alternate_0.3s]' : 'h-1'}`} style={{ height: isPlaying ? '16px' : '4px' }} />
            </div>

            {/* Mute Button */}
            <button 
              onClick={handleMuteToggle}
              className="p-1 rounded text-slate-400 hover:text-white"
            >
              {isMuted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>

            {/* Volume Slider */}
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.05"
              value={isMuted ? 0 : volume} 
              onChange={handleVolumeChange}
              className="w-16 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-500"
            />
          </div>
        )}

        {/* Small Floating Note Icon if collapsed */}
        {!isExpanded && isPlaying && (
          <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-500 text-white animate-bounce">
            <Music className="h-2.5 w-2.5" />
          </div>
        )}
      </div>
    </div>
  );
}
