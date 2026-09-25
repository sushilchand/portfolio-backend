from enum import Enum

class Verdict(str, Enum):
    EXCELLENT_MATCH = "Excellent Match"
    STRONG_MATCH = "Strong Match"
    GOOD_MATCH = "Good Match"
    PARTIAL_MATCH = "Partial Match"
    WEAK_MATCH = "Weak Match"
    POOR_MATCH = "Poor Match"


class MatchType(str, Enum):
    EXACT = "exact"
    RELATED = "related"


class RequirementImportance(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
