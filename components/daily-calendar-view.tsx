"use client"

import { useState, useMemo } from "react"
import { Calendar, Clock, User, ImageIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import type { Appointment, Staff } from "@/lib/types/crm"
import { format, addDays, subDays, isToday } from "date-fns"

interface DailyCalendarViewProps {
  appointments: Appointment[]
  staff: Staff[]
  selectedDate?: Date
  onDateChange?: (date: Date) => void
}

export function DailyCalendarView({
  appointments,
  staff,
  selectedDate: externalDate,
  onDateChange,
}: DailyCalendarViewProps) {
  const [internalDate, setInternalDate] = useState(new Date())
  const selectedDate = externalDate || internalDate

  const handleDateChange = (newDate: Date) => {
    if (onDateChange) {
      onDateChange(newDate)
    } else {
      setInternalDate(newDate)
    }
  }

  const goToToday = () => {
    handleDateChange(new Date())
  }

  const goToPreviousDay = () => {
    handleDateChange(subDays(selectedDate, 1))
  }

  const goToNextDay = () => {
    handleDateChange(addDays(selectedDate, 1))
  }

  // Filter appointments for selected date
  const dayAppointments = useMemo(() => {
    const dateStr = format(selectedDate, "yyyy-MM-dd")
    return appointments.filter((apt) => apt.date === dateStr)
  }, [appointments, selectedDate])

  // Group appointments by staff
  const appointmentsByStaff = useMemo(() => {
    const grouped: Record<string, Appointment[]> = {}
    dayAppointments.forEach((apt) => {
      if (!grouped[apt.staffId]) {
        grouped[apt.staffId] = []
      }
      grouped[apt.staffId].push(apt)
    })
    return grouped
  }, [dayAppointments])

  // Calculate end time for appointment
  const getEndTime = (appointment: Appointment): string => {
    const staffMember = staff.find((s) => s.id === appointment.staffId)
    const totalDuration = appointment.baseDuration + (staffMember?.extraMinutes || 0)

    const [hours, minutes] = appointment.startTime.split(":").map(Number)
    const startDate = new Date(selectedDate)
    startDate.setHours(hours, minutes, 0, 0)
    const endDate = new Date(startDate.getTime() + totalDuration * 60000)

    return format(endDate, "HH:mm")
  }

  return (
    <div className="space-y-6">
      {/* Date selector */}
      <div className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <Button
          variant="outline"
          size="sm"
          onClick={goToPreviousDay}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Anterior
        </Button>

        <div className="flex items-center gap-4">
          <Button
            variant={isToday(selectedDate) ? "default" : "outline"}
            onClick={goToToday}
            className="flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            Hoy
          </Button>
          <div className="text-center">
            <p className="text-lg font-bold text-[#2C293F]">
              {format(selectedDate, "EEEE, d 'de' MMMM")}
            </p>
            <p className="text-sm text-gray-600">{format(selectedDate, "yyyy")}</p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={goToNextDay}
          className="flex items-center gap-2"
        >
          Siguiente
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Appointments list */}
      {dayAppointments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-semibold text-gray-600">No hay citas programadas</p>
          <p className="text-sm text-gray-500 mt-2">para este día</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(appointmentsByStaff).map(([staffId, staffAppointments]) => {
            const staffMember = staff.find((s) => s.id === staffId)
            return (
              <div key={staffId} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-[#2C293F] mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-[#AFA1FD]" />
                  {staffMember?.name || `Staff ${staffId}`}
                </h3>
                <div className="space-y-3">
                  {staffAppointments
                    .sort((a, b) => a.startTime.localeCompare(b.startTime))
                    .map((appointment) => {
                      const endTime = getEndTime(appointment)
                      const hasImages = appointment.inspirationImages.length > 0
                      return (
                        <motion.div
                          key={appointment.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-200 hover:border-[#AFA1FD] transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="flex items-center gap-2 text-sm font-semibold text-[#2C293F]">
                                  <Clock className="w-4 h-4 text-[#AFA1FD]" />
                                  {appointment.startTime} - {endTime}
                                </div>
                                {hasImages && (
                                  <div className="flex items-center gap-1 text-xs text-[#AFA1FD]">
                                    <ImageIcon className="w-3 h-3" />
                                    <span>Con fotos</span>
                                  </div>
                                )}
                              </div>
                              <p className="font-semibold text-[#2C293F] mb-1">{appointment.serviceName}</p>
                              <p className="text-sm text-gray-600">Cliente: {appointment.customerId}</p>
                              {appointment.notes && (
                                <p className="text-xs text-gray-500 mt-2 italic">{appointment.notes}</p>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
