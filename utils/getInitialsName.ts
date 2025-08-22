
export const getInitials = (name?: string) => {
    if (!name) return "?"
    const nameParts = name.trim().split(" ")
    if (nameParts.length > 1) {
      return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }