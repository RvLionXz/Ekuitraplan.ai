"use client";

import Image from "next/image";
import { Star, Leaf } from "lucide-react";
import type { Hotel } from "@/types";

interface HotelCardProps {
  hotel: Hotel;
  onSelect?: (hotel: Hotel) => void;
  isSelected?: boolean;
}

export function HotelCard({ hotel, onSelect, isSelected }: HotelCardProps) {
  return (
    <div
      onClick={() => onSelect?.(hotel)}
      className={`p-4 bg-surface rounded-xl border transition-all cursor-pointer ${
        isSelected
          ? "border-primary ring-2 ring-primary/20"
          : "border-gray-100 hover:border-primary/50"
      }`}
    >
      <div className="relative aspect-video rounded-lg overflow-hidden mb-3">
        <Image
          src={hotel.image}
          alt={hotel.name}
          fill
          className="object-cover"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-text-primary line-clamp-1">{hotel.name}</h4>
          <div className="flex items-center gap-1 text-amber-500">
            <Star size={14} fill="currentColor" />
            <span className="text-sm font-medium">{hotel.rating}</span>
          </div>
        </div>

        <p className="text-sm text-text-secondary line-clamp-2">
          {hotel.description}
        </p>

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full flex items-center gap-1">
            <Leaf size={12} />
            {hotel.eco_badge}
          </span>
          <span className="text-sm font-bold text-text-primary">{hotel.price}</span>
        </div>
      </div>
    </div>
  );
}