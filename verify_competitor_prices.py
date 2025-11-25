#!/usr/bin/env python3
"""
Verify competitor prices were added to RX350 Premium
"""

import requests
import json

def verify_competitor_prices():
    # Get auth token
    auth_response = requests.post('https://carlease-pro.preview.emergentagent.com/api/auth/magic', 
                                 json={'email': 'admin@cargwin.com'})
    token = auth_response.json()['debug_token']

    verify_response = requests.post('https://carlease-pro.preview.emergentagent.com/api/auth/verify',
                                   json={'token': token})
    access_token = verify_response.json()['access_token']

    # Get the RX350 Premium lot
    headers = {'Authorization': f'Bearer {access_token}'}
    response = requests.get('https://carlease-pro.preview.emergentagent.com/api/admin/lots/690bbe50e52e2fafa277660e', 
                           headers=headers)

    if response.status_code == 200:
        lot_data = response.json()
        print('✅ RX350 Premium Lot Details:')
        print(f'   Make: {lot_data.get("make")}')
        print(f'   Model: {lot_data.get("model")}')
        print(f'   Trim: {lot_data.get("trim")}')
        print(f'   Year: {lot_data.get("year")}')
        print(f'   MSRP: ${lot_data.get("msrp"):,}')
        print(f'   Discount: ${lot_data.get("discount"):,}')
        print(f'   Fleet Price: ${lot_data.get("msrp", 0) - lot_data.get("discount", 0):,}')
        print()
        
        competitor_prices = lot_data.get('competitor_prices', {})
        if competitor_prices:
            print('💰 Competitor Prices Added Successfully:')
            print(json.dumps(competitor_prices, indent=2))
            
            # Calculate savings
            current_monthly = 577  # RX350 Premium monthly payment
            autobandit_monthly = competitor_prices.get('autobandit', {}).get('monthly', 0)
            dealer_monthly = competitor_prices.get('dealerAverage', {}).get('monthly', 0)
            
            if autobandit_monthly and dealer_monthly:
                print()
                print('💵 Price Comparison:')
                print(f'   Our Price: ${current_monthly}/month')
                print(f'   AutoBandit: ${autobandit_monthly}/month')
                print(f'   Dealer Average: ${dealer_monthly}/month')
                print()
                print('💸 Savings:')
                print(f'   vs AutoBandit: ${autobandit_monthly - current_monthly}/month')
                print(f'   vs Dealers: ${dealer_monthly - current_monthly}/month')
                
                return True
        else:
            print('❌ No competitor prices found!')
            return False
    else:
        print(f'❌ Failed to get lot data: HTTP {response.status_code}')
        return False

if __name__ == "__main__":
    verify_competitor_prices()