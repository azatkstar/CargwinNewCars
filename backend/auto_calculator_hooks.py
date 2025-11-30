"""
Auto Calculator Hooks
Автоматически обновляет calculator_config_cached для лотов при сохранении
"""
from calculator_config_service import CalculatorConfigService
from motor.motor_asyncio import AsyncIOMotorDatabase
import logging

logger = logging.getLogger(__name__)


async def update_lot_calculator_config(lot_dict: dict, db: AsyncIOMotorDatabase):
    """
    Автоматически обновляет calculator_config_cached для лота.

    Логика:
    - если calculator_config_auto = False → ничего не делаем
    - если есть calculator_config_manual_json (ручной JSON) → авто-конфиг не трогаем
    - иначе вызываем generate_calculator_config(lot.id) и сохраняем результат в lot.calculator_config_cached
    
    Args:
        lot_dict: словарь с данными лота
        db: database instance
    """
    # Проверяем включён ли авто-режим (по умолчанию True)
    calculator_config_auto = lot_dict.get('calculator_config_auto', True)
    
    if not calculator_config_auto:
        logger.info(f"Lot {lot_dict.get('id')}: auto calculator disabled, skipping")
        return lot_dict
    
    # Проверяем есть ли ручной JSON
    manual_json = lot_dict.get('calculator_config_manual_json')
    if manual_json and manual_json.strip():
        logger.info(f"Lot {lot_dict.get('id')}: manual JSON provided, skipping auto-generation")
        return lot_dict
    
    # Генерируем конфиг
    try:
        service = CalculatorConfigService(db)
        config = await service.generate_calculator_config(lot_dict.get('id'))
        lot_dict['calculator_config_cached'] = config
        logger.info(f"Lot {lot_dict.get('id')}: calculator config auto-generated")
    except Exception as e:
        logger.error(f"Lot {lot_dict.get('id')}: failed to generate calculator config: {e}")
        # Не блокируем сохранение лота если генерация не удалась
        lot_dict['calculator_config_cached'] = {}
    
    return lot_dict
