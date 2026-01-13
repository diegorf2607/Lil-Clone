"use client"

import { useState, useRef } from "react"
import { Upload, X, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import type { InspirationImage } from "@/lib/types/crm"

interface InspirationUploaderProps {
  images: InspirationImage[]
  onChange: (images: InspirationImage[]) => void
  maxImages?: number
  label?: string
  className?: string
}

export function InspirationUploader({
  images,
  onChange,
  maxImages = 3,
  label = "Fotos de inspiración",
  className,
}: InspirationUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const remainingSlots = maxImages - images.length
    if (remainingSlots <= 0) {
      alert(`Solo puedes subir máximo ${maxImages} imágenes`)
      return
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots)

    filesToProcess.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        alert(`${file.name} no es una imagen válida`)
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        const dataUrl = reader.result as string
        const newImage: InspirationImage = {
          name: file.name,
          dataUrl,
        }
        onChange([...images, newImage])
      }
      reader.readAsDataURL(file)
    })

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleRemove = (index: number) => {
    onChange(images.filter((_, i) => i !== index))
  }

  return (
    <div className={className}>
      <Label className="text-[#2C293F] font-semibold mb-2 block">
        {label} ({images.length}/{maxImages})
      </Label>

      <div className="space-y-4">
        {/* Upload button */}
        {images.length < maxImages && (
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-dashed border-2 border-gray-300 hover:border-[#AFA1FD] hover:bg-[#AFA1FD]/5"
          >
            <Upload className="w-4 h-4 mr-2" />
            Adjuntar fotos
          </Button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Image previews */}
        {images.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-100">
                  <img
                    src={image.dataUrl}
                    alt={image.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  aria-label="Eliminar imagen"
                >
                  <X className="w-4 h-4" />
                </button>
                <p className="mt-1 text-xs text-gray-600 truncate">{image.name}</p>
              </div>
            ))}
          </div>
        )}

        {images.length === 0 && (
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
            <ImageIcon className="w-12 h-12 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">No hay fotos de inspiración</p>
            <p className="text-xs text-gray-500 mt-1">Puedes subir hasta {maxImages} imágenes</p>
          </div>
        )}
      </div>
    </div>
  )
}
