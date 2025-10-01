// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract DJZSSubscribeNFT is ERC721, Ownable {
    using Strings for uint256;

    uint256 public maxSupply = 7777;
    uint256 public totalSupply;
    uint256 public price; // in wei
    string private _baseTokenURI;
    mapping(address => bool) public minted;

    event Subscribed(address indexed subscriber, uint256 tokenId);

    constructor(
        string memory name_,
        string memory symbol_,
        uint256 priceWei_,
        string memory baseURI_
    ) ERC721(name_, symbol_) Ownable(msg.sender) {
        price = priceWei_;
        _baseTokenURI = baseURI_;
    }

    function setBaseURI(string calldata uri) external onlyOwner {
        _baseTokenURI = uri;
    }

    function setPrice(uint256 newPrice) external onlyOwner {
        price = newPrice;
    }

    function setMaxSupply(uint256 newMaxSupply) external onlyOwner {
        maxSupply = newMaxSupply;
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    function mintSubscribe() external payable {
        require(!minted[msg.sender], "Already minted");
        require(totalSupply < maxSupply, "Sold out");
        require(msg.value >= price, "Insufficient payment");

        minted[msg.sender] = true;
        uint256 tokenId = ++totalSupply;
        _safeMint(msg.sender, tokenId);
        
        emit Subscribed(msg.sender, tokenId);
    }

    function withdraw() external onlyOwner {
        (bool success, ) = payable(owner()).call{value: address(this).balance}("");
        require(success, "Withdrawal failed");
    }
}
