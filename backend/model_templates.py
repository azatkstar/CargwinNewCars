#!/usr/bin/env python3
"""
Model Templates Database - Popular models from AutoBandit
Pre-populated data for quick lot creation
"""

MODEL_TEMPLATES = {
    # TOYOTA
    "Toyota Camry": {
        "msrp_range": [28000, 38000],
        "residual_24mo": 64, "residual_36mo": 57, "residual_39mo": 55, "residual_48mo": 50,
        "money_factor_base": 0.00182,
        "acquisition_fee": 650,
        "trims": ["LE", "SE", "XLE", "XSE", "TRD"],
        "fuel_type": "Gas/Hybrid",
        "standard_options": ["Apple CarPlay", "Android Auto", "Toyota Safety Sense"],
        "image_url": "https://www.toyota.com/imgix/content/dam/toyota/jellies/max/2024/camry/xle-fwd/040.png"
    },
    "Toyota RAV4": {
        "msrp_range": [30000, 42000],
        "residual_24mo": 63, "residual_36mo": 56, "residual_39mo": 54, "residual_48mo": 49,
        "money_factor_base": 0.00187,
        "acquisition_fee": 650,
        "trims": ["LE", "XLE", "XLE Premium", "Adventure", "TRD Off-Road", "Limited"],
        "fuel_type": "Gas/Hybrid",
        "standard_options": ["AWD Available", "Apple CarPlay", "Safety Sense 2.5"],
        "image_url": "https://www.toyota.com/imgix/content/dam/toyota/jellies/max/2024/rav4/xle-fwd/040.png"
    },
    "Toyota Highlander": {
        "msrp_range": [38000, 52000],
        "residual_24mo": 62, "residual_36mo": 55, "residual_39mo": 53, "residual_48mo": 48,
        "money_factor_base": 0.00192,
        "acquisition_fee": 650,
        "trims": ["L", "LE", "XLE", "XSE", "Limited", "Platinum"],
        "fuel_type": "Gas/Hybrid",
        "standard_options": ["3-Row Seating", "AWD", "Safety Sense 2.5+"],
        "image_url": "https://www.toyota.com/imgix/content/dam/toyota/jellies/max/2024/highlander/xle-awd/218.png"
    },
    "Toyota Tacoma": {
        "msrp_range": [32000, 50000],
        "residual_24mo": 65, "residual_36mo": 58, "residual_39mo": 56, "residual_48mo": 51,
        "money_factor_base": 0.00182,
        "acquisition_fee": 650,
        "trims": ["SR", "SR5", "TRD Sport", "TRD Off-Road", "Limited", "TRD Pro"],
        "fuel_type": "Gas",
        "standard_options": ["4WD Available", "Bed Access", "Tow Package Available"],
        "image_url": "https://www.toyota.com/imgix/content/dam/toyota/jellies/max/2024/tacoma/sr-4x2-access-cab/040.png"
    },
    "Toyota Corolla": {
        "msrp_range": [22000, 30000],
        "residual_24mo": 62, "residual_36mo": 55, "residual_39mo": 53, "residual_48mo": 48,
        "money_factor_base": 0.00177,
        "acquisition_fee": 650,
        "trims": ["L", "LE", "SE", "XLE", "XSE"],
        "fuel_type": "Gas/Hybrid",
        "standard_options": ["Toyota Safety Sense 3.0", "Apple CarPlay", "LED Headlights"],
        "image_url": "https://www.toyota.com/imgix/content/dam/toyota/jellies/max/2024/corolla/se/040.png"
    },
    
    # LEXUS
    "Lexus ES": {
        "msrp_range": [42000, 52000],
        "residual_24mo": 60, "residual_36mo": 53, "residual_39mo": 51, "residual_48mo": 46,
        "money_factor_base": 0.00197,
        "acquisition_fee": 925,
        "trims": ["ES 250", "ES 350", "ES 350 F Sport", "ES 300h"],
        "fuel_type": "Gas/Hybrid",
        "standard_options": ["Lexus Safety System+ 3.0", "Mark Levinson Audio", "Leather"],
        "image_url": "https://www.lexus.com/models/ES/gallery"
    },
    "Lexus RX": {
        "msrp_range": [48000, 70000],
        "residual_24mo": 59, "residual_36mo": 52, "residual_39mo": 50, "residual_48mo": 45,
        "money_factor_base": 0.00202,
        "acquisition_fee": 925,
        "trims": ["RX 350", "RX 350h", "RX 350 F Sport", "RX 450h+", "RX 500h F Sport"],
        "fuel_type": "Gas/Hybrid/Plugin",
        "standard_options": ["AWD", "LSS+ 3.0", "Premium Audio", "Panoramic Roof"],
        "image_url": "https://www.lexus.com/models/RX/gallery"
    },
    "Lexus NX": {
        "msrp_range": [40000, 52000],
        "residual_24mo": 58, "residual_36mo": 51, "residual_39mo": 49, "residual_48mo": 44,
        "money_factor_base": 0.00197,
        "acquisition_fee": 925,
        "trims": ["NX 250", "NX 350", "NX 350h", "NX 450h+"],
        "fuel_type": "Gas/Hybrid/Plugin",
        "standard_options": ["Compact Luxury", "LSS+ 2.5", "Apple CarPlay"],
        "image_url": "https://www.lexus.com/models/NX/gallery"
    },
    
    # GENESIS
    "Genesis G80": {
        "msrp_range": [50000, 68000],
        "residual_24mo": 58, "residual_36mo": 51, "residual_39mo": 49, "residual_48mo": 44,
        "money_factor_base": 0.00212,
        "acquisition_fee": 895,
        "trims": ["2.5T", "2.5T Advanced", "3.5T Sport", "3.5T Sport Prestige"],
        "fuel_type": "Gas",
        "standard_options": ["Genesis Active Safety", "Premium Audio", "Nappa Leather"],
        "image_url": "https://www.genesis.com/us/en/models/g80"
    },
    "Genesis GV80": {
        "msrp_range": [56000, 78000],
        "residual_24mo": 57, "residual_36mo": 50, "residual_39mo": 48, "residual_48mo": 43,
        "money_factor_base": 0.00217,
        "acquisition_fee": 895,
        "trims": ["2.5T", "2.5T Advanced", "3.5T", "3.5T Prestige"],
        "fuel_type": "Gas",
        "standard_options": ["AWD", "3-Row Available", "Highway Driving Assist"],
        "image_url": "https://www.genesis.com/us/en/models/gv80"
    },
    
    # BMW
    "BMW 3 Series": {
        "msrp_range": [44000, 58000],
        "residual_24mo": 60, "residual_36mo": 53, "residual_39mo": 51, "residual_48mo": 46,
        "money_factor_base": 0.00227,
        "acquisition_fee": 925,
        "trims": ["330i", "330i xDrive", "M340i", "M340i xDrive"],
        "fuel_type": "Gas",
        "standard_options": ["BMW Live Cockpit", "Driving Assistant", "Sensatec Upholstery"],
        "image_url": "https://www.bmwusa.com/content/dam/bmwusa/3-series"
    },
    "BMW X5": {
        "msrp_range": [62000, 85000],
        "residual_24mo": 58, "residual_36mo": 51, "residual_39mo": 49, "residual_48mo": 44,
        "money_factor_base": 0.00237,
        "acquisition_fee": 925,
        "trims": ["sDrive40i", "xDrive40i", "xDrive45e", "M50i"],
        "fuel_type": "Gas/Hybrid",
        "standard_options": ["xDrive AWD", "Panoramic Roof", "Harman Kardon"],
        "image_url": "https://www.bmwusa.com/content/dam/bmwusa/x5"
    },
    
    # MERCEDES-BENZ
    "Mercedes-Benz C-Class": {
        "msrp_range": [45000, 62000],
        "residual_24mo": 59, "residual_36mo": 52, "residual_39mo": 50, "residual_48mo": 45,
        "money_factor_base": 0.00232,
        "acquisition_fee": 1095,
        "trims": ["C 300", "C 300 4MATIC", "AMG C 43"],
        "fuel_type": "Gas",
        "standard_options": ["MBUX", "Active Brake Assist", "MB-Tex Upholstery"],
        "image_url": "https://www.mbusa.com/en/vehicles/class/c-class/sedan"
    },
    "Mercedes-Benz GLE": {
        "msrp_range": [58000, 82000],
        "residual_24mo": 57, "residual_36mo": 50, "residual_39mo": 48, "residual_48mo": 43,
        "money_factor_base": 0.00242,
        "acquisition_fee": 1095,
        "trims": ["GLE 350", "GLE 350 4MATIC", "GLE 450 4MATIC", "AMG GLE 53"],
        "fuel_type": "Gas/Hybrid",
        "standard_options": ["4MATIC AWD", "MBUX", "Burmester Sound"],
        "image_url": "https://www.mbusa.com/en/vehicles/class/gle/suv"
    },
    
    # HYUNDAI
    "Hyundai Elantra": {
        "msrp_range": [21000, 28000],
        "residual_24mo": 61, "residual_36mo": 54, "residual_39mo": 52, "residual_48mo": 47,
        "money_factor_base": 0.00172,
        "acquisition_fee": 595,
        "trims": ["SE", "SEL", "N Line", "Limited"],
        "fuel_type": "Gas/Hybrid",
        "standard_options": ["Hyundai SmartSense", "8-inch Display", "Wireless CarPlay"],
        "image_url": "https://www.hyundaiusa.com/us/en/vehicles/elantra"
    },
    "Hyundai Tucson": {
        "msrp_range": [28000, 38000],
        "residual_24mo": 60, "residual_36mo": 53, "residual_39mo": 51, "residual_48mo": 46,
        "money_factor_base": 0.00182,
        "acquisition_fee": 595,
        "trims": ["SE", "SEL", "N Line", "Limited"],
        "fuel_type": "Gas/Hybrid/Plugin",
        "standard_options": ["AWD Available", "SmartSense", "10.25-inch Display"],
        "image_url": "https://www.hyundaiusa.com/us/en/vehicles/tucson"
    },
    
    # KIA
    "Kia K5": {
        "msrp_range": [25000, 35000],
        "residual_24mo": 60, "residual_36mo": 53, "residual_39mo": 51, "residual_48mo": 46,
        "money_factor_base": 0.00177,
        "acquisition_fee": 595,
        "trims": ["LX", "LXS", "GT-Line", "EX", "GT"],
        "fuel_type": "Gas",
        "standard_options": ["Kia Drive Wise", "8-inch Touchscreen", "Wireless CarPlay"],
        "image_url": "https://www.kia.com/us/en/k5"
    },
    "Kia Sportage": {
        "msrp_range": [27000, 38000],
        "residual_24mo": 59, "residual_36mo": 52, "residual_39mo": 50, "residual_48mo": 45,
        "money_factor_base": 0.00182,
        "acquisition_fee": 595,
        "trims": ["LX", "EX", "X-Line", "SX", "SX Prestige"],
        "fuel_type": "Gas/Hybrid/Plugin",
        "standard_options": ["AWD", "Panoramic Sunroof", "Drive Wise Safety"],
        "image_url": "https://www.kia.com/us/en/sportage"
    }
    
    # NOTE: Добавлю остальные бренды (Ford, Mazda, Nissan, Subaru, VW) в следующей итерации
    # Это базовые шаблоны для начала
}

# Function to get template
def get_model_template(make, model):
    """Get template data for a specific make/model"""
    key = f"{make} {model}"
    return MODEL_TEMPLATES.get(key, None)

# Function to list all available models
def list_available_models():
    """Get list of all available model templates"""
    return list(MODEL_TEMPLATES.keys())
