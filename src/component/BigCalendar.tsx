"use client"
import { Calendar, momentLocalizer, View, Views } from 'react-big-calendar'
import moment from 'moment'
import { calendarEvents } from '@/lib/data'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import 'moment/locale/id' // Import the locale you want to use
import { useState } from 'react'

const localizer = momentLocalizer(moment)

const BigCalendar = () => {
    const [view, setView] = useState<View>(Views.WEEK);

    function handleOnChangeView(selectedView: View) {
        setView(selectedView)
    }
    return (
        <Calendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            views={['week', 'day']}
            view={view}
            onView={handleOnChangeView}
            style={{ height: "98%" }}
            formats={{
                dayFormat: (date, culture, localizer) =>
                    localizer?.format(date, 'ddd, D MMM', culture) || '',
                timeGutterFormat: (date) => moment(date).format('HH:mm'),
                eventTimeRangeFormat: ({ start, end }, culture, localizer) =>
                    `${moment(start).format('HH:mm')} – ${moment(end).format('HH:mm')}`,
            }}
        />
    );
};

export default BigCalendar;