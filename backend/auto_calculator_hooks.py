"""
Auto Calculator Hooks
Автоматически обновляет calculator_config_cached для лотов при сохранении
"""
from calculator_config_service import CalculatorConfigService
from motor.motor_asyncio import AsyncIOMotorDatabase
import logging
import re

logger = logging.getLogger(__name__)


def should_update_lot(lot: dict) -> bool:
    """
    Проверяет, нужно ли обновлять калькулятор для лота.
    
    Returns False если:
    - calculator_config_auto = False
    - есть manual JSON
    """
    if not lot.get('calculator_config_auto', True):
        return False
    
    manual_json = lot.get('calculator_config_manual_json')
    if manual_json and str(manual_json).strip():
        return False
    
    return True


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


async def update_lots_for_lease_program(program: dict, db: AsyncIOMotorDatabase):
    """
    Обновляет calculator_config_cached для всех лотов, подходящих под lease программу.
    
    Args:
        program: словарь с данными LeaseProgram
        db: database instance
    """
    brand = program.get('brand', '')
    year_from = program.get('year_from', 0)
    year_to = program.get('year_to', 9999)
    states = program.get('states', ['ALL'])
    model_pattern = program.get('model_pattern', '')
    
    logger.info(f"Updating lots for lease program: {brand} {year_from}-{year_to}")
    
    # Build query
    query = {
        'brand': {'$regex': f'^{re.escape(brand)}$', '$options': 'i'},
        'year': {'$gte': year_from, '$lte': year_to}
    }
    
    # State filter
    if 'ALL' not in states:
        query['state'] = {'$in': states}
    
    # Model pattern filter (if specified)
    if model_pattern:
        query['model'] = {'$regex': model_pattern, '$options': 'i'}
    
    # Find matching lots
    lots = await db.lots.find(query).to_list(length=None)
    
    logger.info(f"Found {len(lots)} lots matching lease program")
    
    updated_count = 0
    service = CalculatorConfigService(db)
    
    for lot in lots:
        try:
            if not should_update_lot(lot):
                continue
            
            # Generate new config
            config = await service.generate_calculator_config(lot['id'])
            
            # Update in database
            await db.lots.update_one(
                {'id': lot['id']},
                {'$set': {'calculator_config_cached': config}}
            )
            
            updated_count += 1
            logger.debug(f"Updated calculator for lot {lot['id']}")
            
        except Exception as e:
            logger.error(f"Failed to update lot {lot.get('id')}: {e}")
            continue
    
    logger.info(f"Updated {updated_count} lots for lease program {brand}")
    return updated_count


async def update_lots_for_finance_program(program: dict, db: AsyncIOMotorDatabase):
    """
    Обновляет calculator_config_cached для всех лотов, подходящих под finance программу.
    
    Args:
        program: словарь с данными FinanceProgram
        db: database instance
    """
    brand = program.get('brand', '')
    year_from = program.get('year_from', 0)
    year_to = program.get('year_to', 9999)
    states = program.get('states', ['ALL'])
    model_pattern = program.get('model_pattern', '')
    
    logger.info(f"Updating lots for finance program: {brand} {year_from}-{year_to}")
    
    # Build query (same logic as lease)
    query = {
        'brand': {'$regex': f'^{re.escape(brand)}$', '$options': 'i'},
        'year': {'$gte': year_from, '$lte': year_to}
    }
    
    if 'ALL' not in states:
        query['state'] = {'$in': states}
    
    if model_pattern:
        query['model'] = {'$regex': model_pattern, '$options': 'i'}
    
    lots = await db.lots.find(query).to_list(length=None)
    
    logger.info(f"Found {len(lots)} lots matching finance program")
    
    updated_count = 0
    service = CalculatorConfigService(db)
    
    for lot in lots:
        try:
            if not should_update_lot(lot):
                continue
            
            config = await service.generate_calculator_config(lot['id'])
            
            await db.lots.update_one(
                {'id': lot['id']},
                {'$set': {'calculator_config_cached': config}}
            )
            
            updated_count += 1
            logger.debug(f"Updated calculator for lot {lot['id']}")
            
        except Exception as e:
            logger.error(f"Failed to update lot {lot.get('id')}: {e}")
            continue
    
    logger.info(f"Updated {updated_count} lots for finance program {brand}")
    return updated_count


async def update_lots_for_tax_config(tax_config: dict, db: AsyncIOMotorDatabase):
    """
    Обновляет calculator_config_cached для всех лотов в указанном state/zip.
    
    Args:
        tax_config: словарь с данными TaxConfig
        db: database instance
    """
    state = tax_config.get('state', '')
    zip_prefixes = tax_config.get('zip_prefixes', [])
    
    logger.info(f"Updating lots for tax config: {state} {zip_prefixes}")
    
    # Build query
    query = {'state': state}
    
    # Filter by zip prefixes if specified
    if zip_prefixes:
        # MongoDB regex for multiple prefixes: ^(90|91|92)
        prefix_pattern = '^(' + '|'.join(re.escape(p) for p in zip_prefixes) + ')'
        query['zip'] = {'$regex': prefix_pattern}
    
    lots = await db.lots.find(query).to_list(length=None)
    
    logger.info(f"Found {len(lots)} lots matching tax config")
    
    updated_count = 0
    service = CalculatorConfigService(db)
    
    for lot in lots:
        try:
            if not should_update_lot(lot):
                continue
            
            config = await service.generate_calculator_config(lot['id'])
            
            await db.lots.update_one(
                {'id': lot['id']},
                {'$set': {'calculator_config_cached': config}}
            )
            
            updated_count += 1
            logger.debug(f"Updated calculator for lot {lot['id']}")
            
        except Exception as e:
            logger.error(f"Failed to update lot {lot.get('id')}: {e}")
            continue
    
    logger.info(f"Updated {updated_count} lots for tax config {state}")
    return updated_count
