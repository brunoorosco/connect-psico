"use client"

import dynamic from "next/dynamic"

export const SettingsDialogDynamic = dynamic(
  () => import("./SettingsDialog").then(m => m.SettingsDialog),
  { ssr: false }
)
