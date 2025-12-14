import { useEffect, useState } from "react"
import { createDashboardTour } from "@/lib/tour/dashboardTour"
import type { DriveStep } from "driver.js"

export function useProductTour() {
    const [tourCompleted, setTourCompleted] = useState(true)

    useEffect(() => {
        // Verificar se o tour já foi concluído
        if (typeof window !== "undefined") {
            const completed = localStorage.getItem("tour_dashboard_completed")
            setTourCompleted(completed === "true")
        }
    }, [])

    const startTour = (tourType: "dashboard" = "dashboard") => {
        if (tourType === "dashboard") {
            const tour = createDashboardTour()
            tour.drive()
        }
    }

    const resetTour = () => {
        if (typeof window !== "undefined") {
            localStorage.removeItem("tour_dashboard_completed")
            setTourCompleted(false)
        }
    }

    const hasSeenTour = tourCompleted

    return {
        startTour,
        resetTour,
        hasSeenTour
    }
}
