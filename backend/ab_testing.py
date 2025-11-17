"""
A/B Testing Module for hunter.lease
Simple variant testing without external dependencies
"""
import random
import hashlib

class ABTest:
    def __init__(self, test_name, variants):
        """
        test_name: unique identifier for test
        variants: dict of variant_name -> config
        """
        self.test_name = test_name
        self.variants = variants
        self.variant_names = list(variants.keys())
    
    def get_variant(self, user_id):
        """Get variant for specific user (consistent)"""
        # Hash user_id to get consistent variant
        hash_val = int(hashlib.md5(f"{self.test_name}_{user_id}".encode()).hexdigest(), 16)
        variant_index = hash_val % len(self.variant_names)
        return self.variant_names[variant_index]
    
    def get_variant_config(self, user_id):
        """Get config for user's variant"""
        variant_name = self.get_variant(user_id)
        return {
            "variant": variant_name,
            "config": self.variants[variant_name]
        }

# Define active A/B tests
ACTIVE_TESTS = {
    "hero_headline": ABTest(
        "hero_headline",
        {
            "control": {
                "headline": "Real Dealer Dump Offers. No BS.",
                "subheadline": "We hunt down the best lease deals in LA so you don't have to."
            },
            "variant_a": {
                "headline": "Save $5K-$15K on Your Next Car Lease",
                "subheadline": "Exclusive dump offers from LA dealers. Updated monthly."
            },
            "variant_b": {
                "headline": "Get Dealer Dump Pricing in Los Angeles",
                "subheadline": "Real offers. Real savings. No dealer games."
            }
        }
    ),
    
    "cta_button": ABTest(
        "cta_button",
        {
            "control": {"text": "Browse Offers", "color": "red"},
            "variant_a": {"text": "See Current Deals", "color": "green"},
            "variant_b": {"text": "View All Offers →", "color": "blue"}
        }
    )
}

def get_ab_test(test_name, user_id):
    """Get variant for a specific test and user"""
    test = ACTIVE_TESTS.get(test_name)
    if not test:
        return None
    return test.get_variant_config(user_id)

def track_conversion(test_name, variant, user_id, action):
    """Track conversion event (would save to DB in production)"""
    # In production: save to database for analytics
    import logging
    logger = logging.getLogger(__name__)
    logger.info(f"A/B Conversion: {test_name} | {variant} | {user_id} | {action}")
    return True
