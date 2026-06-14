/**
 * Lightweight fuzzy search matching algorithm for local DB sorting
 * Calculates Levenshtein distance and returns a similarity score.
 */

// Calculate Levenshtein distance between two strings
const getEditDistance = (a, b) => {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix = [];

    // Increment along the first column of each row
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    // Increment each column in the first row
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    // Fill in the rest of the matrix
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    Math.min(
                        matrix[i][j - 1] + 1, // insertion
                        matrix[i - 1][j] + 1  // deletion
                    )
                );
            }
        }
    }

    return matrix[b.length][a.length];
};

/**
 * Fuzzy matches a query against a target string and returns a similarity score (0 to 1)
 * 1 is an exact match, 0 is completely different.
 */
export const fuzzyScore = (query, target) => {
    if (!query || !target) return 0;
    
    const q = query.toLowerCase().trim();
    const t = target.toLowerCase().trim();
    
    // Exact match or contains
    if (q === t) return 1;
    if (t.includes(q)) return 0.8 + (q.length / t.length) * 0.1; // Bonus for covering more of the word
    
    // Subsequence match (e.g. "bhl" matches "bahubali")
    let qIdx = 0;
    for (let i = 0; i < t.length; i++) {
        if (t[i] === q[qIdx]) {
            qIdx++;
        }
        if (qIdx === q.length) {
            return 0.6 + (q.length / t.length) * 0.1; // Found as subsequence
        }
    }
    
    // Levenshtein as fallback
    const distance = getEditDistance(q, t);
    const maxLength = Math.max(q.length, t.length);
    
    if (maxLength === 0) return 1;
    const similarity = (maxLength - distance) / maxLength;
    
    // Only return significant similarity, else 0
    return similarity > 0.4 ? similarity : 0;
};
