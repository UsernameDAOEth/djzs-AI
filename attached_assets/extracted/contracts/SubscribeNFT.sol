// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract SubscribeNFT is ERC721, Ownable, ReentrancyGuard {
    using Strings for uint256;

    uint256 public price;
    uint256 public totalMinted;
    uint256 public immutable maxSupply;
    address payable public treasury;
    string private baseTokenURI;

    event PriceUpdated(uint256 newPrice);
    event TreasuryUpdated(address treasury);
    event BaseURIUpdated(string baseURI);

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _priceWei,
        address payable _treasury,
        string memory _baseTokenURI,
        uint256 _maxSupply
    ) ERC721(_name, _symbol) Ownable(msg.sender) {
        require(_treasury != address(0), "treasury required");
        price = _priceWei;
        treasury = _treasury;
        baseTokenURI = _baseTokenURI;
        maxSupply = _maxSupply;
    }

    function mint() external payable nonReentrant {
        require(msg.value == price, "Incorrect ETH amount");
        if (maxSupply != 0) {
            require(totalMinted < maxSupply, "Sold out");
        }
        uint256 tokenId = ++totalMinted;
        _safeMint(msg.sender, tokenId);
        if (msg.value > 0) {
            (bool ok, ) = treasury.call{ value: msg.value }("");
            require(ok, "treasury transfer failed");
        }
    }

    function setPrice(uint256 _priceWei) external onlyOwner {
        price = _priceWei;
        emit PriceUpdated(_priceWei);
    }

    function setTreasury(address payable _treasury) external onlyOwner {
        require(_treasury != address(0), "zero addr");
        treasury = _treasury;
        emit TreasuryUpdated(_treasury);
    }

    function setBaseURI(string calldata _baseTokenURI) external onlyOwner {
        baseTokenURI = _baseTokenURI;
        emit BaseURIUpdated(_baseTokenURI);
    }

    function withdraw() external onlyOwner {
        (bool ok, ) = treasury.call{ value: address(this).balance }("");
        require(ok, "withdraw failed");
    }

    function _baseURI() internal view override returns (string memory) {
        return baseTokenURI;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        string memory base = _baseURI();
        return bytes(base).length > 0
            ? string(abi.encodePacked(base, tokenId.toString(), ".json"))
            : "";
    }
}
