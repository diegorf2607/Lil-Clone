"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Calendar } from "lucide-react"

interface BirthdateFieldProps {
  value: string
  onChange: (value: string) => void
  label?: string
  required?: boolean
  className?: string
}

export function BirthdateField({
  value,
  onChange,
  label = "Fecha de nacimiento",
  required = false,
  className,
}: BirthdateFieldProps) {
  const maxDate = new Date().toISOString().split("T")[0] // Today
  const minDate = new Date(new Date().setFullYear(new Date().getFullYear() - 120))
    .toISOString()
    .split("T")[0] // 120 years ago

  return (
    <div className={className}>
      <Label htmlFor="birthdate" className="text-[#2C293F] font-semibold mb-2 block">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <div className="relative">
        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          id="birthdate"
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          min={minDate}
          max={maxDate}
          className="pl-10 border-gray-300 focus:border-[#AFA1FD]"
        />
      </div>
    </div>
  )
}
