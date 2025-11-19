"""
CargwinGPT - AI Assistant for hunter.lease
OpenAI GPT-4o integration using emergentintegrations
"""
import os
import logging
from emergentintegrations.llm.chat import LlmChat, UserMessage
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

# System prompt для CargwinGPT
SYSTEM_PROMPT = """You are CargwinGPT, an AI assistant for Hunter.Lease/Cargwin, a California-based new car leasing service.

Your role: Replace human salespeople completely. Guide customers through car selection and online approval.

Key Facts About Hunter.Lease:
- 100% online platform
- New cars only
- Fleet-level pricing ($5K-$15K below retail)
- No dealer add-ons, no haggling
- Credit Tiers 1-6 welcome (680+ credit score)
- California residents only
- Free home delivery
- Soft credit check first (no score impact)
- E-sign contracts online
- 0-2 day delivery

Philosophy:
- Be honest, never pressure
- Explain leasing terms simply
- Respect customer's budget
- Offer 3-5 options max
- Guide to online approval
- No phone calls required

When customer asks for car recommendations:
1. Ask budget (monthly payment)
2. Ask credit tier (1-6, or score range)
3. Ask preferences (SUV/Sedan/Hybrid/Electric)
4. Ask favorite brands
5. Query inventory API
6. Present 3-5 best matches

Response format for car recommendations:
```json
{
  "type": "cars",
  "message": "Here are the best options for you:",
  "results": [...]
}
```

Response format for explanations:
```json
{
  "type": "explanation",
  "topic": "topic_name",
  "answer": "explanation text"
}
```

Response format for application:
```json
{
  "type": "application",
  "message": "Ready to apply?",
  "url": "/dashboard/profile"
}
```

Never invent cars - only use real inventory from API.
Always be transparent about pricing.
Explain that we serve CA residents only.
"""

async def chat_with_cargwin_gpt(message: str, session_id: str, chat_history: list = None):
    """
    Send message to CargwinGPT and get response
    
    Args:
        message: User's message
        session_id: Unique session ID for conversation
        chat_history: Previous messages (optional)
        
    Returns:
        dict: {response: str, requires_action: str, data: dict}
    """
    try:
        # Get API key
        api_key = os.getenv('EMERGENT_LLM_KEY')
        if not api_key:
            raise ValueError("EMERGENT_LLM_KEY not found in environment")
        
        # Initialize chat
        chat = LlmChat(
            api_key=api_key,
            session_id=session_id,
            system_message=SYSTEM_PROMPT
        ).with_model("openai", "gpt-4o")
        
        # Create user message
        user_message = UserMessage(text=message)
        
        # Send and get response
        response = await chat.send_message(user_message)
        
        logger.info(f"CargwinGPT response for session {session_id}: {response[:100]}...")
        
        # Parse response for actions
        import json
        try:
            # Try to parse as JSON (if GPT returns structured data)
            parsed = json.loads(response)
            return {
                "response": parsed.get("message", response),
                "type": parsed.get("type", "text"),
                "data": parsed.get("results") or parsed.get("data"),
                "raw": response
            }
        except json.JSONDecodeError:
            # Plain text response
            return {
                "response": response,
                "type": "text",
                "data": None,
                "raw": response
            }
            
    except Exception as e:
        logger.error(f"CargwinGPT error: {e}")
        return {
            "response": "I apologize, but I'm having trouble right now. Please try again or contact us at +1 (747) CARGWIN.",
            "type": "error",
            "data": None,
            "raw": str(e)
        }

async def get_car_recommendations(budget: int, tier: int, preferences: dict = None):
    """
    Get car recommendations from inventory based on criteria
    
    Args:
        budget: Max monthly payment
        tier: Credit tier (1-6)
        preferences: {body, powertrain, brands}
        
    Returns:
        list: Matching cars
    """
    # This would query real inventory
    # For now, return structure GPT can use
    return {
        "budget": budget,
        "tier": tier,
        "preferences": preferences,
        "note": "Query /api/cars and filter by these criteria"
    }
