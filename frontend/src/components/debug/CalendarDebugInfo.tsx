import React from 'react';

interface DebugInfoProps {
  shifts: any[];
  events: any[];
}

const CalendarDebugInfo: React.FC<DebugInfoProps> = ({ shifts, events }) => {
  return (
    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-4">
      <h3 className="font-bold text-yellow-800 mb-2">🐛 Calendar Debug Info</h3>
      <div className="space-y-2 text-sm">
        <div>
          <strong>Shifts received:</strong> {shifts?.length || 0}
        </div>
        <div>
          <strong>Events processed:</strong> {events?.length || 0}
        </div>
        {shifts && shifts.length > 0 && (
          <div>
            <strong>Sample shift:</strong>
            <pre className="bg-white p-2 rounded mt-1 text-xs overflow-auto">
              {JSON.stringify(shifts[0], null, 2)}
            </pre>
          </div>
        )}
        {events && events.length > 0 && (
          <div>
            <strong>Sample event:</strong>
            <pre className="bg-white p-2 rounded mt-1 text-xs overflow-auto">
              {JSON.stringify({
                id: events[0]?.id,
                title: events[0]?.title,
                start: events[0]?.start?.toISOString(),
                end: events[0]?.end?.toISOString(),
              }, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarDebugInfo;
