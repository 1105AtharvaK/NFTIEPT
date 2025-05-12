// Update mintReceipt to be payable and require msg.value
function mintReceipt(string memory itemName, uint256 priceInWei) public payable returns (uint256) {
    require(msg.value == priceInWei, "Incorrect payment");
    // ... existing mint logic ...
} 