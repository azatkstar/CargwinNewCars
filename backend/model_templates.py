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
    },
    
    # FORD
    "Ford F-150": {
        "msrp_range": [38000, 72000],
        "residual_24mo": 63, "residual_36mo": 56, "residual_39mo": 54, "residual_48mo": 49,
        "money_factor_base": 0.00192,
        "acquisition_fee": 695,
        "trims": ["XL", "STX", "XLT", "Lariat", "King Ranch", "Platinum", "Limited"],
        "fuel_type": "Gas/Hybrid/Electric",
        "standard_options": ["4WD", "Tow Package", "SYNC 4"],
        "image_url": "https://www.ford.com/trucks/f150"
    },
    "Ford Mustang": {
        "msrp_range": [30000, 52000],
        "residual_24mo": 58, "residual_36mo": 51, "residual_39mo": 49, "residual_48mo": 44,
        "money_factor_base": 0.00207,
        "acquisition_fee": 695,
        "trims": ["EcoBoost", "EcoBoost Premium", "GT", "GT Premium", "Mach 1"],
        "fuel_type": "Gas",
        "standard_options": ["RWD", "Performance Pkg", "Premium Audio"],
        "image_url": "https://www.ford.com/cars/mustang"
    },
    "Ford Explorer": {
        "msrp_range": [38000, 58000],
        "residual_24mo": 59, "residual_36mo": 52, "residual_39mo": 50, "residual_48mo": 45,
        "money_factor_base": 0.00197,
        "acquisition_fee": 695,
        "trims": ["Base", "XLT", "Limited", "ST", "Platinum"],
        "fuel_type": "Gas/Hybrid",
        "standard_options": ["3-Row", "4WD", "Co-Pilot360"],
        "image_url": "https://www.ford.com/suvs/explorer"
    },
    
    # MAZDA
    "Mazda CX-5": {
        "msrp_range": [28000, 40000],
        "residual_24mo": 60, "residual_36mo": 53, "residual_39mo": 51, "residual_48mo": 46,
        "money_factor_base": 0.00187,
        "acquisition_fee": 650,
        "trims": ["2.5 S", "2.5 S Select", "2.5 S Preferred", "2.5 S Premium", "2.5 Turbo"],
        "fuel_type": "Gas",
        "standard_options": ["AWD Available", "i-Activsense", "Mazda Connect"],
        "image_url": "https://www.mazdausa.com/vehicles/cx-5"
    },
    "Mazda3": {
        "msrp_range": [24000, 32000],
        "residual_24mo": 59, "residual_36mo": 52, "residual_39mo": 50, "residual_48mo": 45,
        "money_factor_base": 0.00177,
        "acquisition_fee": 650,
        "trims": ["2.5 S", "2.5 S Select", "2.5 S Preferred", "2.5 Turbo"],
        "fuel_type": "Gas",
        "standard_options": ["i-Activsense", "Apple CarPlay", "Premium Audio"],
        "image_url": "https://www.mazdausa.com/vehicles/mazda3-sedan"
    },
    "Mazda CX-90": {
        "msrp_range": [42000, 58000],
        "residual_24mo": 58, "residual_36mo": 51, "residual_39mo": 49, "residual_48mo": 44,
        "money_factor_base": 0.00197,
        "acquisition_fee": 650,
        "trims": ["3.3 Turbo", "3.3 Turbo S", "e-Skyactiv PHEV"],
        "fuel_type": "Gas/Plugin Hybrid",
        "standard_options": ["3-Row", "AWD", "i-Activsense"],
        "image_url": "https://www.mazdausa.com/vehicles/cx-90"
    },
    
    # NISSAN
    "Nissan Altima": {
        "msrp_range": [26000, 35000],
        "residual_24mo": 59, "residual_36mo": 52, "residual_39mo": 50, "residual_48mo": 45,
        "money_factor_base": 0.00177,
        "acquisition_fee": 695,
        "trims": ["S", "SV", "SR", "SL", "Platinum"],
        "fuel_type": "Gas",
        "standard_options": ["Nissan Safety Shield 360", "ProPILOT Assist", "Zero Gravity Seats"],
        "image_url": "https://www.nissanusa.com/vehicles/sedans/altima"
    },
    "Nissan Rogue": {
        "msrp_range": [29000, 40000],
        "residual_24mo": 60, "residual_36mo": 53, "residual_39mo": 51, "residual_48mo": 46,
        "money_factor_base": 0.00187,
        "acquisition_fee": 695,
        "trims": ["S", "SV", "SL", "Platinum"],
        "fuel_type": "Gas",
        "standard_options": ["AWD", "ProPILOT Assist", "Nissan Connect"],
        "image_url": "https://www.nissanusa.com/vehicles/crossovers-suvs/rogue"
    },
    "Nissan Ariya": {
        "msrp_range": [40000, 58000],
        "residual_24mo": 55, "residual_36mo": 48, "residual_39mo": 46, "residual_48mo": 41,
        "money_factor_base": 0.00207,
        "acquisition_fee": 695,
        "trims": ["Engage", "Venture+", "Evolve+", "Empower+", "Platinum+"],
        "fuel_type": "Electric",
        "standard_options": ["AWD Available", "ProPILOT Assist 2.0", "e-4ORCE"],
        "image_url": "https://www.nissanusa.com/vehicles/electric-cars/ariya"
    },
    
    # SUBARU
    "Subaru Outback": {
        "msrp_range": [29000, 42000],
        "residual_24mo": 61, "residual_36mo": 54, "residual_39mo": 52, "residual_48mo": 47,
        "money_factor_base": 0.00187,
        "acquisition_fee": 650,
        "trims": ["Base", "Premium", "Onyx Edition", "Limited", "Touring", "Wilderness"],
        "fuel_type": "Gas",
        "standard_options": ["AWD Standard", "EyeSight", "Boxer Engine"],
        "image_url": "https://www.subaru.com/vehicles/outback"
    },
    "Subaru Forester": {
        "msrp_range": [28000, 38000],
        "residual_24mo": 60, "residual_36mo": 53, "residual_39mo": 51, "residual_48mo": 46,
        "money_factor_base": 0.00182,
        "acquisition_fee": 650,
        "trims": ["Base", "Premium", "Sport", "Limited", "Touring"],
        "fuel_type": "Gas",
        "standard_options": ["AWD Standard", "EyeSight", "X-Mode"],
        "image_url": "https://www.subaru.com/vehicles/forester"
    },
    "Subaru Crosstrek": {
        "msrp_range": [25000, 35000],
        "residual_24mo": 61, "residual_36mo": 54, "residual_39mo": 52, "residual_48mo": 47,
        "money_factor_base": 0.00177,
        "acquisition_fee": 650,
        "trims": ["Base", "Premium", "Sport", "Limited"],
        "fuel_type": "Gas/Hybrid",
        "standard_options": ["AWD Standard", "EyeSight", "Ground Clearance 8.7in"],
        "image_url": "https://www.subaru.com/vehicles/crosstrek"
    },
    
    # VOLKSWAGEN
    "Volkswagen Jetta": {
        "msrp_range": [22000, 32000],
        "residual_24mo": 59, "residual_36mo": 52, "residual_39mo": 50, "residual_48mo": 45,
        "money_factor_base": 0.00182,
        "acquisition_fee": 675,
        "trims": ["S", "SE", "SEL", "SEL Premium"],
        "fuel_type": "Gas",
        "standard_options": ["IQ.Drive", "App-Connect", "LED Headlights"],
        "image_url": "https://www.vw.com/en/models/jetta"
    },
    "Volkswagen Tiguan": {
        "msrp_range": [28000, 40000],
        "residual_24mo": 58, "residual_36mo": 51, "residual_39mo": 49, "residual_48mo": 44,
        "money_factor_base": 0.00192,
        "acquisition_fee": 675,
        "trims": ["S", "SE", "SEL", "SEL Premium R-Line"],
        "fuel_type": "Gas",
        "standard_options": ["3-Row Available", "4MOTION AWD", "IQ.Drive"],
        "image_url": "https://www.vw.com/en/models/tiguan"
    },
    "Volkswagen ID.4": {
        "msrp_range": [40000, 52000],
        "residual_24mo": 54, "residual_36mo": 47, "residual_39mo": 45, "residual_48mo": 40,
        "money_factor_base": 0.00207,
        "acquisition_fee": 675,
        "trims": ["Standard", "Pro", "Pro S", "Pro S Plus"],
        "fuel_type": "Electric",
        "standard_options": ["AWD Available", "IQ.Light", "ID.Cockpit"],
        "image_url": "https://www.vw.com/en/models/id-4"
    }
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
