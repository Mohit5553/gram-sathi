import React, { useState, useEffect } from 'react';
import { Megaphone, ExternalLink } from 'lucide-react';
import api from '../../api/axios';

const AnnouncementBar = ({ village }) => {
  const [announcements, setAnnouncements] = useState([]);
  
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const villageParam = village ? `?village=${encodeURIComponent(village)}` : '';
        const response = await api.get(`/dashboard/announcements${villageParam}`);
        setAnnouncements(response.data || []);
      } catch (error) {
        console.error('Failed to load announcements:', error);
      }
    };
    fetchAnnouncements();
  }, [village]);

  if (announcements.length === 0) return null;

  return (
    <div className="bg-amber-500 text-white py-2 px-4 shadow-sm relative overflow-hidden flex items-center z-25 border-b border-amber-600/35">
      <div className="flex items-center gap-2 font-bold text-xs uppercase bg-amber-600 px-2.5 py-0.5 rounded-md tracking-wider shrink-0 z-10 shadow-sm animate-pulse">
        <Megaphone size={13} className="shrink-0" />
        Announcement
      </div>
      <div className="w-full overflow-hidden whitespace-nowrap relative ml-3">
        <div className="inline-block animate-[marquee_25s_linear_infinite] pl-[100%] text-sm font-semibold tracking-wide">
          {announcements.map((ann, idx) => (
            <span key={ann._id} className="mr-16">
              📢 <strong className="font-extrabold">{ann.title}:</strong> {ann.content}
              {ann.link && (
                <a href={ann.link} target="_blank" rel="noreferrer" className="underline text-amber-105 ml-1.5 inline-flex items-center gap-0.5 font-bold">
                  More info <ExternalLink size={10} />
                </a>
              )}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBar;
