"""
WebSocket support for real-time updates
Live FOMO counters, new offer notifications, etc.
"""
import socketio
import logging

logger = logging.getLogger(__name__)

# Create Socket.IO server
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins='*',
    logger=False
)

# Connected clients
connected_clients = set()

@sio.event
async def connect(sid, environ):
    """Client connected"""
    connected_clients.add(sid)
    logger.info(f"Client connected: {sid} (total: {len(connected_clients)})")
    await sio.emit('connected', {'message': 'Connected to hunter.lease'}, room=sid)

@sio.event
async def disconnect(sid):
    """Client disconnected"""
    connected_clients.discard(sid)
    logger.info(f"Client disconnected: {sid} (total: {len(connected_clients)})")

@sio.event
async def subscribe_to_offer(sid, data):
    """Subscribe to specific offer updates"""
    offer_id = data.get('offer_id')
    await sio.enter_room(sid, f"offer_{offer_id}")
    logger.info(f"Client {sid} subscribed to offer {offer_id}")

# Broadcast functions
async def broadcast_new_offer(offer_data):
    """Broadcast when new offer appears"""
    await sio.emit('new_offer', offer_data, namespace='/')
    logger.info(f"Broadcasted new offer: {offer_data.get('title')}")

async def update_fomo_counter(offer_id, viewers, confirmed):
    """Update FOMO counters for specific offer"""
    await sio.emit('fomo_update', {
        'offer_id': offer_id,
        'viewers': viewers,
        'confirmed': confirmed
    }, room=f"offer_{offer_id}")

async def notify_offer_booked(offer_id, location):
    """Notify when someone books an offer"""
    await sio.emit('offer_booked', {
        'offer_id': offer_id,
        'location': location,
        'message': f'Someone from {location} just booked this offer'
    }, room=f"offer_{offer_id}")

# Get Socket.IO app for mounting
def get_socketio_app():
    """Get Socket.IO ASGI app"""
    return socketio.ASGIApp(sio)
