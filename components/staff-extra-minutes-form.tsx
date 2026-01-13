"use client"

import { useState, useEffect } from "react"
import { User, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Staff } from "@/lib/types/crm"

interface StaffExtraMinutesFormProps {
  staff: Staff[]
  onUpdate: (staff: Staff) => void
  className?: string
}

export function StaffExtraMinutesForm({ staff, onUpdate, className }: StaffExtraMinutesFormProps) {
  const [localStaff, setLocalStaff] = useState<Staff[]>(staff)

  useEffect(() => {
    setLocalStaff(staff)
  }, [staff])

  const handleMinutesChange = (staffId: string, minutes: number) => {
    const clampedMinutes = Math.max(0, Math.min(60, minutes))
    const updated = localStaff.map((s) => (s.id === staffId ? { ...s, extraMinutes: clampedMinutes } : s))
    setLocalStaff(updated)

    const staffMember = updated.find((s) => s.id === staffId)
    if (staffMember) {
      onUpdate(staffMember)
    }
  }

  return (
    <div className={className}>
      <div className="mb-6">
        <h3 className="text-xl font-bold text-[#2C293F] mb-2 flex items-center gap-2">
          <User className="w-5 h-5 text-[#AFA1FD]" />
          Configuración de Manicuristas
        </h3>
        <p className="text-sm text-gray-600">
          Configura los minutos extra que cada manicurista necesita por atención. Esto afectará la duración
          visual de las citas en el calendario.
        </p>
      </div>

      <div className="space-y-4">
        {localStaff.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">No hay manicuristas configurados</p>
          </div>
        ) : (
          localStaff.map((staffMember) => (
            <div
              key={staffMember.id}
              className="p-4 bg-white rounded-lg border border-gray-200 hover:border-[#AFA1FD] transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label htmlFor={`minutes-${staffMember.id}`} className="text-[#2C293F] font-semibold mb-2 block">
                    {staffMember.name}
                  </Label>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          id={`minutes-${staffMember.id}`}
                          type="number"
                          min="0"
                          max="60"
                          value={staffMember.extraMinutes}
                          onChange={(e) => handleMinutesChange(staffMember.id, parseInt(e.target.value) || 0)}
                          className="pl-10 border-gray-300 focus:border-[#AFA1FD]"
                        />
                      </div>
                    </div>
                    <span className="text-sm text-gray-600 whitespace-nowrap">minutos extra</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Duración total de citas: base + {staffMember.extraMinutes} min
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
