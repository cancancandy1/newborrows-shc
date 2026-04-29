// components/equipment/EquipmentCard.tsx - การ์ดแสดงอุปกรณ์
'use client'

import Image from 'next/image'
import { useState } from 'react'
import type { SelectedEquipment } from '../../types'

interface EquipmentCardProps {
  equipment: {
    id: number
    code: string
    name: string
    description: string | null
    availableStock: number
    imageUrl: string | null
    category: { name: string }
  }
  onSelect: (item: SelectedEquipment, quantity: number) => void
  selectedQuantity?: number
}

export default function EquipmentCard({ equipment, onSelect, selectedQuantity = 0 }: EquipmentCardProps) {
  const [qty, setQty] = useState(1)
  const isOutOfStock = equipment.availableStock <= 0
  const isSelected = selectedQuantity > 0
  const maxQty = equipment.availableStock

  const handleSelect = () => {
    if (isOutOfStock) return
    onSelect(
      {
        id: equipment.id,
        code: equipment.code,
        name: equipment.name,
        availableStock: equipment.availableStock,
        imageUrl: equipment.imageUrl,
        categoryName: equipment.category.name,
        quantity: qty,
      },
      qty
    )
  }

  return (
    <div
      className={`bg-white rounded-xl border-2 transition-all duration-200 overflow-hidden hover:shadow-md ${
        isSelected ? 'border-blue-500 shadow-blue-100 shadow-md' : 'border-gray-100 hover:border-gray-200'
      }`}
    >
      {/* รูปภาพอุปกรณ์ */}
      <div className="relative h-44 bg-gray-50">
        {equipment.imageUrl ? (
          <Image
            src={equipment.imageUrl}
            alt={equipment.name}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-300">
            <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        )}

        {/* badge หมวดหมู่ */}
        <div className="absolute top-2 left-2">
          <span className="bg-white/90 text-gray-600 text-xs px-2 py-0.5 rounded-full border border-gray-200">
            {equipment.category.name}
          </span>
        </div>

        {/* badge หมดสต็อก */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center">
            <span className="bg-red-500 text-white text-sm font-semibold px-3 py-1 rounded-full">
              หมดชั่วคราว
            </span>
          </div>
        )}

        {/* badge เลือกแล้ว */}
        {isSelected && (
          <div className="absolute top-2 right-2">
            <div className="bg-blue-500 text-white w-7 h-7 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* เนื้อหา */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1 text-lg">{equipment.name}</h3>
        <p className="text-xs text-gray-400 mb-2">รหัส: {equipment.code}</p>

        {equipment.description && (
          <p className="text-sm text-gray-500 mb-2 line-clamp-2">{equipment.description}</p>
        )}

        {/* คงเหลือ */}
        <div className="flex items-center gap-1 mb-2">
          <div className={`w-2 h-2 rounded-full ${isOutOfStock ? 'bg-red-400' : 'bg-green-400'}`} />
          <span className="text-md text-gray-500">
            คงเหลือ:{' '}
            <strong className={isOutOfStock ? 'text-red-500' : 'text-green-600'}>
              {equipment.availableStock}
            </strong>{' '}
            ชิ้น
          </span>
        </div>

        {/* Quantity selector + select button */}
        {!isOutOfStock && (
          <div className="flex items-center gap-2 mt-auto">
            {/* quantity input */}
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="px-2 py-1.5 text-gray-500 hover:bg-gray-50 transition-colors"
              >
                −
              </button>
              <span className="px-3 py-1.5 text-sm font-medium min-w-[2rem] text-center">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                className="px-2 py-1.5 text-gray-500 hover:bg-gray-50 transition-colors"
              >
                +
              </button>
            </div>

            {/* select button */}
            <button
              onClick={handleSelect}
              className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isSelected
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isSelected ? `เลือกแล้ว (${selectedQuantity})` : 'เลือก'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
