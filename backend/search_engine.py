"""
Search Engine

Simple full-text search for Featured Deals
In-memory indexing with tokenization
"""
from typing import List, Dict, Any
import re
import logging

logger = logging.getLogger(__name__)

# Global search index
_search_index = []
_index_built = False


def tokenize(text: str) -> List[str]:
    """
    Tokenize text into searchable terms
    
    Args:
        text: Input text
        
    Returns:
        List of lowercase tokens
    """
    # Convert to lowercase
    text = text.lower()
    
    # Extract alphanumeric words
    tokens = re.findall(r'\w+', text)
    
    return tokens


def build_search_index(deals: List[Dict[str, Any]]):
    """
    Build search index from deals
    
    Args:
        deals: List of Featured Deals
    """
    global _search_index, _index_built
    
    _search_index = []
    
    for deal in deals:
        # Extract searchable fields
        searchable_text = ' '.join([
            str(deal.get('brand', '')),
            str(deal.get('model', '')),
            str(deal.get('trim', '')),
            str(deal.get('year', '')),
            str(deal.get('bank', '')),
            str(deal.get('region', ''))
        ])
        
        # Tokenize
        tokens = tokenize(searchable_text)
        
        # Add to index
        _search_index.append({
            'deal_id': deal.get('id'),
            'tokens': set(tokens),
            'brand': deal.get('brand', ''),
            'model': deal.get('model', ''),
            'year': deal.get('year', ''),
            'payment': deal.get('calculated_payment', 0),
            'driveoff': deal.get('calculated_driveoff', 0),
            'image_url': deal.get('image_url', ''),
            'bank': deal.get('bank', ''),
            'trim': deal.get('trim', '')
        })
    
    _index_built = True
    logger.info(f"Search index built: {len(_search_index)} deals indexed")


async def index_deals(db):
    """
    Index all deals from database
    
    Args:
        db: Database instance
    """
    deals = await db.featured_deals.find({}, {"_id": 0}).to_list(length=None)
    build_search_index(deals)


def search_deals(query: str, max_results: int = 20) -> List[Dict[str, Any]]:
    """
    Search indexed deals
    
    Args:
        query: Search query
        max_results: Maximum number of results
        
    Returns:
        List of matching deals
    """
    if not _index_built or not query:
        return []
    
    # Tokenize query
    query_tokens = set(tokenize(query))
    
    # Check for payment range in query (e.g. "300" or "under 400")
    payment_filter = None
    numbers = re.findall(r'\d+', query)
    if numbers:
        payment_filter = int(numbers[0])
    
    # Score each deal
    results = []
    
    for indexed in _search_index:
        # Calculate token match score
        matching_tokens = query_tokens.intersection(indexed['tokens'])
        score = len(matching_tokens)
        
        # Partial matches
        for query_token in query_tokens:
            for index_token in indexed['tokens']:
                if query_token in index_token or index_token in query_token:
                    score += 0.5
        
        # Payment filter
        if payment_filter:
            if indexed['payment'] > payment_filter + 50:
                score *= 0.5  # Penalize if over budget
        
        if score > 0:
            results.append({
                'score': score,
                **indexed
            })
    
    # Sort by score
    results.sort(key=lambda x: x['score'], reverse=True)
    
    # Return top results
    return results[:max_results]


def get_index_status() -> Dict[str, Any]:
    """
    Get search index status
    
    Returns:
        Status dict
    """
    return {
        "built": _index_built,
        "total_deals": len(_search_index)
    }
