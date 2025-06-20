"use client";

import { MoreHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

type ValuePiece = Date | null;

type Value = ValuePiece | [ValuePiece, ValuePiece];

const EventCalendar = () => {
    const [value, onChange] = useState<Value>(new Date());
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchEvents() {
            setLoading(true);
            setError(null);
            try {
                // Always use the backend API URL, never /api for direct backend calls
                let apiUrl = process.env.NEXT_PUBLIC_API_URL;
                if (!apiUrl) apiUrl = 'http://localhost:3001';
                const res = await fetch(`${apiUrl}/events`);
                if (!res.ok) throw new Error("Gagal memuat data event");
                const data = await res.json();
                setEvents(data);
            } catch (e: any) {
                setError(e?.message || "Gagal memuat data event");
            } finally {
                setLoading(false);
            }
        }
        fetchEvents();
    }, []);

    // Filter events for the selected date
    const selectedDate = value instanceof Date ? value : value?.[0];
    const eventsForDate = selectedDate
        ? events.filter(event => {
            const eventDate = new Date(event.tanggalMulai || event.tanggal || event.tanggalSelesai);
            return (
                eventDate.getFullYear() === selectedDate.getFullYear() &&
                eventDate.getMonth() === selectedDate.getMonth() &&
                eventDate.getDate() === selectedDate.getDate()
            );
        })
        : events;

    return (
        <div className="bg-white p-4 rounded-md">
            <Calendar onChange={onChange} value={value} />
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold my-4">Events</h1>
                <MoreHorizontal size={20} className="text-gray-600" />
            </div>
            {loading && <div className="text-gray-400">Loading...</div>}
            {error && <div className="text-red-500">{error}</div>}
            <div className="flex flex-col gap-4">
                {eventsForDate.length === 0 && !loading && (
                    <div className="text-gray-400 text-sm">Tidak ada event pada tanggal ini.</div>
                )}
                {eventsForDate.map((event) => (
                    <div
                        className="p-5 rounded-md border-2 border-gray-100 border-t-4 odd:border-t-lamaSky even:border-t-lamaPurple"
                        key={event.id}
                    >
                        <div className="flex items-center justify-between">
                            <h1 className="font-semibold text-gray-600">{event.nama || event.title}</h1>
                            <span className="text-gray-300 text-xs">
                                {event.waktuMulai && event.waktuSelesai
                                    ? `${event.waktuMulai} - ${event.waktuSelesai}`
                                    : event.time || "-"}
                            </span>
                        </div>
                        <p className="mt-2 text-gray-400 text-sm">{event.deskripsi || event.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EventCalendar;