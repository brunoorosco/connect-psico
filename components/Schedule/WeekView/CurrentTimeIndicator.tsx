import React, { useEffect, useState } from "react"

const PIXELS_PER_MINUTE = 32 / 30 // h-8 = 32px, interval = 30min

export const CurrentTimeIndicator: React.FC = () => {
    const [top, setTop] = useState(0)

    useEffect(() => {
        const updatePosition = () => {
            const now = new Date()
            // Como a agenda começa em 00:00 (baseado em useTimeSlots),
            // o cálculo é direto: minutos totais do dia * pixels por minuto.
            const totalMinutes = now.getHours() * 60 + now.getMinutes()
            setTop(totalMinutes * PIXELS_PER_MINUTE)
        }

        updatePosition()
        const interval = setInterval(updatePosition, 60000) // Atualiza a cada minuto

        return () => clearInterval(interval)
    }, [])

    return (
        <div
            className="absolute w-full flex items-center z-50 pointer-events-none"
            style={{ top: `${top}px` }}
        >
            {/* Seta esquerda (apontando p/ dentro -> direita) */}
            <div className="w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[8px] border-l-red-500" />

            {/* Linha */}
            <div className="h-[2px] bg-red-500 flex-1" />

            {/* Seta direita (apontando p/ dentro -> esquerda) */}
            <div className="w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-r-[8px] border-r-red-500" />
        </div>
    )
}
