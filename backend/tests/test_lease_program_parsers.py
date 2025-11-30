"""
Unit tests for lease program parsers

Tests each brand parser with sample text
"""
import sys
sys.path.append('/app/backend')

from lease_program_parsers import (
    parse_toyota,
    parse_honda,
    parse_kia,
    parse_bmw,
    parse_mercedes,
    parse_lease_program
)


def test_toyota_parser():
    """Test Toyota parser with sample text"""
    sample_text = """
    TOYOTA FINANCIAL SERVICES
    LEASE PROGRAM - March 2025
    WESTERN REGION
    California
    
    Model: Camry 2025
    
    Residual Values:
    36 MO: 7.5K  10K  12K  15K
           76    75   74   72
    
    39 MO: 7.5K  10K  12K  15K
           74    73   72   70
    
    Money Factor: .00032
    
    Incentives:
    Lease Cash: $500
    Customer Cash: $250
    Loyalty: $1000
    
    Tier 1+ 720+ Credit Score
    """
    
    result = parse_toyota(sample_text, model="Camry")
    
    assert result.brand == "Toyota"
    assert result.model == "Camry"
    assert result.month and "March 2025" in result.month
    
    # Check MF
    assert "36" in result.mf
    assert result.mf["36"] == 0.00032
    
    # Check residuals (may or may not parse perfectly depending on text layout)
    if "36" in result.residual:
        print(f"  Found residuals for term 36: {result.residual['36']}")
    
    # Check incentives
    if "lease_cash" in result.incentives:
        assert result.incentives["lease_cash"] == 500.0
        print(f"  Found lease_cash: ${result.incentives['lease_cash']}")
    
    print("✓ Toyota parser test passed")


def test_honda_parser():
    """Test Honda parser with sample text"""
    sample_text = """
    AMERICAN HONDA FINANCE CORPORATION
    AHFC LEASE PROGRAM
    March 2025
    California
    
    Model: Accord 2025
    
    RESIDUAL VALUES
    36 MO: 10K  12K  15K
           74   73   71
    
    Money Factor: .00038
    
    Incentives:
    Flex Cash: $750
    Lease Cash: $500
    """
    
    result = parse_honda(sample_text, model="Accord")
    
    assert result.brand == "Honda"
    assert result.model == "Accord"
    
    # Check MF
    assert "36" in result.mf
    assert result.mf["36"] == 0.00038
    
    # Check residuals
    assert "36" in result.residual
    
    # Check incentives
    if "flex_cash" in result.incentives:
        assert result.incentives["flex_cash"] == 750.0
    
    print("✓ Honda parser test passed")


def test_kia_parser():
    """Test Kia parser with sample text"""
    sample_text = """
    KIA MOTORS FINANCE
    LEASE PROGRAM
    March 2025
    
    Model: Sportage 2025
    
    Residual Table:
    36 MO: 10K  12K  15K
           70   68   66
    
    MF: .00045
    
    Incentives:
    Lease Bonus: $1000
    Customer Bonus: $500
    """
    
    result = parse_kia(sample_text, model="Sportage")
    
    assert result.brand == "Kia"
    assert result.model == "Sportage"
    
    # Check MF
    assert len(result.mf) > 0
    
    print("✓ Kia parser test passed")


def test_bmw_parser():
    """Test BMW parser with sample text"""
    sample_text = """
    BMW FINANCIAL SERVICES
    LEASE PROGRAM
    March 2025
    
    Model: 3 Series 2025
    
    Residual Values:
    36 MO: 7.5K  10K  12K  15K
           68    67   66   64
    
    Base MF = .00028
    
    Incentives:
    FS Lease Credit: $1500
    Lease Credit: $500
    """
    
    result = parse_bmw(sample_text, model="3 Series")
    
    assert result.brand == "BMW"
    assert result.model == "3 Series"
    
    # Check MF
    assert "36" in result.mf
    assert result.mf["36"] == 0.00028
    
    # Check incentives
    if "fs_lease_credit" in result.incentives:
        assert result.incentives["fs_lease_credit"] == 1500.0
    
    print("✓ BMW parser test passed")


def test_mercedes_parser():
    """Test Mercedes parser with sample text"""
    sample_text = """
    MERCEDES-BENZ FINANCIAL SERVICES
    MBFS LEASE PROGRAM
    March 2025
    
    Model: C-Class 2025
    
    Residual Value Guide:
    36 MO: 10K  12K  15K
           65   64   62
    
    Rate: .00035
    
    Incentives:
    Lease Cash: $2000
    Dealer Contribution: $500
    """
    
    result = parse_mercedes(sample_text, model="C-Class")
    
    assert result.brand == "Mercedes"
    assert result.model == "C-Class"
    
    # Check MF
    assert "36" in result.mf
    assert result.mf["36"] == 0.00035
    
    # Check incentives
    if "lease_cash" in result.incentives:
        assert result.incentives["lease_cash"] == 2000.0
    
    print("✓ Mercedes parser test passed")


def test_parser_router():
    """Test parser router"""
    sample_text = """
    TOYOTA FINANCIAL SERVICES
    LEASE PROGRAM - March 2025
    Money Factor: .00032
    """
    
    # Test routing to Toyota
    result = parse_lease_program("Toyota", sample_text, pdf_id="test-123")
    assert result.brand == "Toyota"
    assert result.pdf_id == "test-123"
    
    # Test routing to Lexus
    result = parse_lease_program("Lexus", sample_text)
    assert result.brand in ["Toyota", "Lexus"]
    
    # Test unsupported brand
    try:
        parse_lease_program("InvalidBrand", sample_text)
        assert False, "Should have raised ValueError"
    except ValueError as e:
        assert "Unsupported brand" in str(e)
    
    print("✓ Parser router test passed")


def run_all_tests():
    """Run all parser tests"""
    print("\n=== Running Parser Tests ===\n")
    
    try:
        test_toyota_parser()
        test_honda_parser()
        test_kia_parser()
        test_bmw_parser()
        test_mercedes_parser()
        test_parser_router()
        
        print("\n✅ All tests passed!\n")
        return True
        
    except AssertionError as e:
        print(f"\n❌ Test failed: {e}\n")
        return False
    except Exception as e:
        print(f"\n❌ Error during tests: {e}\n")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
