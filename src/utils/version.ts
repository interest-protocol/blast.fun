/**
 * Compare two semantic version strings
 * Returns: 1 if v1 > v2, -1 if v1 < v2, 0 if equal
 */
export function compareVersions(v1: string, v2: string): number {
	const parts1 = v1.split('.').map(Number)
	const parts2 = v2.split('.').map(Number)
	
	for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
		const part1 = parts1[i] || 0
		const part2 = parts2[i] || 0
		
		if (part1 > part2) return 1
		if (part1 < part2) return -1
	}
	
	return 0
}

/**
 * Check if a version needs update
 * Returns true if currentVersion is greater than acceptedVersion
 */
export function needsTermsUpdate(acceptedVersion: string | null, currentVersion: string): boolean {
	if (!acceptedVersion) return true
	return compareVersions(currentVersion, acceptedVersion) > 0
}